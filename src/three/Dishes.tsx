import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { makeBlob, makeChip, makeFoil, makePotato, rng } from './geometry'
import { live, useStore } from '../store'
import { anchorToWorld } from './Character'

const damp = THREE.MathUtils.damp

function Fries() {
  const fries = useMemo(() => {
    const r = rng(5)
    return Array.from({ length: 17 }, () => ({
      pos: [(r() - 0.5) * 0.66, 0.42 + r() * 0.2, (r() - 0.5) * 0.5] as [number, number, number],
      rot: [(r() - 0.5) * 0.4, r() * 3, (r() - 0.5) * 0.45] as [number, number, number],
      h: 0.95 + r() * 0.4,
      c: r() > 0.7 ? '#F4B942' : '#FAD15C',
    }))
  }, [])
  return (
    <group position={[0, -0.45, 0]}>
      {fries.map((f, i) => (
        <RoundedBox key={i} args={[0.13, f.h, 0.13]} radius={0.035} smoothness={2} position={f.pos} rotation={f.rot}>
          <meshStandardMaterial color={f.c} roughness={0.5} />
        </RoundedBox>
      ))}
      <mesh rotation-y={Math.PI / 4}>
        <cylinderGeometry args={[0.66, 0.46, 1.0, 4, 1, true]} />
        <meshStandardMaterial color="#E63946" roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation-y={Math.PI / 4} position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.625, 0.585, 0.16, 4, 1, true]} />
        <meshStandardMaterial color="#FFF1D6" roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation-y={Math.PI / 4} position={[0, -0.5, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.46, 4]} />
        <meshStandardMaterial color="#B5212D" />
      </mesh>
    </group>
  )
}

function Chips() {
  const geos = useMemo(() => [1, 2, 3, 4, 5].map((s) => makeChip(s * 13)), [])
  const ref = useRef<THREE.Group>(null!)
  useFrame((s) => {
    ref.current.children.forEach((c, i) => {
      c.position.y = Math.sin(s.clock.elapsedTime * 1.2 + i) * 0.08 + (i - 2) * 0.32
      c.rotation.z = s.clock.elapsedTime * 0.3 + i * 1.3
    })
  })
  return (
    <group ref={ref} scale={1.25}>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} position={[Math.sin(i * 2.4) * 0.35, 0, Math.cos(i * 2.4) * 0.2]} rotation={[-0.9 + i * 0.15, i, 0]}>
          <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.38} />
        </mesh>
      ))}
    </group>
  )
}

function Mash() {
  const bowl = useMemo(() => {
    const pts = [
      [0, -0.42], [0.42, -0.42], [0.5, -0.36], [0.78, -0.05], [0.9, 0.18], [0.86, 0.2], [0.72, -0.02], [0.5, -0.3], [0, -0.33],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 48)
  }, [])
  const mash = useMemo(() => makeBlob(9, 0.14, 18), [])
  const herbs = useMemo(() => {
    const r = rng(2)
    return Array.from({ length: 10 }, () => [(r() - 0.5) * 0.9, 0.36 + r() * 0.05, (r() - 0.5) * 0.9] as [number, number, number])
  }, [])
  return (
    <group position={[0, -0.1, 0]} rotation-x={0.35}>
      <mesh geometry={bowl}>
        <meshPhysicalMaterial color="#4D9DE0" roughness={0.2} clearcoat={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={mash} position={[0, 0.12, 0]} scale={[0.8, 0.32, 0.8]}>
        <meshStandardMaterial color="#FFEFC4" roughness={0.75} />
      </mesh>
      <RoundedBox args={[0.34, 0.12, 0.34]} radius={0.04} position={[0.05, 0.43, 0.02]} rotation={[0.1, 0.5, 0.08]}>
        <meshPhysicalMaterial color="#FFD84D" roughness={0.25} clearcoat={0.8} />
      </RoundedBox>
      {herbs.map((p, i) => (
        <mesh key={i} position={p} rotation={[i, i * 2, 0]} scale={[0.05, 0.012, 0.025]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#4E9F3D" />
        </mesh>
      ))}
    </group>
  )
}

function Baked() {
  const potato = useMemo(() => makePotato({ seed: 23, detail: 28, face: false, stretch: [1.3, 0.8, 0.85] }), [])
  const foil = useMemo(() => makeFoil(4), [])
  const cream = useMemo(() => makeBlob(31, 0.2, 14), [])
  const chives = useMemo(() => {
    const r = rng(8)
    return Array.from({ length: 16 }, () => ({
      p: [(r() - 0.5) * 0.7, 0.98 + r() * 0.08, (r() - 0.5) * 0.4] as [number, number, number],
      r: [r() * 3, r() * 3, Math.PI / 2] as [number, number, number],
    }))
  }, [])
  return (
    <group scale={0.82} rotation-x={0.3}>
      <mesh geometry={potato.geometry} position={[0, 0.2, 0]}>
        <meshPhysicalMaterial vertexColors roughness={0.7} clearcoat={0.2} />
      </mesh>
      <mesh geometry={foil} position={[0, -0.22, 0]} scale={[1, 1, 0.72]}>
        <meshStandardMaterial color="#DADDE2" metalness={1} roughness={0.28} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={cream} position={[0, 0.92, 0.05]} scale={[0.42, 0.2, 0.32]}>
        <meshPhysicalMaterial color="#FFFDF5" roughness={0.3} clearcoat={0.6} />
      </mesh>
      {chives.map((c, i) => (
        <mesh key={i} position={c.p} rotation={c.r}>
          <cylinderGeometry args={[0.018, 0.018, 0.09, 6]} />
          <meshStandardMaterial color="#3E9B3A" />
        </mesh>
      ))}
    </group>
  )
}

/** index 0 is the main character itself, so dishes start at 1 */
const DISHES = [null, Fries, Chips, Mash, Baked]

export default function Dishes() {
  const root = useRef<THREE.Group>(null!)
  const items = useRef<THREE.Group[]>([])
  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 20)
    const { scene, dish } = useStore.getState()
    const { width: W, height: H } = state.viewport
    const wide = W > H * 1.05
    const base = Math.min(W / 3.15, 1.15) * (wide ? 1 : 0.8)
    const a = anchorToWorld('dishes', state.size, W, H) ?? { x: 0, y: 0.15 * H }
    root.current.position.x = damp(root.current.position.x, a.x, 12, dt)
    root.current.position.y = damp(root.current.position.y, a.y + Math.sin(state.clock.elapsedTime * 1.4) * 0.04, 12, dt)
    root.current.scale.setScalar(base)
    root.current.rotation.y = state.clock.elapsedTime * 0.35 + live.dragRot
    items.current.forEach((g, i) => {
      if (!g) return
      const target = scene === 'dishes' && dish === i ? 1 : 0.0001
      const v = damp(g.scale.x, target, target > 0.5 ? 7 : 10, dt)
      g.scale.setScalar(v)
      g.visible = v > 0.002
      g.rotation.y = (1 - v) * 2.5
    })
  })
  return (
    <group ref={root}>
      {DISHES.map((D, i) =>
        D ? (
          <group key={i} ref={(g) => { if (g) items.current[i] = g }} scale={0.0001} visible={false}>
            <D />
          </group>
        ) : null,
      )}
    </group>
  )
}
