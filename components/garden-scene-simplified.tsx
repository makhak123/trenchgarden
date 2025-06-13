"use client"

import { useState, useEffect, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Sky } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { useGardenStore } from "@/lib/store"
import { ShoppingBag, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import PlantInventoryBar from "./plant-inventory-bar"

// Simple ground component
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#4a7c59" roughness={0.8} />
    </mesh>
  )
}

// Simple plant component
function Plant({ position, color }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.15, 8]} />
        <meshStandardMaterial color="#795548" roughness={0.9} />
      </mesh>

      {/* Plant */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  )
}

// Main garden scene
function GardenScene3D() {
  const { plants } = useGardenStore()

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />

      {/* Sky */}
      <Sky sunPosition={[100, 10, 100]} />

      {/* Ground */}
      <Ground />

      {/* Plants */}
      {plants.map((plant) => (
        <Plant key={plant.id} position={plant.position} color={plant.color} />
      ))}

      {/* Controls */}
      <OrbitControls minDistance={5} maxDistance={50} maxPolarAngle={Math.PI / 2 - 0.1} />
    </>
  )
}

// Main component
export default function GardenSceneWrapper({ selectedPlantType }) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  if (!isMounted) {
    return <div className="h-full w-full bg-black"></div>
  }

  return (
    <div className="relative h-full w-full">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <Suspense fallback={null}>
          <GardenScene3D />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>

      {/* UI Controls */}
      <div className="absolute left-4 top-4">
        <Button
          variant="outline"
          size="sm"
          className="border-green-600 bg-black/70 text-green-400 hover:bg-green-900/30"
          onClick={() => router.push("/visit")}
        >
          <Users className="mr-2 h-4 w-4" />
          Visit Gardens
        </Button>
      </div>

      <div className="absolute right-4 top-4">
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push("/shop")}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Shop
        </Button>
      </div>

      {/* Inventory bar */}
      <PlantInventoryBar onSelectPlant={() => {}} selectedPlant={selectedPlantType} />
    </div>
  )
}
