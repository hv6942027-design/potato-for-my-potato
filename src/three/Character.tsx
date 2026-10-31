import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { makeChip, makePotato } from './geometry'
import { live, useStore } from '../store'

const UP = new THREE.Vector3(0, 1, 0)
const FWD = new THREE.Vector3(0, 0, 1)
const damp = THREE.MathUtils.damp
const sstep = THREE.MathUtils.smoothstep

type Anchor = { position: THREE.Vector3; quaternion: THREE.Quaternion }

/** Convert a DOM anchor's on-screen centre into world units at z=0. */
export function anchorToWorld(name: string, size: { width: number; height: number }, W: number, H: number) {
  const a = live.anchors[name]
  if (!a) return null
  return { x: (a.x / size.width - 0.5) * W, y: (0.5 - a.y / size.height) * H }
}

function place(surface: (d: THREE.Vector3) => THREE.Vector3, dir: [number, number, number], axis = FWD, lift = 0): Anchor {
  const d = new THREE.Vector3(...dir).normalize()
  const p = surface(d)
  const n = p.clone().normalize()
  p.addScaledVector(n, lift)
  return { position: p, quaternion: new THREE.Quaternion().setFromUnitVectors(axis, n) }
}

export default function Character() {
  const potato = useMemo(() => makePotato({ seed: 11 }), [])
  const chip = useMemo(() => makeChip(4), [])
  const face = useMemo(
    () => ({
      eyeL: place(potato.surface, [-0.3, 0.2, 1], FWD, -0.02),
      eyeR: place(potato.surface, [0.3, 0.2, 1], FWD, -0.02),
      mouth: place(potato.surface, [0, -0.13, 1], FWD, 0.005),
      blushL: place(potato.surface, [-0.55, -0.08, 1], FWD, 0.012),
      blushR: place(potato.surface, [0.55, -0.08, 1], FWD, 0.012),
      sprout: place(potato.surface, [0.12, 1, 0.08], UP, -0.02),
      roots: place(potato.surface, [0, -1, 0.1], UP.clone().negate(), -0.02),
    }),
    [potato],
  )

  const skin = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.62,
        clearcoat: 0.35,
        clearcoatRoughness: 0.5,
        sheen: 0.4,
        sheenColor: new THREE.Color('#ffd9a0'),
      }),
    [],
  )
  const gold = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#FFC83D',
        metalness: 0.75,
        roughness: 0.26,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        emissive: '#9A6200',
        emissiveIntensity: 0.45,
      }),
    [],
  )

  const root = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const mesh = useRef<THREE.Mesh>(null!)
  const eyes = useRef<THREE.Group[]>([])
  const pupils = useRef<THREE.Group[]>([])
  const sprout = useRef<THREE.Group>(null!)
  const roots = useRef<THREE.Group>(null!)
  const orbit = useRef<THREE.Group>(null!)
  const st = useRef({ s: 0, v: 0, blinkAt: 2, spin: 0, scale: 0.001, sprout: 0.6, follow: 4, lastScene: '' })

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 20)
    const { scene, dish, golden } = useStore.getState()
    const { width: W, height: H } = state.viewport
    const t = state.clock.elapsedTime
    const s = st.current
    const wide = W > H * 1.05
    const base = Math.min(W / 3.15, 1.15)

    let tx = 0
    let ty = 0
    let ts = base
    let tSprout = 0.6
    let tRoots = 0
    let tOrbit = 0
    let spinTarget = 0
    let wave = 0
    const a = anchorToWorld(scene, state.size, W, H)
    let follow = 4
    switch (scene) {
      case 'hero':
        tx = a ? a.x : 0
        ty = a ? a.y : -0.04 * H
        ts = base * (wide ? 0.88 : 0.95)
        tOrbit = 1
        follow = 9
        break
      case 'origin': {
        const p = live.originProgress
        const grow = sstep(p, 0.08, 0.6)
        const harvest = sstep(p, 0.64, 0.86)
        ty = THREE.MathUtils.lerp(-0.07 * H, 0.12 * H, harvest)
        tx = wide ? W * 0.18 : 0
        ts = base * THREE.MathUtils.lerp(0.42, 0.78, grow) * (1 - harvest * 0.12)
        tSprout = 0.25 + grow * 1.9 - harvest * 1.1
        tRoots = grow * (1 - harvest * 0.4)
        spinTarget = harvest * Math.PI * 2
        break
      }
      case 'dishes':
        tx = a ? a.x : 0
        ty = a ? a.y : 0.15 * H
        ts = dish === 0 ? base * (wide ? 0.9 : 0.66) : 0.0001
        follow = 9
        break
      case 'footer':
        tx = a ? a.x : 0
        ty = a ? a.y : 0.23 * H
        ts = base * 0.62
        wave = 1
        follow = 9
        break
      default:
        ts = 0.0001
        ty = 0.35 * H
    }

    // glide between scene anchors
    // ease into a new scene, then track the anchor tightly so it scrolls with the page
    s.follow = damp(s.follow, follow, 2, dt)
    if (scene !== s.lastScene) {
      s.follow = 3
      s.lastScene = scene
    }
    root.current.position.x = damp(root.current.position.x, tx, s.follow, dt)
    root.current.position.y = damp(root.current.position.y, ty + Math.sin(t * 1.4) * 0.05 * base, s.follow, dt)
    s.scale = damp(s.scale, ts, scene === 'none' ? 6 : 4.5, dt)
    root.current.scale.setScalar(Math.max(0.0001, s.scale))
    root.current.visible = s.scale > 0.002

    // drag inertia
    live.dragVel *= Math.pow(0.04, dt)
    live.dragRot += live.dragVel * dt
    s.spin = damp(s.spin, spinTarget, 3, dt)

    body.current.rotation.y = Math.sin(t * 0.55) * 0.3 + live.pointer.x * 0.45 + live.tilt.x * 0.7 + live.dragRot + s.spin
    body.current.rotation.x = -live.pointer.y * 0.22 + live.tilt.y * 0.4 + Math.sin(t * 0.8) * 0.04
    body.current.rotation.z = wave ? Math.sin(t * 5) * 0.12 : damp(body.current.rotation.z, 0, 4, dt)

    // jelly squish spring
    if (live.squish) {
      s.v += live.squish * 9
      live.squish = 0
    }
    s.v += (-190 * s.s - 9 * s.v) * dt
    s.s += s.v * dt
    body.current.scale.set(1 + s.s * 0.38, 1 - s.s * 0.5, 1 + s.s * 0.38)

    // eyes: blink, follow the finger, squint happily when squished
    if (t > s.blinkAt) s.blinkAt = t + 2 + Math.random() * 3.5
    const blinking = s.blinkAt - t < 0.12 ? 0.08 : 1
    const happy = s.s > 0.12 ? 0.25 : 1
    for (const e of eyes.current) if (e) e.scale.y = damp(e.scale.y, Math.min(blinking, happy), 30, dt)
    for (const p of pupils.current) {
      if (!p) continue
      p.position.x = damp(p.position.x, live.pointer.x * 0.035, 8, dt)
      p.position.y = damp(p.position.y, live.pointer.y * 0.03, 8, dt)
    }

    s.sprout = damp(s.sprout, tSprout, 3, dt)
    sprout.current.scale.setScalar(s.sprout)
    sprout.current.rotation.z = Math.sin(t * 2.2) * 0.12
    roots.current.scale.setScalar(Math.max(0.0001, damp(roots.current.scale.x, tRoots, 3, dt)))

    orbit.current.rotation.y = t * 0.45
    orbit.current.rotation.z = 0.25
    orbit.current.scale.setScalar(Math.max(0.0001, damp(orbit.current.scale.x, tOrbit, 3.5, dt)))
    orbit.current.children.forEach((c, i) => {
      c.rotation.x = t * (0.6 + i * 0.1)
      c.rotation.z = t * 0.4 + i
    })

    mesh.current.material = golden ? gold : skin
  })

  const eye = (i: number, at: Anchor) => (
    <group position={at.position} quaternion={at.quaternion}>
      <group ref={(g) => { if (g) eyes.current[i] = g }}>
        <mesh scale={[1, 1.15, 0.55]}>
          <sphereGeometry args={[0.135, 24, 16]} />
          <meshStandardMaterial color="#FFFDF7" roughness={0.25} />
        </mesh>
        <group ref={(g) => { if (g) pupils.current[i] = g }} position={[0, 0, 0.055]}>
          <mesh scale={[1, 1.1, 0.5]}>
            <sphereGeometry args={[0.078, 20, 14]} />
            <meshStandardMaterial color="#1A1410" roughness={0.15} />
          </mesh>
          <mesh position={[0.026, 0.032, 0.035]}>
            <sphereGeometry args={[0.022, 10, 8]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </group>
      </group>
    </group>
  )

  return (
    <group ref={root}>
      <group ref={body}>
        <mesh ref={mesh} geometry={potato.geometry} material={skin} />
        {eye(0, face.eyeL)}
        {eye(1, face.eyeR)}
        <group position={face.mouth.position} quaternion={face.mouth.quaternion}>
          <mesh rotation-z={Math.PI}>
            <torusGeometry args={[0.1, 0.022, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#3B1F12" roughness={0.4} />
          </mesh>
        </group>
        {[face.blushL, face.blushR].map((b, i) => (
          <mesh key={i} position={b.position} quaternion={b.quaternion}>
            <circleGeometry args={[0.085, 24]} />
            <meshBasicMaterial color="#FF7A7A" transparent opacity={0.45} depthWrite={false} />
          </mesh>
        ))}
        <group position={face.sprout.position} quaternion={face.sprout.quaternion}>
          <group ref={sprout}>
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.022, 0.034, 0.34, 8]} />
              <meshStandardMaterial color="#5FA83A" roughness={0.5} />
            </mesh>
            {[-1, 1].map((k) => (
              <mesh key={k} position={[k * 0.11, 0.33, 0]} rotation={[0, 0, k * -0.55]} scale={[0.15, 0.03, 0.09]}>
                <sphereGeometry args={[1, 16, 10]} />
                <meshStandardMaterial color="#7BC74D" roughness={0.45} />
              </mesh>
            ))}
          </group>
        </group>
        <group position={face.roots.position} quaternion={face.roots.quaternion}>
          <group ref={roots} scale={0.0001}>
            {[0, 1, 2, 3].map((k) => (
              <mesh key={k} rotation={[Math.cos(k * 1.7) * 0.5, 0, Math.sin(k * 1.7) * 0.6]} position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.012, 0.03, 0.45, 6]} />
                <meshStandardMaterial color="#C9A27A" roughness={0.9} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      <group ref={orbit} scale={0.0001}>
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2
          const r = 1.75 + (i % 3) * 0.12
          const pos: [number, number, number] = [Math.cos(a) * r, Math.sin(i * 2.1) * 0.35, Math.sin(a) * r]
          if (i % 3 === 0)
            return (
              <RoundedBox key={i} args={[0.12, 0.62, 0.12]} radius={0.03} smoothness={2} position={pos}>
                <meshStandardMaterial color="#F9C74F" roughness={0.55} />
              </RoundedBox>
            )
          if (i % 3 === 1)
            return (
              <mesh key={i} geometry={chip} position={pos} scale={0.55}>
                <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.45} />
              </mesh>
            )
          return (
            <mesh key={i} position={pos} scale={0.07}>
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}
