import { useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import Character from './Character'
import Dishes from './Dishes'

export default function Scene() {
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio, 1.75))
  return (
    <div className="stage3d" aria-hidden>
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 7], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(window.devicePixelRatio, 1.75))} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} color="#FFE8C2" />
        <directionalLight position={[-4, -1, -3]} intensity={1.4} color="#9EC9FF" />
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 3, 1]} color="#FFF4E0" />
          <Lightformer form="ring" intensity={4} position={[-4, 1, 2]} scale={2} color="#FFD27A" />
          <Lightformer form="rect" intensity={2} position={[4, -1, -2]} scale={[3, 6, 1]} color="#FFE9C9" />
          <Lightformer form="circle" intensity={1.5} position={[0, -4, 1]} scale={4} color="#FFD9A8" />
          <Lightformer form="rect" intensity={2.5} position={[0, 0, 6]} scale={[10, 10, 1]} color="#FFF4E0" />
        </Environment>
        <Character />
        <Dishes />
      </Canvas>
    </div>
  )
}
