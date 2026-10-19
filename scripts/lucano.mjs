// Usage: node scripts/lucano.mjs <input.glb> <output.glb> <new-OUT_color1.png>   (Jaecoo J7 → Lucano: new rear lettering texture + front letters split out as "Badge")
// Needs (once): npm i -D @gltf-transform/core @gltf-transform/extensions @gltf-transform/cli draco3dgltf
// J7 → Lucano: swap the tail-light texture (LUCANO lettering) and move the front "JAECOO" chrome letters
// into their own material "Badge" so the viewer can hide them and place a LUCANO badge instead.
import { NodeIO, getBounds } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'
import fs from 'fs'
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() })
const [src, out, png] = process.argv.slice(2)
const doc = await io.read(src); const r = doc.getRoot()
const m = r.listMaterials().find((x) => x.getName() === 'OUT_color1')
m.getBaseColorTexture().setImage(fs.readFileSync(png)).setMimeType('image/png')
const sb = getBounds(r.listScenes()[0]); const ext = sb.max.map((x, i) => x - sb.min[i])
const la = ext[0] > ext[2] ? 0 : 2, sa = 2 - la, L = ext[la], mid = sb.max.map((x, i) => (x + sb.min[i]) / 2)
const tx = (M, p) => [0, 1, 2].map(i => M[i] * p[0] + M[4 + i] * p[1] + M[8 + i] * p[2] + M[12 + i])
let n = 0
for (const node of r.listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue
  for (const prim of mesh.listPrimitives()) {
    if (!/Chrome/.test(prim.getMaterial()?.getName() || '')) continue
    const W = node.getWorldMatrix(); const pos = prim.getAttribute('POSITION'); const nV = pos.getCount(); const idx = Array.from(prim.getIndices().getArray())
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
      const d = mx.map((x, i) => (x - mn[i]) / L), c = mx.map((x, i) => ((x + mn[i]) / 2 - mid[i]) / L)
      if (c[la] > 0.494 && Math.abs(c[sa]) < 0.045 && Math.abs(c[1] - 0.002) < 0.006 && d[sa] < 0.012 && d[1] < 0.014) { tris.forEach((t) => take.add(t)); n++ }
    }
    if (!take.size) continue
    const keep = [], sel = []
    for (let t = 0; t < idx.length; t += 3) (take.has(t) ? sel : keep).push(idx[t], idx[t + 1], idx[t + 2])
    const mk = (a) => doc.createAccessor().setType('SCALAR').setArray(nV > 65535 ? new Uint32Array(a) : new Uint16Array(a)).setBuffer(r.listBuffers()[0])
    const bp = prim.clone(); bp.setIndices(mk(sel)); prim.setIndices(mk(keep))
    bp.setMaterial(prim.getMaterial().clone().setName('Badge').setExtras({ part: 'Badge' }))
    const pn = doc.createNode('Badge').setMesh(doc.createMesh('Badge').addPrimitive(bp)).setMatrix(node.getMatrix())
    const parent = node.getParentNode(); if (parent) parent.addChild(pn); else r.listScenes()[0].addChild(pn)
  }
}
console.log('badge letters moved:', n)
await io.write(out, doc)
