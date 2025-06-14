"use client"

import { useState, useEffect, Suspense, useCallback, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sky } from "@react-three/drei"
import { useToast } from "@/hooks/use-toast"
import PlantInventoryBar from "@/components/plant-inventory-bar"
import EnhancedUI from "@/components/enhanced-ui"
import { getPlantData } from "@/lib/plant-data"

// Safe property access
function safeAccess(obj, path, defaultValue = null) {
  if (!obj || typeof obj !== "object") return defaultValue
  try {
    const keys = typeof path === "string" ? path.split(".") : path
    let result = obj
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (result && typeof result === "object" && key in result) {
        result = result[key]
      } else {
        return defaultValue
      }
    }
    return result !== undefined ? result : defaultValue
  } catch (error) {
    return defaultValue
  }
}

// Safe function caller
function safeCall(fn, ...args) {
  try {
    if (typeof fn === "function") {
      return fn.apply(null, args)
    }
    return null
  } catch (error) {
    return null
  }
}

// Advanced fence post component
function FencePost({ position }) {
  const pos = position || [0, 0, 0]
  return (
    <group position={pos}>
      {/* Main post */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#A0522D" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Fence rail component
function FenceRail({ start, end, height }) {
  const startPos = start || [0, 0, 0]
  const endPos = end || [1, 0, 0]
  const railHeight = height || 0.5

  const midX = (startPos[0] + endPos[0]) / 2
  const midZ = (startPos[2] + endPos[2]) / 2
  const length = Math.sqrt(Math.pow(endPos[0] - startPos[0], 2) + Math.pow(endPos[2] - startPos[2], 2))
  const angle = Math.atan2(endPos[2] - startPos[2], endPos[0] - startPos[0])

  return (
    <mesh position={[midX, railHeight, midZ]} rotation={[0, angle, 0]} castShadow>
      <boxGeometry args={[length, 0.1, 0.08]} />
      <meshStandardMaterial color="#A0522D" roughness={0.9} />
    </mesh>
  )
}

// Complete garden fence
function GardenFence() {
  const posts = []
  const rails = []

  // Create fence posts around the perimeter
  const positions = [
    // Front fence
    [-15, 0, -15],
    [-12, 0, -15],
    [-9, 0, -15],
    [-6, 0, -15],
    [-3, 0, -15],
    [0, 0, -15],
    [3, 0, -15],
    [6, 0, -15],
    [9, 0, -15],
    [12, 0, -15],
    [15, 0, -15],
    // Right fence
    [15, 0, -12],
    [15, 0, -9],
    [15, 0, -6],
    [15, 0, -3],
    [15, 0, 0],
    [15, 0, 3],
    [15, 0, 6],
    [15, 0, 9],
    [15, 0, 12],
    [15, 0, 15],
    // Back fence
    [12, 0, 15],
    [9, 0, 15],
    [6, 0, 15],
    [3, 0, 15],
    [0, 0, 15],
    [-3, 0, 15],
    [-6, 0, 15],
    [-9, 0, 15],
    [-12, 0, 15],
    [-15, 0, 15],
    // Left fence
    [-15, 0, 12],
    [-15, 0, 9],
    [-15, 0, 6],
    [-15, 0, 3],
    [-15, 0, 0],
    [-15, 0, -3],
    [-15, 0, -6],
    [-15, 0, -9],
    [-15, 0, -12],
  ]

  positions.forEach((pos, index) => {
    posts.push(<FencePost key={`post-${index}`} position={pos} />)
  })

  // Add horizontal rails
  rails.push(<FenceRail key="front-rail-1" start={[-15, 0, -15]} end={[15, 0, -15]} height={0.3} />)
  rails.push(<FenceRail key="front-rail-2" start={[-15, 0, -15]} end={[15, 0, -15]} height={0.7} />)
  rails.push(<FenceRail key="right-rail-1" start={[15, 0, -15]} end={[15, 0, 15]} height={0.3} />)
  rails.push(<FenceRail key="right-rail-2" start={[15, 0, -15]} end={[15, 0, 15]} height={0.7} />)
  rails.push(<FenceRail key="back-rail-1" start={[15, 0, 15]} end={[-15, 0, 15]} height={0.3} />)
  rails.push(<FenceRail key="back-rail-2" start={[15, 0, 15]} end={[-15, 0, 15]} height={0.7} />)
  rails.push(<FenceRail key="left-rail-1" start={[-15, 0, 15]} end={[-15, 0, -15]} height={0.3} />)
  rails.push(<FenceRail key="left-rail-2" start={[-15, 0, 15]} end={[-15, 0, -15]} height={0.7} />)

  return <group>{[...posts, ...rails]}</group>
}

// Advanced ground with grass texture
function Ground({ onClick }) {
  return (
    <group>
      {/* Main ground plane - grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow onClick={onClick}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#4a7c59" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Add some random grass patches */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 80 + 20)
        const z = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 80 + 20)
        const scale = Math.random() * 0.2 + 0.1
        return (
          <mesh key={i} position={[x, 0, z]} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]} receiveShadow>
            <circleGeometry args={[scale, 5]} />
            <meshStandardMaterial color={Math.random() > 0.5 ? "#5d9c6f" : "#3a6349"} roughness={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}

// Garden plot with raised edges
function GardenPlot() {
  return (
    <group>
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[30, 0.1, 30]} />
        <meshStandardMaterial color="#5D4037" roughness={1} />
      </mesh>
    </group>
  )
}

// Advanced plant component with different types and growth stages
function AdvancedPlant({ position, color, type, growthStage, onClick, isSelected, rotation }) {
  const meshRef = useRef()
  const plantPos = position || [0, 0, 0]
  const plantColor = color || "#4caf50"
  const plantType = type || "basic"
  const growth = growthStage || 1
  const plantRotation = rotation || 0
  const scale = 0.3 + growth * 0.2

  useFrame((state) => {
    try {
      if (isSelected && meshRef.current && meshRef.current.rotation) {
        meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.1
      }
    } catch (error) {
      // Ignore animation errors
    }
  })

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation()
      safeCall(onClick)
    },
    [onClick],
  )

  // Different plant types with detailed geometry
  const renderPlant = () => {
    // Base pot for all plants
    const pot = (
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.1, 8]} />
        <meshStandardMaterial color="#795548" roughness={0.9} />
      </mesh>
    )

    // Plant-specific geometry
    let plantGeometry

    switch (plantType) {
      case "mushroom":
        plantGeometry = (
          <>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 0.1 + growth * 0.03, 8]} />
              <meshStandardMaterial color="#e0e0e0" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.2 + growth * 0.03, 0]} castShadow>
              <sphereGeometry args={[0.08 + growth * 0.02, 8, 8]} />
              <meshStandardMaterial color={plantColor} roughness={0.7} />
            </mesh>
          </>
        )
        break

      case "crystal":
        plantGeometry = (
          <mesh position={[0, 0.15, 0]} castShadow>
            <octahedronGeometry args={[0.1 + growth * 0.02, 0]} />
            <meshStandardMaterial
              color={plantColor}
              metalness={0.5}
              roughness={0.2}
              emissive={plantColor}
              emissiveIntensity={0.3}
            />
          </mesh>
        )
        break

      case "flower":
        plantGeometry = (
          <>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.1 + growth * 0.04, 8]} />
              <meshStandardMaterial color="#4caf50" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.2 + growth * 0.04, 0]} castShadow>
              <sphereGeometry args={[0.08 + growth * 0.02, 8, 8]} />
              <meshStandardMaterial color={plantColor} roughness={0.6} />
            </mesh>
          </>
        )
        break

      case "tree":
        plantGeometry = (
          <>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 0.1 + growth * 0.05, 8]} />
              <meshStandardMaterial color="#795548" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.2 + growth * 0.05, 0]} castShadow>
              <coneGeometry args={[0.1 + growth * 0.02, 0.2 + growth * 0.05, 8]} />
              <meshStandardMaterial color={plantColor} roughness={0.8} />
            </mesh>
          </>
        )
        break

      case "cactus":
        plantGeometry = (
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.05 + growth * 0.01, 0.05 + growth * 0.01, 0.1 + growth * 0.05, 8]} />
            <meshStandardMaterial color={plantColor} roughness={0.8} />
          </mesh>
        )
        break

      case "venus":
        plantGeometry = (
          <>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.1 + growth * 0.03, 8]} />
              <meshStandardMaterial color="#558b2f" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.2 + growth * 0.03, 0]} castShadow>
              <sphereGeometry args={[0.08 + growth * 0.02, 8, 8]} />
              <meshStandardMaterial color={plantColor} roughness={0.7} />
            </mesh>
          </>
        )
        break

      case "bonsai":
        plantGeometry = (
          <>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 0.08 + growth * 0.02, 8]} />
              <meshStandardMaterial color="#5d4037" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.2 + growth * 0.02, 0]} castShadow>
              <sphereGeometry args={[0.08 + growth * 0.02, 8, 8]} />
              <meshStandardMaterial color={plantColor} roughness={0.8} />
            </mesh>
          </>
        )
        break

      default: // basic
        plantGeometry = (
          <mesh position={[0, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.08 + growth * 0.02, 8, 8]} />
            <meshStandardMaterial color={plantColor} roughness={0.8} />
          </mesh>
        )
    }

    return (
      <group ref={meshRef} rotation={[0, plantRotation, 0]}>
        {pot}
        {plantGeometry}
      </group>
    )
  }

  return (
    <group position={plantPos} scale={scale} onClick={handleClick}>
      {renderPlant()}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.3, 16]} />
          <meshStandardMaterial
            color={plantColor}
            transparent={true}
            opacity={0.6}
            emissive={plantColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  )
}

