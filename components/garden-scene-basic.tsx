"use client"

import { useState, useEffect, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { useGardenStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { ShoppingBag, RotateCcw, Users, RotateCw } from "lucide-react"
import { useRouter } from "next/navigation"
import PlantInventoryBar from "./plant-inventory-bar"
import { getPlantData } from "@/lib/plant-data"
import { CustomErrorBoundary } from "./custom-error-boundary"

// Simple ground component
function Ground({ onClick }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow onClick={onClick}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#4a7c59" roughness={0.8} />
    </mesh>
  )
}

// Simple garden plot
function GardenPlot() {
  return (
    <mesh position={[0, 0, 0]} receiveShadow>
      <boxGeometry args={[30, 0.1, 30]} />
      <meshStandardMaterial color="#5D4037" roughness={1} />
    </mesh>
  )
}

// Simple plant component
function SimplePlant({ position, color, type, growthStage, onClick, isSelected }) {
  const scale = 0.2 + (growthStage || 1) * 0.15

  return (
    <group
      position={position}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) onClick()
      }}
    >
      {/* Pot */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.15, 8]} />
        <meshStandardMaterial color="#795548" roughness={0.9} />
      </mesh>

      {/* Plant */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          emissive={isSelected ? color : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>

      {/* Growth indicator */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.1 * (growthStage || 1), 8]} />
        <meshStandardMaterial color="#4caf50" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Placement indicator
function PlacementIndicator({ position, color, isValid }) {
  return (
    <mesh position={[position.x, 0.05, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1, 32]} />
      <meshStandardMaterial color={isValid ? color : "#ff0000"} transparent={true} opacity={0.5} />
    </mesh>
  )
}

// Main garden scene
function GardenSceneContent({ selectedPlantType, plantRotation, onSelectPlant }) {
  const { username, plants, addPlant, updatePlantGrowth } = useGardenStore()
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [placementPosition, setPlacementPosition] = useState({ x: 0, y: 0, z: 0 })
  const [isValidPlacement, setIsValidPlacement] = useState(true)
  const { toast } = useToast()

  // Update plant growth
  useEffect(() => {
    const interval = setInterval(() => {
      updatePlantGrowth()
    }, 5000)
    return () => clearInterval(interval)
  }, [updatePlantGrowth])

  // Handle ground click
  const handleGroundClick = (event) => {
    if (!selectedPlantType) return

    event.stopPropagation()
    const { point } = event

    // Check if inside garden plot
    const halfWidth = 15
    const halfLength = 15
    const isInPlot = point.x >= -halfWidth && point.x <= halfWidth && point.z >= -halfLength && point.z <= halfLength

    if (!isInPlot) {
      toast({
        title: "Invalid location",
        description: "Plants can only be placed inside your garden plot",
        variant: "destructive",
      })
      return
    }

    // Check distance from other plants
    const tooClose = plants.some((plant) => {
      const dx = plant.position[0] - point.x
      const dz = plant.position[2] - point.z
      return Math.sqrt(dx * dx + dz * dz) < 1.5
    })

    if (tooClose) {
      toast({
        title: "Too close",
        description: "Plants need more space between them",
        variant: "destructive",
      })
      return
    }

    // Get plant color
    const plantData = getPlantData(selectedPlantType)
    const color = plantData?.color || "#4caf50"

    addPlant(selectedPlantType, [point.x, 0.05, point.z], color, plantRotation)

    toast({
      title: "Plant added",
      description: `Added ${selectedPlantType} to your garden`,
    })
  }

  return (
    <>
      {/* Camera controls */}
      <OrbitControls minDistance={5} maxDistance={50} maxPolarAngle={Math.PI / 2 - 0.1} target={[0, 0, 0]} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />

      {/* Ground */}
      <Ground onClick={handleGroundClick} />

      {/* Garden plot */}
      <GardenPlot />

      {/* Plants */}
      {plants.map((plant) => (
        <SimplePlant
          key={plant.id}
          position={plant.position}
          color={plant.color}
          type={plant.type}
          growthStage={plant.growthStage}
          onClick={() => setSelectedPlant(plant)}
          isSelected={selectedPlant?.id === plant.id}
        />
      ))}

      {/* Placement indicator */}
      {selectedPlantType && (
        <PlacementIndicator
          position={placementPosition}
          color={getPlantData(selectedPlantType)?.color || "#4caf50"}
          isValid={isValidPlacement}
        />
      )}
    </>
  )
}

// Main component
export default function GardenSceneBasic({ selectedPlantType, onError, onSelectPlant }) {
  const router = useRouter()
  const [plantRotation, setPlantRotation] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  const rotatePlant = (direction) => {
    setPlantRotation((prev) => {
      if (direction === "clockwise") {
        return (prev + Math.PI / 8) % (Math.PI * 2)
      } else {
        return (prev - Math.PI / 8 + Math.PI * 2) % (Math.PI * 2)
      }
    })
  }

  if (!isMounted) {
    return <div className="h-full w-full bg-black"></div>
  }

  return (
    <div className="relative h-full w-full">
      <CustomErrorBoundary
        fallback={({ error, reset }) => {
          if (onError) onError(error)
          return (
            <div className="flex h-full w-full items-center justify-center bg-black">
              <div className="text-center p-8 bg-black/70 rounded-lg border border-green-500/20">
                <h3 className="text-xl font-bold text-green-400 mb-2">3D Garden Error</h3>
                <p className="text-green-200 mb-4">There was an error loading the 3D garden.</p>
                <Button className="bg-green-600 hover:bg-green-700" onClick={reset}>
                  Try Again
                </Button>
              </div>
            </div>
          )
        }}
      >
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-black">
              <div className="text-green-400 text-xl">Loading 3D Garden...</div>
            </div>
          }
        >
          <Canvas
            shadows
            camera={{ position: [0, 5, 10], fov: 60 }}
            gl={{
              antialias: false,
              powerPreference: "default",
              alpha: false,
              stencil: false,
              depth: true,
            }}
            dpr={1}
          >
            <GardenSceneContent
              selectedPlantType={selectedPlantType}
              plantRotation={plantRotation}
              onSelectPlant={onSelectPlant}
            />
          </Canvas>
        </Suspense>
      </CustomErrorBoundary>

      {/* UI Controls */}
      <div className="absolute bottom-24 left-4 flex gap-2">
        {selectedPlantType && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="border-green-600 bg-black/70 text-green-400 hover:bg-green-900/30"
              onClick={() => rotatePlant("counterclockwise")}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-green-600 bg-black/70 text-green-400 hover:bg-green-900/30"
              onClick={() => rotatePlant("clockwise")}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Visit Garden Button */}
      <div className="absolute left-4 top-4 flex items-center gap-2">
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

      {/* Shop Button */}
      <div className="absolute right-4 top-4">
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push("/shop")}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Shop
        </Button>
      </div>

      {/* Inventory bar */}
      <PlantInventoryBar onSelectPlant={onSelectPlant} selectedPlant={selectedPlantType} />
    </div>
  )
}
