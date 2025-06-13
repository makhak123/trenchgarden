"use client"

import { useRef } from "react"
import type * as THREE from "three"

interface GardenPlotProps {
  position: [number, number, number]
  size: [number, number, number]
}

export default function GardenPlot({ position, size }: GardenPlotProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <mesh position={position} receiveShadow ref={meshRef}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#5d4037" roughness={0.9} metalness={0.1} />
    </mesh>
  )
}
