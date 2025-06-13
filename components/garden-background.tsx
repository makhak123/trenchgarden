"use client"

import { Suspense, useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import Plant3D from "@/app/components/Plant3D"
import type { Plant } from "@/lib/store"

// Garden scene for the background
const GardenScene = () => {
  // Create a beautiful garden with various plants
  const samplePlants: Plant[] = [
    {
      id: "sample-1",
      type: "flower",
      position: [-2, 0.05, -2],
      growthStage: 5,
      color: "#ffc107",
      plantedAt: Date.now(),
      owner: "Trench Garden",
      rotation: Math.PI * 0.2,
      lastGrowthUpdate: Date.now(),
    },
    {
      id: "sample-2",
      type: "crystal",
      position: [2, 0.05, -1],
      growthStage: 5,
      color: "#2196f3",
      plantedAt: Date.now(),
      owner: "Trench Garden",
      rotation: Math.PI * 0.7,
      lastGrowthUpdate: Date.now(),
    },
    {
      id: "sample-3",
      type: "mushroom",
      position: [-1, 0.05, 1],
      growthStage: 5,
      color: "#f44336",
      plantedAt: Date.now(),
      owner: "Trench Garden",
      rotation: Math.PI * 1.2,
      lastGrowthUpdate: Date.now(),
    },
    {
      id: "sample-4",
      type: "legendary",
      position: [0, 0.05, -3],
      growthStage: 5,
      color: "#e91e63",
      plantedAt: Date.now(),
      owner: "Trench Garden",
      rotation: Math.PI * 0.5,
      lastGrowthUpdate: Date.now(),
    },
    {
      id: "sample-5",
      type: "bonsai",
      position: [3, 0.05, 2],
      growthStage: 5,
      color: "#81c784",
      plantedAt: Date.now(),
      owner: "Trench Garden",
      rotation: Math.PI * 1.8,
      lastGrowthUpdate: Date.now(),
    },
    {
      id: "sample-6",
      type: "venus",
      position: [-3, 0.05, 0],
      growthStage: 5,
      color: "#8bc34a",
      plantedAt: Date.now(),
      owner: "Trench Garden",
      rotation: Math.PI * 0.3,
      lastGrowthUpdate: Date.now(),
    },
    {
      id: "sample-7",
      type: "cactus",
      position: [1, 0.05, 3],
      growthStage: 5,
      color: "#66bb6a",
      plantedAt: Date.now(),
      owner: "Trench Garden",
      rotation: Math.PI * 1.5,
      lastGrowthUpdate: Date.now(),
    },
  ]

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.6} />

      {/* Directional light with shadows */}
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />

      {/* Hemisphere light for better color */}
      <hemisphereLight args={["#87CEEB", "#4a7c59", 0.6]} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>

      {/* Plants */}
      {samplePlants.map((plant) => (
        <Plant3D
          key={plant.id}
          position={plant.position}
          plantType={plant.type}
          growthStage={plant.growthStage}
          color={plant.color}
          showInfo={false}
        />
      ))}

      {/* Slow auto-rotation */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minPolarAngle={Math.PI / 4}
      />
    </>
  )
}

// Add this at the end of the file, replacing the current export default
export default function GardenBackground() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  if (!isMounted) {
    return <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 to-black"></div>
  }

  return (
    <div className="absolute inset-0">
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-b from-green-900/50 to-black"></div>}>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
          <GardenScene />
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.8} />
          </EffectComposer>
          <Environment preset="sunset" />
        </Canvas>
      </Suspense>
    </div>
  )
}
