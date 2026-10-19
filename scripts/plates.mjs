// Usage: node scripts/plates.mjs <input.glb> <output.glb> [dry]
// Needs (once): npm i -D @gltf-transform/core @gltf-transform/extensions @gltf-transform/cli draco3dgltf
// Finds licence plates by shape (thin rectangle, plate proportions, at the very front/back)
// and moves them into their own node with a material named "LicensePlate".
import { NodeIO, getBounds } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() })
const [src, out, dry] = process.argv.slice(2)
const doc = await io.read(src); const r = doc.getRoot()
const sb = getBounds(r.listScenes()[0]); const ext = sb.max.map((x, i) => x - sb.min[i])
const longAx = ext[0] > ext[2] ? 0 : 2, sideAx = 2 - longAx, L = ext[longAx], mid = sb.max.map((x, i) => (x + sb.min[i]) / 2)
const tx = (m, p) => [0, 1, 2].map(i => m[i] * p[0] + m[4 + i] * p[1] + m[8 + i] * p[2] + m[12 + i])
let found = 0
for (const node of r.listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue
  const W = node.getWorldMatrix()
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION'); const nV = pos.getCount()
    const idxA = prim.getIndices(); const idx = idxA ? Array.from(idxA.getArray()) : [...Array(nV).keys()]
    // weld by position → union-find over triangles
    const key = new Map(), weld = new Int32Array(nV), P = []
    for (let i = 0; i < nV; i++) { const p = pos.getElement(i, []); P.push(p); const k = p.map(v => Math.round(v * 1e5)).join(','); if (!key.has(k)) key.set(k, i); weld[i] = key.get(k) }
    const par = new Int32Array(nV).map((_, i) => i); const f = (a) => { while (par[a] !== a) a = par[a] = par[par[a]]; return a }
    for (let t = 0; t < idx.length; t += 3) { const a = f(weld[idx[t]]), b = f(weld[idx[t + 1]]), c = f(weld[idx[t + 2]]); par[b] = a; par[f(c)] = a }
    const comps = new Map()
    for (let t = 0; t < idx.length; t += 3) { const c = f(weld[idx[t]]); if (!comps.has(c)) comps.set(c, []); comps.get(c).push(t) }
    const plateTris = []
    for (const tris of comps.values()) {
      if (tris.length > 4000) continue
      const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]
      for (const t of tris) for (let k = 0; k < 3; k++) { const w = tx(W, P[idx[t + k]]); for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], w[i]); mx[i] = Math.max(mx[i], w[i]) } }
      const d = mx.map((x, i) => (x - mn[i]) / L), c = mx.map((x, i) => ((x + mn[i]) / 2 - mid[i]) / L)
      const width = d[sideAx], height = d[1], depth = d[longAx]
      const ok = width > 0.075 && width < 0.135 && height > 0.018 && height < 0.06 && height / width > 0.18 && height / width < 0.45 && depth < 0.03 && Math.abs(c[longAx]) > 0.38 && Math.abs(c[sideAx]) < 0.03
      if (ok) { plateTris.push(...tris); console.log(`  plate? ${node.getName()} [${prim.getMaterial()?.getName()}] tris ${tris.length} w ${(width*L/L*100).toFixed(1)}%L h/w ${(height/width).toFixed(2)} ${c[longAx] > 0 ? '+' : '-'}end`) }
    }
    if (!plateTris.length || dry) continue
    found++
    const set = new Set(plateTris), keep = [], take = []
    for (let t = 0; t < idx.length; t += 3) (set.has(t) ? take : keep).push(idx[t], idx[t + 1], idx[t + 2])
    const mkIdx = (a) => doc.createAccessor().setType('SCALAR').setArray(nV > 65535 ? new Uint32Array(a) : new Uint16Array(a)).setBuffer(r.listBuffers()[0])
    const plate = prim.clone(); plate.setIndices(mkIdx(take)); prim.setIndices(mkIdx(keep))
    // the printed plate has a texture; the black holder behind it doesn't
    const name = prim.getMaterial()?.getBaseColorTexture() ? 'LicensePlate' : 'PlateHolder'
    const mat = (prim.getMaterial() || doc.createMaterial()).clone().setName(name).setExtras({ part: name }); plate.setMaterial(mat)
    const pm = doc.createMesh(name).addPrimitive(plate)
    const pn = doc.createNode(name).setMesh(pm).setMatrix(node.getMatrix())
    const parent = node.getParentNode(); if (parent) parent.addChild(pn); else r.listScenes()[0].addChild(pn)
  }
}
console.log(src.split('/').pop(), 'split', found)
if (!dry) await io.write(out, doc)
