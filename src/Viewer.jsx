import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial, OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { cars, PLATES } from './cars.js';
import { Logo } from './Logo.jsx';

const DRACO = `${import.meta.env.BASE_URL}draco/`;
const PLATE_IMAGE = `${import.meta.env.BASE_URL}plate.jpg`;
const modelUrl = (file) => `${import.meta.env.BASE_URL}${file}`;
const LAMP_BLUE = '#7fb0ff'; // xenon-blue headlights
export const preloadCar = (car) => useGLTF.preload(modelUrl(car.model), DRACO);

// The car's front points to −x. Camera positions for the view buttons:
export const VIEWS = {
  'Front ¾': [-5.2, 1.55, 5.4],
  Side: [0, 1.3, 7.4],
  'Rear ¾': [5.4, 1.75, 5.0],
  Front: [-7.2, 1.25, 0.001],
  Rear: [7.2, 1.45, 0.001],
  Top: [0.001, 8.5, 0.001],
};
const HERO = new THREE.Vector3(...VIEWS['Front ¾']);

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const seg01 = (t, a, b) => clamp01((t - a) / (b - a));
// headlight "ignition" flicker; t = seconds since the switch
const ignition = (t) => (t < 0 ? 0 : t < 0.07 ? 1 : t < 0.17 ? 0.12 : t < 0.25 ? 1 : t < 0.31 ? 0.5 : 1);