// Garden scene content
function GardenSceneContent({ selectedPlantType, onSelectPlant }) {
  const [plants, setPlants] = useState([])
  const [selectedPlant, setSelectedPlant] = useState(null)
  const { toast } = useToast()

  const handleGroundClick = useCallback(
    (event) => {
      if (!selectedPlantType) return

      try {
        event.stopPropagation()
        const point = safeAccess(event, "point", { x: 0, y: 0, z: 0 })

        // Check if click is inside garden plot
        const halfWidth = 15
        const halfLength = 15
        const isInPlot =
          point.x >= -halfWidth && point.x <= halfWidth && point.z >= -halfLength && point.z <= halfLength

        if (!isInPlot) {
          toast({
            title: "Invalid location",
            description: "Plants can only be placed inside your garden plot",
            variant: "destructive",
          })
          return
        }

        // Check if too close to other plants
        const tooClose = plants.some((plant) => {
          const dx = plant.position[0] - point.x
          const dz = plant.position[2] - point.z
          return Math.sqrt(dx * dx + dz * dz) < 2
        })

        if (tooClose) {
          toast({
            title: "Too close",
            description: "Plants need more space between them",
            variant: "destructive",
          })
          return
        }

        const plantData = getPlantData(selectedPlantType)
        const color = plantData?.color || "#4caf50"

        const newPlant = {
          id: Date.now(),
          type: selectedPlantType,
          position: [point.x, 0.05, point.z],
          color: color,
          growthStage: 1,
          rotation: Math.random() * Math.PI * 2,
        }

        setPlants((prev) => [...prev, newPlant])

        toast({
          title: "Plant added",
          description: `Added ${selectedPlantType} to your garden`,
        })
      } catch (error) {
        // Ignore errors
      }
    },
    [selectedPlantType, plants, toast],
  )

  return (
    <>
      <OrbitControls
        minDistance={8}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2 - 0.1}
        target={[0, 0, 0]}
        enablePan={true}
        panSpeed={0.5}
      />

      <Sky distance={450000} sunPosition={[100, 20, 100]} inclination={0} azimuth={0.25} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <hemisphereLight args={["#87CEEB", "#4a7c59", 0.6]} />

      <Ground onClick={handleGroundClick} />
      <GardenPlot />
      <GardenFence />

      {plants.map((plant) => (
        <AdvancedPlant
          key={plant.id}
          position={plant.position}
          color={plant.color}
          type={plant.type}
          growthStage={plant.growthStage}
          rotation={plant.rotation}
          onClick={() => setSelectedPlant(plant)}
          isSelected={selectedPlant?.id === plant.id}
        />
      ))}
    </>
  )
}

// Main component
export default function GardenPage() {
  const [selectedPlantType, setSelectedPlantType] = useState(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="min-h-screen bg-black" />
  }

  return (
    <div className="h-screen w-full bg-black">
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <Canvas
          shadows
          camera={{ position: [0, 1.7, 10], fov: 60 }}
          gl={{
            antialias: false,
            powerPreference: "default",
            alpha: false,
            stencil: false,
            depth: true,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
          }}
          dpr={1}
        >
          <GardenSceneContent selectedPlantType={selectedPlantType} onSelectPlant={setSelectedPlantType} />
        </Canvas>
      </Suspense>

      <EnhancedUI selectedPlantType={selectedPlantType} onRotatePlant={() => {}} />
      <PlantInventoryBar onSelectPlant={setSelectedPlantType} selectedPlant={selectedPlantType} />
    </div>
  )
}
