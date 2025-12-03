import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Mesh } from 'three'

interface RotatingCubeProps {
  color: string
}

function RotatingCube({ color }: RotatingCubeProps) {
  const meshRef = useRef<Mesh>(null!)
  
  useFrame((_state, delta) => {
    meshRef.current.rotation.x += delta
    meshRef.current.rotation.y += delta * 0.5
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export function GameCanvas({ color }: { color: string }) {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <RotatingCube color={color} />
      <OrbitControls />
      <gridHelper args={[10, 10]} />
    </Canvas>
  )
}