// ─── Intro reel ──────────────────────────────────────────────────────────────
// One segment per car, each with its own camera language; the last car stays on screen afterwards.
// Every shot fills `o` for its local progress k (0→1) and the segment time lt:
//   o.pos / o.look (camera), o.fov, o.up, o.level (studio brightness 0–1), o.lamp (headlights 0–1),
//   o.driveX / o.pitch (car motion), o.sweep (moving light), o.fog ([near, far])
// Shot flags: cut (black flash before it), title (show the car name), caption (show the "presents" card),
//             wide (pull back on phones), crane (pull back gradually)
const DRIVE_FROM = 18;
export const INTRO = [
  { // 1 ─ Tiggo 8 Pro: drives out of the dark and brakes; close tracking shot along the flank
    car: 0, paint: 0, shots: [
      { len: 3.6, caption: true, wide: true, at(k, lt, o) {
        const e = easeInOut(k);
        o.driveX = DRIVE_FROM * (1 - easeOut(k));
        const d = lt - 3.48; o.pitch = 0.016 * Math.exp(-(d * d) / 0.09);
        o.pos.set(lerp(-7.4, -5.7, e), lerp(0.26, 0.36, e), lerp(1.7, 1.15, e));
        o.look.set(o.driveX * 0.55, 0.62, 0); o.fov = lerp(30, 23, e);
        o.level = 0.03; o.lamp = ignition(lt - 0.35); o.fog = [7, 24];
      } },
      { len: 3.4, cut: true, title: true, at(k, lt, o) {
        const e = easeInOut(k);
        const d = lt - 3.48; o.pitch = -0.006 * Math.exp(-((d - 0.4) ** 2) / 0.05);
        o.pos.set(lerp(-3.7, -0.4, e), lerp(0.66, 0.44, e), lerp(1.95, 3.15, e));
        o.look.set(lerp(-2.1, 0.4, e), lerp(0.78, 0.58, e), lerp(0.62, 0.85, e)); o.fov = lerp(27, 31, e);
        o.level = lerp(0.12, 0.4, e);
        o.sweep = { a: [-4, 2.4, 3.4], b: [3.5, 2.4, 3.4], ta: [-4, 0.6, 0], tb: [3.5, 0.6, 0], k };
      } },
    ],
  },
  { // 2 ─ Arrizo 8: top-down scan along the roof, then a low sideways dolly behind the car, tail lights glowing
    car: 1, paint: 5, shots: [
      { len: 3.2, cut: true, wide: true, at(k, lt, o) {
        const e = easeInOut(k), a = lerp(-0.18, 0.12, e);
        o.pos.set(lerp(1.7, -1.3, e), lerp(8.4, 6.8, e), 0.001);
        o.look.set(lerp(1.3, -0.9, e), 0, 0);
        o.up.set(-Math.cos(a), 0, Math.sin(a)); // the car's nose points up the screen, with a slight roll
        o.fov = 32; o.level = 0.2;
        o.sweep = { a: [-3.2, 3.6, 0], b: [3.2, 3.6, 0], ta: [-3.2, 0, 0], tb: [3.2, 0, 0], k };
      } },
      { len: 3.4, cut: true, title: true, at(k, lt, o) {
        const e = easeInOut(k);
        o.pos.set(lerp(3.95, 3.7, e), lerp(0.32, 0.44, e), lerp(-1.9, 1.9, e));
        o.look.set(2.0, 0.8, lerp(-0.5, 0.5, e)); o.fov = lerp(28, 25, e);
        o.level = lerp(0.3, 0.45, e);
        o.sweep = { a: [5.2, 3.0, -3], b: [5.2, 3.0, 3], ta: [2.2, 0.7, -1], tb: [2.2, 0.7, 1], k };
      } },
    ],
  },
  { // 3 ─ Omoda 5: slow low orbit round the nose while studio flashes fire like a photo shoot, then the lights ignite
    car: 2, paint: 1, shots: [
      { len: 3.4, cut: true, wide: true, at(k, lt, o) { omodaOrbit(lt / 6.6, lt, o); } },
      { len: 3.2, title: true, wide: true, at(k, lt, o) { omodaOrbit(lt / 6.6, lt, o); } },
    ],
  },
  { // 4 ─ J7: tail lights wake up, push in from behind; tracking shot along the wheels; crane up from the front to the hero angle
    car: 3, paint: 2, shots: [
      { len: 3.3, cut: true, at(k, lt, o) {
        const e = easeInOut(k);
        o.pos.set(lerp(7.2, 5.3, e), lerp(0.55, 0.8, e), lerp(0.4, 0.2, e));
        o.look.set(2.2, lerp(0.7, 0.8, e), 0); o.fov = lerp(26, 21, e);
        o.level = lerp(0.06, 0.16, e); o.lamp = ignition(lt - 0.5); o.fog = [7, 24];
        o.sweep = { a: [4.6, 3.2, -3], b: [4.6, 3.2, 3], ta: [2.2, 0.6, -1], tb: [2.2, 0.6, 1], k };
      } },
      { len: 2.4, cut: true, title: true, at(k, lt, o) {
        const e = easeInOut(k);
        o.pos.set(lerp(2.2, -1.9, e), 0.42, 2.7);
        o.look.set(lerp(1.3, -1.4, e), 0.5, 1.0); o.fov = 30;
        o.level = lerp(0.18, 0.38, e);
        o.sweep = { a: [3.5, 2.4, 3.4], b: [-4, 2.4, 3.4], ta: [3.5, 0.6, 0], tb: [-4, 0.6, 0], k };
      } },
      { len: 4.2, cut: true, crane: true, at(k, lt, o) {
        const e = easeInOut(k);
        const th = lerp(Math.PI + 0.85, Math.atan2(HERO.z, HERO.x), e);
        const r = lerp(5.0, Math.hypot(HERO.x, HERO.z), e);
        o.pos.set(Math.cos(th) * r, lerp(0.35, HERO.y, e), Math.sin(th) * r);
        o.look.set(lerp(-0.8, 0, e), lerp(0.5, 0.55, e), 0); o.fov = lerp(28, 32, e);
        o.level = lerp(0.38, 1, easeInOut(clamp01(k / 0.8)));
      } },
    ],
  },
];
function omodaOrbit(k, lt, o) {
  const e = easeInOut(clamp01(k));
  const th = lerp(Math.PI - 1.25, Math.PI + 1.05, e), r = lerp(6.0, 5.0, e);
  o.pos.set(Math.cos(th) * r, lerp(1.05, 0.55, e), Math.sin(th) * r);
  o.look.set(-0.7, lerp(0.75, 0.6, e), 0); o.fov = lerp(30, 27, e);
  let flash = 0; for (const f of [0.3, 1.0, 1.7, 2.4]) if (lt > f) flash += 0.95 * Math.exp(-(lt - f) * 3.2);
  o.level = 0.07 + Math.min(1, flash) + 0.42 * easeInOut(seg01(lt, 2.8, 4.0));
  o.lamp = ignition(lt - 2.9);
}
INTRO.forEach((s) => { s.len = s.shots.reduce((a, b) => a + b.len, 0); });
const INTRO_TOTAL = INTRO.reduce((a, s) => a + s.len, 0);

