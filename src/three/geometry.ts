import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { createNoise3D } from 'simplex-noise'

export function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

export type PotatoOpts = {
  seed?: number
  detail?: number
  stretch?: [number, number, number]
  lumpy?: number
  base?: string
  dark?: string
  light?: string
  /** keep the front (+z) free of eye dimples so a face fits */
  face?: boolean
}

export type Potato = {
  geometry: THREE.BufferGeometry
  /** point on the surface in the direction `dir` (local space) */
  surface: (dir: THREE.Vector3) => THREE.Vector3
}

export function makePotato({
  seed = 7,
  detail = 36,
  stretch = [1.28, 0.98, 0.94],
  lumpy = 1,
  base = '#D39A4E',
  dark = '#7E4A1C',
  light = '#EDBF73',
  face = true,
}: PotatoOpts = {}): Potato {
  const rand = rng(seed)
  const n3 = createNoise3D(rand)
  const s = new THREE.Vector3(...stretch)

  const dimples: THREE.Vector3[] = []
  while (dimples.length < 9) {
    const d = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize()
    if (face && d.z > 0.35 && Math.abs(d.y) < 0.75) continue
    dimples.push(d)
  }

  const radius = (dir: THREE.Vector3) => {
    let r = 1
    r += 0.075 * lumpy * n3(dir.x * 1.1, dir.y * 1.1, dir.z * 1.1)
    r += 0.025 * lumpy * n3(dir.x * 3.2 + 9, dir.y * 3.2, dir.z * 3.2)
    r += 0.006 * n3(dir.x * 14, dir.y * 14, dir.z * 14)
    let dim = 0
    for (const d of dimples) dim = Math.max(dim, smooth(0.975, 0.995, dir.dot(d)))
    return r - dim * 0.045
  }
  const dimpleAmount = (dir: THREE.Vector3) => {
    let dim = 0
    for (const d of dimples) dim = Math.max(dim, smooth(0.965, 0.995, dir.dot(d)))
    return dim
  }

  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, detail)
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  g = mergeVertices(g)

  const pos = g.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const cBase = new THREE.Color(base)
  const cDark = new THREE.Color(dark)
  const cLight = new THREE.Color(light)
  const c = new THREE.Color()
  const v = new THREE.Vector3()

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize()
    const r = radius(v)
    const speck = smooth(0.45, 0.7, n3(v.x * 11 + 3, v.y * 11, v.z * 11))
    const blotch = smooth(0.2, 0.8, n3(v.x * 2.5, v.y * 2.5 + 5, v.z * 2.5)) * 0.35
    c.copy(cBase).lerp(cLight, Math.max(0, v.y) * 0.25 + 0.1)
    c.lerp(cDark, Math.min(1, speck * 0.55 + blotch + dimpleAmount(v) * 0.8))
    colors.set([c.r, c.g, c.b], i * 3)
    pos.setXYZ(i, v.x * r * s.x, v.y * r * s.y, v.z * r * s.z)
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.computeVertexNormals()

  const surface = (dir: THREE.Vector3) => {
    const d = dir.clone().normalize()
    const r = radius(d)
    return new THREE.Vector3(d.x * r * s.x, d.y * r * s.y, d.z * r * s.z)
  }
  return { geometry: g, surface }
}

/** wavy ridged potato chip */
export function makeChip(seed = 1) {
  const rand = rng(seed)
  const g = new THREE.CircleGeometry(0.5, 48, 0, Math.PI * 2)
  const p = g.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(p.count * 3)
  const a = new THREE.Color('#F7C948')
  const b = new THREE.Color('#C9862B')
  const c = new THREE.Color()
  const ph = rand() * 6
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) * (1 + (rand() - 0.5) * 0.06)
    const y = p.getY(i) * (0.9 + (rand() - 0.5) * 0.06)
    const r = Math.hypot(x, y)
    const z = Math.sin(x * 4 + ph) * 0.09 + Math.cos(y * 3.4) * 0.07 + Math.sin(y * 34) * 0.008
    p.setXYZ(i, x, y, z)
    c.copy(a).lerp(b, Math.pow(r / 0.5, 3) * 0.8 + (rand() > 0.97 ? 0.4 : 0))
    colors.set([c.r, c.g, c.b], i * 3)
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}

/** displaced blob: mash, sour cream, butter drips */
export function makeBlob(seed: number, amp = 0.12, detail = 20) {
  const n3 = createNoise3D(rng(seed))
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, detail)
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  g = mergeVertices(g)
  const p = g.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize()
    const r = 1 + amp * n3(v.x * 1.8, v.y * 1.8, v.z * 1.8) + amp * 0.4 * n3(v.x * 5, v.y * 5, v.z * 5)
    p.setXYZ(i, v.x * r, v.y * r, v.z * r)
  }
  g.computeVertexNormals()
  return g
}

/** crumpled foil wrap */
export function makeFoil(seed = 3) {
  const n3 = createNoise3D(rng(seed))
  const g = new THREE.CylinderGeometry(1.42, 1.1, 0.95, 64, 8, true)
  const p = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const k = 1 + 0.09 * n3(x * 3, y * 3, z * 3) + 0.03 * n3(x * 9, y * 9, z * 9)
    const top = y > 0.4 ? 1 + 0.12 * n3(x * 2, 0, z * 2) : 1
    p.setXYZ(i, x * k, y * top, z * k)
  }
  g.computeVertexNormals()
  return g
}
