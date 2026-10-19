// Usage: node scripts/headlights.mjs <input.glb> <output.glb> [dry]   (run after scripts/plates.mjs, before gltf-transform optimize)
// Needs (once): npm i -D @gltf-transform/core @gltf-transform/extensions @gltf-transform/cli draco3dgltf
// Splits the front lamp lenses out of the shared light-glass mesh into a material named "Headlight"
// and prints where they are (fractions of the car: from front, from ground, from centre).
import { NodeIO, getBounds } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() })
const [src, out, dry] = process.argv.slice(2)
const doc = await io.read(src); const r = doc.getRoot()
const sb = getBounds(r.listScenes()[0]); const ext = sb.max.map((x, i) => x - sb.min[i])
const la = ext[0] > ext[2] ? 0 : 2, sa = 2 - la
const tx = (m, p) => [0, 1, 2].map(i => m[i] * p[0] + m[4 + i] * p[1] + m[8 + i] * p[2] + m[12 + i])
const lamps = []
for (const node of r.listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue
  for (const prim of mesh.listPrimitives()) {
    if (!/light_glass/i.test(prim.getMaterial()?.getName() || '')) continue
    const W = node.getWorldMatrix(); const pos = prim.getAttribute('POSITION'); const nV = pos.getCount()
    const idx = Array.from(prim.getIndices().getArray())
    const key = new Map(), weld = new Int32Array(nV), P = []
    for (let i = 0; i < nV; i++) { const p = pos.getElement(i, []); P.push(p); const k = p.map(v => Math.round(v * 1e5)).join(','); if (!key.has(k)) key.set(k, i); weld[i] = key.get(k) }
    const par = new Int32Array(nV).map((_, i) => i); const f = (a) => { while (par[a] !== a) a = par[a] = par[par[a]]; return a }
    for (let t = 0; t < idx.length; t += 3) { const a = f(weld[idx[t]]), b = f(weld[idx[t + 1]]), c = f(weld[idx[t + 2]]); par[b] = a; par[f(c)] = a }
    const comps = new Map()
    for (let t = 0; t < idx.length; t += 3) { const c = f(weld[idx[t]]); if (!comps.has(c)) comps.set(c, []); comps.get(c).push(t) }
    const take = new Set()
    for (const tris of comps.values()) {
      const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]
      for (const t of tris) for (let k = 0; k < 3; k++) { const w = tx(W, P[idx[t + k]]); for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], w[i]); mx[i] = Math.max(mx[i], w[i]) } }
      const fromFront = (sb.max[la] - (mx[la] + mn[la]) / 2) / ext[la]          // front = +long axis in these models
      const fy = ((mx[1] + mn[1]) / 2 - sb.min[1]) / ext[1]
      const fs = Math.abs((mx[sa] + mn[sa]) / 2 - (sb.max[sa] + sb.min[sa]) / 2) / ext[sa]
      const width = (mx[sa] - mn[sa]) / ext[sa]
      if (fromFront < 0.2 && fs > 0.12) { tris.forEach(t => take.add(t)); lamps.push({ fromFront, fy, fs, width, tris: tris.length }) }
    }
    if (!take.size || dry) continue
    const keep = [], sel = []
    for (let t = 0; t < idx.length; t += 3) (take.has(t) ? sel : keep).push(idx[t], idx[t + 1], idx[t + 2])
    const mk = (a) => doc.createAccessor().setType('SCALAR').setArray(nV > 65535 ? new Uint32Array(a) : new Uint16Array(a)).setBuffer(r.listBuffers()[0])
    const hp = prim.clone(); hp.setIndices(mk(sel)); prim.setIndices(mk(keep))
    hp.setMaterial(prim.getMaterial().clone().setName('Headlight').setExtras({ part: 'Headlight' }))
    const pn = doc.createNode('Headlight').setMesh(doc.createMesh('Headlight').addPrimitive(hp)).setMatrix(node.getMatrix())
    const parent = node.getParentNode(); if (parent) parent.addChild(pn); else r.listScenes()[0].addChild(pn)
  }
}
lamps.sort((a, b) => b.tris - a.tris)
console.log(src.split('/').pop(), JSON.stringify(lamps.map(l => Object.fromEntries(Object.entries(l).map(([k, v]) => [k, +v.toFixed(3)])))))
if (!dry) await io.write(out, doc)