// ─── Car ─────────────────────────────────────────────────────────────────────
// Licence-plate meshes come with the model's own texture atlas; give them simple 0–1 UVs (front and rear plate
// separately, each readable from outside) so our AUTO MODIRAN plate image fits them.
function plateUVs(mesh) {
  const g = mesh.geometry;
  if (g.userData.plateUV) return;
  const pos = g.attributes.position, n = pos.count;
  const used = g.index ? new Set(g.index.array) : null;
  const w = [], v = new THREE.Vector3();
  for (let i = 0; i < n; i++) w.push(v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).clone());
  const uv = new Float32Array(n * 2);
  for (const side of [-1, 1]) {
    const ids = []; for (let i = 0; i < n; i++) if ((!used || used.has(i)) && Math.sign(w[i].x || 1) === side) ids.push(i);
    if (!ids.length) continue;
    let z0 = Infinity, z1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const i of ids) { z0 = Math.min(z0, w[i].z); z1 = Math.max(z1, w[i].z); y0 = Math.min(y0, w[i].y); y1 = Math.max(y1, w[i].y); }
    for (const i of ids) {
      const u = (w[i].z - z0) / (z1 - z0 || 1);
      uv[i * 2] = side < 0 ? u : 1 - u; // front plate is seen from −x, rear plate from +x
      uv[i * 2 + 1] = (w[i].y - y0) / (y1 - y0 || 1);
    }
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.userData.plateUV = true;
}

function Car({ car: info, paint, headlights, rig }) {
  const { scene } = useGLTF(modelUrl(info.model), DRACO);
  const plateMap = useLoader(THREE.TextureLoader, PLATE_IMAGE);
  const car = useMemo(() => scene.clone(true), [scene]);
  const drive = useRef();
  const paintMaterials = useRef([]);
  const lamps = useRef({ head: [], tail: [], glow: [] });
  const applied = useRef('');
  const [anchors, setAnchors] = useState(null);
  const [badgeAt, setBadgeAt] = useState(null);

  const plateMaterial = useMemo(() => {
    plateMap.colorSpace = THREE.SRGBColorSpace; plateMap.anisotropy = 8;
    return new THREE.MeshPhysicalMaterial({
      name: 'AutoModiranPlate', map: plateMap, side: THREE.DoubleSide,
      roughness: 0.3, metalness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.08, envMapIntensity: 0.9,
    });
  }, [plateMap]);

  useLayoutEffect(() => {
    paintMaterials.current = []; lamps.current = { head: [], tail: [], glow: [] }; applied.current = '';
    const swap = new Map();
    const plateMode = info.plates ?? PLATES;
    const plateNames = info.plateMaterials ?? ['LicensePlate', 'PlateHolder'];
    const plateMeshes = [], badgeMeshes = [];
    let bodyPaint = null;
    const getPaint = () => {
      if (!bodyPaint) {
        // clear-coated paint that keeps its colour: less metal, moderate reflections (the old one turned every colour white)
        bodyPaint = new THREE.MeshPhysicalMaterial({
          name: 'paint', color: paint, metalness: 0.32, roughness: 0.34,
          clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.95,
        });
        paintMaterials.current.push(bodyPaint);
      }
      return bodyPaint;
    };
    car.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true;
      // always start from the model's original material, so running this twice (React dev mode) is harmless
      const m = (o.userData.srcMaterial ??= o.material);
      const isPlate = plateNames.includes(m.name);
      o.visible = !(isPlate && plateMode === 'hide');
      if (info.badge && m.name === 'Badge') { o.visible = false; badgeMeshes.push(o); return; }
      if (isPlate && plateMode === 'logo' && m.name === 'LicensePlate') { plateMeshes.push(o); o.material = plateMaterial; return; }
      if (!swap.has(m)) {
        let next = m.clone();
        if (m.name === info.paintMaterial || (isPlate && plateMode === 'paint')) {
          next = getPaint();
        } else if (m.name === 'Headlight') {
          // front lamp lenses: glow hard (above 1.0 so the bloom pass picks them up)
          next.emissive = new THREE.Color('#cfe0ff'); next.emissiveIntensity = 0; next.toneMapped = false;
          next.transmission = 0; next.transparent = true; next.depthWrite = false;
          next.userData.baseOpacity = Math.min(next.opacity, 0.5);
          lamps.current.head.push(next);
        } else if (next.emissive && next.emissive.getHex() !== 0) {
          const c = next.emissive;
          const isRed = c.r > 0.3 && c.g < 0.2 && c.b < 0.2;
          next.userData.lamp = { color: c.clone(), intensity: next.emissiveIntensity || 1 };
          if (isRed) { next.toneMapped = false; lamps.current.tail.push(next); } else lamps.current.glow.push(next);
        }
        // Real glass refraction (transmission) costs an extra render pass; plain transparency looks the same here.
        if (next.transmission > 0) {
          next.transmission = 0; next.transparent = true;
          next.opacity = Math.min(next.opacity, 0.4); next.depthWrite = false;
        }
        swap.set(m, next);
      }
      o.material = swap.get(m);
    });

    // scale to the real length, face −x, centre on the origin, wheels on the floor
    car.rotation.set(0, 0, 0); car.position.set(0, 0, 0); car.scale.setScalar(1);
    car.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(car, true);
    let size = box.getSize(new THREE.Vector3());
    car.rotation.y = (size.z > size.x ? Math.PI / 2 : 0) + (info.yaw || 0);
    car.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(car, true); size = box.getSize(new THREE.Vector3());
    car.scale.setScalar(info.length / Math.max(size.x, size.z)); car.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(car, true);
    const c = box.getCenter(new THREE.Vector3());
    car.position.set(-c.x, -box.min.y, -c.z); car.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(car, true); size = box.getSize(new THREE.Vector3());
    const parentPos = (drive.current ? drive.current.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3()).negate();
    box.translate(parentPos);
    plateMeshes.forEach(plateUVs);

    // replacement badge (e.g. LUCANO) exactly where the original letters were, on the front of the grille
    if (badgeMeshes.length) {
      const bb = new THREE.Box3();
      badgeMeshes.forEach((bm) => bb.expandByObject(bm, true));
      bb.translate(parentPos);
      const bc = bb.getCenter(new THREE.Vector3()), bs = bb.getSize(new THREE.Vector3());
      setBadgeAt({ x: bb.min.x - 0.004, y: bc.y, z: bc.z, w: bs.z * 1.05 });
    } else setBadgeAt(null);

    // where the headlights are (fractions from cars.js → metres)
    const L = info.lamp ?? { front: 0.08, y: 0.5, side: 0.32 };
    setAnchors([1, -1].map((s) => new THREE.Vector3(box.min.x + L.front * size.x, box.min.y + L.y * size.y, s * L.side * size.z)));
    rig.readyId = info.id; // tells the intro director this car is on stage
  }, [car, info, plateMaterial, rig]);

  useEffect(() => { paintMaterials.current.forEach((m) => m.color.set(paint)); applied.current = ''; }, [paint, car]);

  useFrame(() => {
    const g = drive.current; if (!g) return;
    if (rig.running) {
      g.position.x = rig.driveX; g.rotation.z = rig.pitch;
      if (rig.paintHex && applied.current !== rig.paintHex) { paintMaterials.current.forEach((m) => m.color.set(rig.paintHex)); applied.current = rig.paintHex; }
    } else if (g.position.x !== 0 || g.rotation.z !== 0) { g.position.x = 0; g.rotation.z = 0; }
  });

  return (
    <group ref={drive}>
      <primitive object={car} />
      {anchors && <HeadLamps anchors={anchors} on={headlights} rig={rig} lamps={lamps} />}
      {badgeAt && info.badge && <Badge at={badgeAt} image={info.badge.image} />}
    </group>
  );
}

// Chrome badge decal facing forward (−x), reading left-to-right from the front
function Badge({ at, image }) {
  const map = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}${image}`);
  const mat = useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
    return new THREE.MeshPhysicalMaterial({ map, emissiveMap: map, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.55, transparent: true, alphaTest: 0.05, metalness: 0.3, roughness: 0.2, clearcoat: 1, envMapIntensity: 1.6 });
  }, [map]);
  const h = at.w * (map.image.height / map.image.width);
  return (
    <mesh position={[at.x, at.y, at.z]} rotation={[0, -Math.PI / 2, 0]} material={mat} renderOrder={2}>
      <planeGeometry args={[at.w, h]} />
    </mesh>
  );
}

// ─── Headlights: real spot lights + visible beams + lens glow + blue mist ────────────────
const beamVertex = /* glsl */`
  uniform float uLen; varying float vAlong; varying vec3 vN; varying vec3 vView; varying float vY;
  void main() {
    vAlong = -position.y / uLen;
    vY = (modelMatrix * vec4(position, 1.0)).y;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz; vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }`;
const beamFragment = /* glsl */`
  uniform float uOpacity; uniform vec3 uColor; varying float vAlong; varying vec3 vN; varying vec3 vView; varying float vY;
  void main() {
    float edge = pow(abs(dot(normalize(vN), normalize(vView))), 1.4);
    float fall = pow(1.0 - clamp(vAlong, 0.0, 1.0), 2.0) * smoothstep(0.0, 0.05, vAlong);
    float ground = smoothstep(0.0, 0.45, vY); // fade out before the beam meets the floor, so there is no hard edge
    gl_FragColor = vec4(uColor * uOpacity * edge * fall * ground, 1.0);
  }`;

let smokeTexture;
const getSmokeTexture = () => {
  if (smokeTexture) return smokeTexture;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 46; i++) {
    const x = 128 + (rnd() - 0.5) * 150, y = 128 + (rnd() - 0.5) * 150, r = 30 + rnd() * 70;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, `rgba(255,255,255,${0.05 + rnd() * 0.08})`); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  }
  smokeTexture = new THREE.CanvasTexture(c); smokeTexture.colorSpace = THREE.SRGBColorSpace;
  return smokeTexture;
};

let glowTexture;
const getGlowTexture = () => {
  if (glowTexture) return glowTexture;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.16, 'rgba(190,215,255,.6)'); r.addColorStop(1, 'rgba(90,140,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  glowTexture = new THREE.CanvasTexture(c); glowTexture.colorSpace = THREE.SRGBColorSpace;
  return glowTexture;
};

function HeadLamps({ anchors, on, rig, lamps }) {
  const level = useRef(0);
  const spots = useRef([]);
  const glows = useRef([]);
  const BEAM_LEN = 7, BEAM_R = 1.25;
  const lamp = useMemo(() => anchors.map((p, i) => {
    const s = i === 0 ? 1 : -1;
    const dir = new THREE.Vector3(-1, -0.075, s * 0.05).normalize();          // where the light points (lights the floor ahead)
    const beamDir = new THREE.Vector3(-1, -0.03, s * 0.05).normalize();       // the visible beam stays a bit higher
    const target = new THREE.Object3D(); target.position.copy(p).addScaledVector(dir, 8);
    const lightPos = p.clone(); lightPos.x -= 0.32; // the real light sits just ahead of the bumper so it lights the road, not the car's own nose
    const geo = new THREE.ConeGeometry(BEAM_R, BEAM_LEN, 40, 1, true); geo.translate(0, -BEAM_LEN / 2, 0);
    const mat = new THREE.ShaderMaterial({
      vertexShader: beamVertex, fragmentShader: beamFragment, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uLen: { value: BEAM_LEN }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color('#5f93ff') } },
    });
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), beamDir);
    return { p, dir, target, geo, mat, quat, lightPos };
  }), [anchors]);
  useEffect(() => () => lamp.forEach((l) => { l.geo.dispose(); l.mat.dispose(); }), [lamp]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const wp = useMemo(() => new THREE.Vector3(), []);
  // drifting mist in front of the car that the beams light up (the "fog" look of a night shoot)
  const front = Math.min(...anchors.map((a) => a.x));
  const mist = useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    x: front - 0.8 - (i % 5) * 1.05, y: 0.35 + ((i * 37) % 7) * 0.12, z: ((i * 53) % 9 - 4) * 0.38,
    s: 1.6 + ((i * 29) % 5) * 0.35, sp: 0.04 + ((i * 17) % 5) * 0.02, rot: i * 0.7, a: 0.6 + ((i * 13) % 5) * 0.1,
  })), [front]);
  const mistRefs = useRef([]);
  useFrame(({ camera, scene }, dt) => {
    const goal = rig.running ? rig.lamp : on ? 1 : 0;
    level.current += (goal - level.current) * (1 - Math.exp(-dt * (rig.running ? 50 : 9)));
    const L = level.current;
    const dark = 1 - Math.min(1, scene.environmentIntensity ?? 1); // beams only really show on a dark stage
    spots.current.forEach((s) => { if (s) s.intensity = 220 * L; });
    lamp.forEach((l, i) => {
      l.mat.uniforms.uOpacity.value = L * (0.03 + 0.17 * dark);
      const g = glows.current[i]; if (!g) return;
      // lens flare is strongest when the camera looks into the lamp
      tmp.copy(camera.position).sub(g.getWorldPosition(wp)).normalize();
      const facing = Math.max(0, tmp.dot(l.dir));
      g.material.opacity = L * Math.pow(facing, 3) * 0.55;
    });
    const time = performance.now() / 1000;
    mist.forEach((m, i) => {
      const sp = mistRefs.current[i]; if (!sp) return;
      sp.position.set(m.x + Math.sin(time * m.sp + i) * 0.35, m.y + Math.sin(time * m.sp * 0.7 + i * 2) * 0.08, m.z + Math.cos(time * m.sp + i) * 0.3);
      sp.material.rotation = m.rot + time * m.sp * 0.5;
      sp.material.opacity = L * m.a * (0.01 + 0.075 * dark);
    });
    lamps.current.head.forEach((m) => { m.emissiveIntensity = 7 * L; m.opacity = lerp(m.userData.baseOpacity, 0.95, L); });
    lamps.current.tail.forEach((m) => { m.emissive.copy(m.userData.lamp.color); m.emissiveIntensity = 0.25 + 3.2 * L; });
    lamps.current.glow.forEach((m) => { m.emissive.copy(m.userData.lamp.color); m.emissiveIntensity = m.userData.lamp.intensity * (0.15 + 0.85 * L); });
  });

  return [...lamp.map((l, i) => (
    <group key={i}>
      <primitive object={l.target} />
      <spotLight ref={(s) => { spots.current[i] = s; if (s) s.target = l.target; }} position={l.lightPos} angle={0.42} penumbra={0.75}
        decay={2} distance={30} color={LAMP_BLUE} intensity={0} />
      <mesh geometry={l.geo} material={l.mat} position={l.p} quaternion={l.quat} renderOrder={5} frustumCulled={false} />
      <sprite ref={(g) => { glows.current[i] = g; }} position={[l.p.x - 0.08, l.p.y, l.p.z]} scale={[0.42, 0.42, 1]} renderOrder={6}>
        <spriteMaterial map={getGlowTexture()} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0} toneMapped={false} color="#a9c8ff" />
      </sprite>
    </group>
  )), ...mist.map((m, i) => (
    <sprite key={`mist${i}`} ref={(sp) => { mistRefs.current[i] = sp; }} position={[m.x, m.y, m.z]} scale={[m.s, m.s * 0.6, 1]} renderOrder={4}>
      <spriteMaterial map={getSmokeTexture()} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0} color="#5d8fff" fog={false} />
    </sprite>
  ))];
}

// ─── Intro director: plays the reel, switches cars, dims the studio, tells the page what is on screen ──────
function Director({ rig, fit, onPhase, onDone }) {
  const { camera } = useThree();
  const o = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }), []);
  const sweep = useRef();
  const last = useRef('');
  useFrame((_, dt) => { try { frame(dt); } catch (e) { console.error('intro director:', e); } }); // one bad frame must not stop the loop
  function frame(dt) {
    if (!rig.running) return;
    if (rig.skip) rig.t = Math.max(rig.t, INTRO_TOTAL - 0.001);
    // which segment / shot are we in?
    let t = Math.min(rig.t, INTRO_TOTAL - 0.0001), si = 0;
    while (t >= INTRO[si].len) { t -= INTRO[si].len; si++; }
    const seg = INTRO[si];
    let lt = t, shi = 0;
    while (lt >= seg.shots[shi].len) { lt -= seg.shots[shi].len; shi++; }
    const shot = seg.shots[shi];
    const key = `${si}:${shi}`;
    if (key !== last.current) { last.current = key; onPhase?.({ seg: si, car: seg.car, shot: shi, cut: !!shot.cut, title: !!shot.title, caption: !!shot.caption }); }
    if (rig.readyId !== cars[seg.car].id) { rig.level = 0; rig.lamp = 0; return; } // next car still loading: hold on black

    // defaults, then let the shot fill in
    o.up.set(0, 1, 0); o.fov = 32; o.level = 1; o.lamp = 1; o.driveX = 0; o.pitch = 0; o.sweep = null; o.fog = [12, 26];
    const k = clamp01(lt / shot.len);
    shot.at(k, t, o);
    const scale = shot.crane ? lerp(1, fit, easeInOut(k)) : shot.wide ? fit : Math.min(fit, 1.35);
    camera.position.copy(o.pos).multiplyScalar(scale);
    camera.up.copy(o.up); camera.lookAt(o.look); camera.fov = o.fov; camera.updateProjectionMatrix();
    Object.assign(rig, { level: o.level, lamp: o.lamp, driveX: o.driveX, pitch: o.pitch, fog: o.fog, paintHex: cars[seg.car].paints[seg.paint].hex });

    const s = sweep.current;
    if (s) {
      if (o.sweep) {
        const { a, b, ta, tb, k: sk } = o.sweep;
        s.position.set(lerp(a[0], b[0], sk), lerp(a[1], b[1], sk), lerp(a[2], b[2], sk));
        s.target.position.set(lerp(ta[0], tb[0], sk), lerp(ta[1], tb[1], sk), lerp(ta[2], tb[2], sk));
        s.target.updateMatrixWorld();
        s.intensity = 70 * Math.sin(Math.PI * sk);
      } else s.intensity = 0;
    }

    rig.t += Math.min(dt, 1 / 20);
    if (rig.t >= INTRO_TOTAL) {
      rig.running = false; camera.up.set(0, 1, 0);
      camera.position.copy(HERO).multiplyScalar(fit); camera.lookAt(0, 0.55, 0); camera.fov = 32; camera.updateProjectionMatrix();
      onDone?.(INTRO[INTRO.length - 1].paint);
    }
  }
  return <spotLight ref={sweep} angle={0.55} penumbra={1} decay={2} intensity={0} color="#ffffff" />;
}

// ─── Studio look: background, fog and light levels follow the intro ──────────
function StudioLook({ rig, night }) {
  const { scene } = useThree();
  const ambient = useRef(), top = useRef(), fog = useRef();
  const bg = useMemo(() => new THREE.Color(), []);
  const black = useMemo(() => new THREE.Color('#01030a'), []);
  useFrame(() => {
    const f = rig.running ? rig.level : 1;
    scene.environmentIntensity = f * (night ? 0.7 : 1);
    bg.set(night ? '#050507' : '#121216').lerp(black, 1 - Math.min(1, f));
    if (scene.background?.isColor) scene.background.copy(bg);
    if (fog.current) { fog.current.color.copy(bg); [fog.current.near, fog.current.far] = rig.running ? rig.fog : [12, 26]; }
    if (ambient.current) ambient.current.intensity = 0.12 * f;
    if (top.current) top.current.intensity = (night ? 22 : 40) * f;
  });
  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog ref={fog} attach="fog" args={['#000000', 12, 26]} />
      <ambientLight ref={ambient} intensity={0} />
      <spotLight ref={top} position={[0, 9, 2]} angle={0.5} penumbra={1} intensity={0} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
    </>
  );
}

// ─── Orbit camera after the intro: never stops rotating unless the pause button is used ──────
function CameraRig({ view, viewKey, autoRotate, fit, afterIntro }) {
  const controls = useRef();
  const target = useRef(null);
  const first = useRef(afterIntro);
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(0, 0.55, 0), []);
  const shift = useRef(0);
  useEffect(() => () => camera.clearViewOffset(), [camera]);
  useEffect(() => {
    if (first.current) { first.current = false; return; } // keep the intro's final framing
    target.current = new THREE.Vector3(...VIEWS[view]).multiplyScalar(fit);
  }, [view, viewKey, fit]);
  useFrame((_, dt) => {
    // on wide screens slide the car a little to the right, clear of the spec panel on the left
    const want = size.width > 1100 && size.height > 700 ? Math.min(190, size.width * 0.11) : 0;
    shift.current += (want - shift.current) * (1 - Math.exp(-dt * 2.5));
    if (Math.abs(shift.current) > 0.5) camera.setViewOffset(size.width, size.height, -shift.current, 0, size.width, size.height);
    else if (camera.view) camera.clearViewOffset();
    const c = controls.current; if (!c) return;
    c.autoRotate = autoRotate && !target.current; // pause rotation only while flying to a chosen view
    if (!target.current) return;
    const k = 1 - Math.exp(-dt * 4);
    camera.position.lerp(target.current, k);
    c.target.lerp(look, k);
    if (camera.position.distanceTo(target.current) < 0.05) target.current = null;
  });
  return (
    <OrbitControls ref={controls} makeDefault target={[0, 0.55, 0]} enablePan={false} enableDamping dampingFactor={0.06}
      minDistance={3.6} maxDistance={11 * fit} maxPolarAngle={Math.PI / 2 - 0.04}
      autoRotate={autoRotate} autoRotateSpeed={0.6}
      onStart={() => { target.current = null; }} />
  );
}

// Studio lighting. Long thin softboxes draw crisp reflection lines along the body instead of one big white wash.
function Studio({ night }) {
  const k = night ? 0.55 : 1;
  return (
    <Environment resolution={512} frames={1}>
      <Lightformer form="rect" intensity={2.2 * k} position={[0, 6, 1.4]} rotation-x={Math.PI / 2} scale={[11, 0.5, 1]} />
      <Lightformer form="rect" intensity={2.2 * k} position={[0, 6, -1.4]} rotation-x={Math.PI / 2} scale={[11, 0.5, 1]} />
      <Lightformer form="rect" intensity={1.6 * k} position={[0, 2.4, -7]} scale={[14, 1.2, 1]} />
      <Lightformer form="rect" intensity={1.6 * k} position={[0, 2.4, 7]} rotation-y={Math.PI} scale={[14, 1.2, 1]} />
      <Lightformer form="rect" intensity={1.2 * k} position={[-8, 1.8, 0]} rotation-y={Math.PI / 2} scale={[7, 1.6, 1]} />
      <Lightformer form="rect" intensity={1.2 * k} position={[8, 1.8, 0]} rotation-y={-Math.PI / 2} scale={[7, 1.6, 1]} />
      <Lightformer form="ring" color={night ? '#6f8cff' : '#ffe9c4'} intensity={night ? 2.4 : 0.9} position={[-4, 4, -6]} scale={3} />
    </Environment>
  );
}

function Floor({ night }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.001} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <MeshReflectorMaterial blur={[400, 120]} resolution={1024} mixBlur={1} mixStrength={night ? 10 : 5} roughness={0.85}
        depthScale={1.1} minDepthThreshold={0.4} maxDepthThreshold={1.3} color={night ? '#0a0a0c' : '#18181c'} metalness={0.6} mirror={0.5} />
    </mesh>
  );
}

export function Loader() {
  const { progress, active } = useProgress();
  if (!active && progress === 100) return null;
  return <div className="viewer-loading" role="progressbar" aria-label="در حال بارگذاری" aria-valuenow={Math.round(progress)}><Logo variant="hero" /><span>در حال آماده‌سازی خودرو</span></div>;
}

function useFit() {
  const { size } = useThree();
  // narrow (portrait) screens see less width, so pull the camera back to fit the whole car
  return Math.min(2.2, Math.max(1, 1.35 / (size.width / size.height)));
}

function Scene({ car, paint, headlights, night, view, viewKey, autoRotate, intro, skip, onIntroPhase, onIntroDone }) {
  const fit = useFit();
  const rig = useMemo(() => ({
    t: Number(new URLSearchParams(window.location.search).get('introfrom')) || 0, // ?introfrom=<seconds> jumps into the reel (for testing)
    running: intro, skip: false, readyId: null, level: 0, lamp: 0, driveX: 0, pitch: 0, fog: [12, 26], paintHex: null,
  }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [orbit, setOrbit] = useState(!intro);
  useEffect(() => { if (skip) rig.skip = true; }, [skip, rig]);
  useEffect(() => { if (intro) cars.forEach(preloadCar); }, [intro]); // fetch every car of the reel up front
  return (
    <>
      <StudioLook rig={rig} night={night} />
      <Suspense fallback={null}>
        <Car key={car.id} car={car} paint={paint} headlights={headlights} rig={rig} />
      </Suspense>
      {intro && <Director rig={rig} fit={fit} onPhase={onIntroPhase} onDone={(p) => { setOrbit(true); onIntroDone?.(p); }} />}
      <Suspense fallback={null}>
        <Studio night={night} />
        <ContactShadows position={[0, 0.002, 0]} opacity={0.75} scale={10} blur={2.2} far={2} resolution={1024} color="#000" />
        <Floor night={night} />
      </Suspense>
      {orbit && <CameraRig view={view} viewKey={viewKey} autoRotate={autoRotate} fit={fit} afterIntro={intro} />}
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={1.6} luminanceSmoothing={0.25} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.22} darkness={0.62} />
      </EffectComposer>
    </>
  );
}

export default function Viewer(props) {
  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: VIEWS['Front ¾'], fov: 32, near: 0.1, far: 120 }}
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}>
      <Scene {...props} />
    </Canvas>
  );
}
