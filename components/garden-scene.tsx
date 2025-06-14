"use client"

import React from "react"

import { useState, useEffect, Suspense, useRef, useMemo, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Sky } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { useGardenStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import PlantInventoryBar from "./plant-inventory-bar"
import { getPlantData } from "@/lib/plant-data"
import { CustomErrorBoundary } from "./custom-error-boundary"
import EnhancedUI from "./enhanced-ui"

// Fence post component
function FencePost({ position }) {
  return (
    <group position={position}>
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
  const midX = (start[0] + end[0]) / 2
  const midZ = (start[2] + end[2]) / 2
  const length = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[2] - start[2], 2))
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0])

  return (
    <mesh position={[midX, height, midZ]} rotation={[0, angle, 0]} castShadow>
      <boxGeometry args={[length, 0.1, 0.08]} />
      <meshStandardMaterial color="#A0522D" roughness={0.9} />
    </mesh>
  )
}

// Complete fence around the garden - MEMOIZED
const GardenFence = React.memo(() => {
  const size = 18 // Fence size
  const postSpacing = 3

  // Memoize fence elements to prevent recreation
  const fenceElements = useMemo(() => {
    const posts = []
    const rails = []

    // Front fence
    for (let i = 0; i <= Math.floor((size * 2) / postSpacing); i++) {
      const x = -size + i * postSpacing
      if (x <= size) {
        posts.push(<FencePost key={`front-${i}`} position={[x, 0, -size]} />)
      }
    }

    // Right fence
    for (let i = 1; i <= Math.floor((size * 2) / postSpacing); i++) {
      const z = -size + i * postSpacing
      if (z <= size) {
        posts.push(<FencePost key={`right-${i}`} position={[size, 0, z]} />)
      }
    }

    // Back fence
    for (let i = 1; i <= Math.floor((size * 2) / postSpacing); i++) {
      const x = size - i * postSpacing
      if (x >= -size) {
        posts.push(<FencePost key={`back-${i}`} position={[x, 0, size]} />)
      }
    }

    // Left fence
    for (let i = 1; i < Math.floor((size * 2) / postSpacing); i++) {
      const z = size - i * postSpacing
      if (z > -size) {
        posts.push(<FencePost key={`left-${i}`} position={[-size, 0, z]} />)
      }
    }

    // Add rails
    rails.push(<FenceRail key="front-rail-1" start={[-size, 0, -size]} end={[size, 0, -size]} height={0.3} />)
    rails.push(<FenceRail key="front-rail-2" start={[-size, 0, -size]} end={[size, 0, -size]} height={0.7} />)

    rails.push(<FenceRail key="right-rail-1" start={[size, 0, -size]} end={[size, 0, size]} height={0.3} />)
    rails.push(<FenceRail key="right-rail-2" start={[size, 0, -size]} end={[size, 0, size]} height={0.7} />)

    rails.push(<FenceRail key="back-rail-1" start={[size, 0, size]} end={[-size, 0, size]} height={0.3} />)
    rails.push(<FenceRail key="back-rail-2" start={[size, 0, size]} end={[-size, 0, size]} height={0.7} />)

    rails.push(<FenceRail key="left-rail-1" start={[-size, 0, size]} end={[-size, 0, -size]} height={0.3} />)
    rails.push(<FenceRail key="left-rail-2" start={[-size, 0, size]} end={[-size, 0, -size]} height={0.7} />)

    return [...posts, ...rails]
  }, [])

  return <group>{fenceElements}</group>
})

// Enhanced ground with texture variation - MEMOIZED
const Ground = React.memo(({ onClick }) => {
  // Memoize grass patches to prevent recreation
  const grassPatches = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const x = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 90 + 25)
      const z = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 90 + 25)
      const scale = Math.random() * 0.5 + 0.2
      const color = Math.random() > 0.5 ? "#5d9c6f" : "#3a6349"
      return (
        <mesh key={i} position={[x, -0.08, z]} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]} receiveShadow>
          <circleGeometry args={[scale, 6]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      )
    })
  }, [])

  return (
    <group>
      {/* Main ground plane - positioned lower to avoid clipping */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow onClick={onClick}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#4a7c59" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Grass patches - memoized */}
      {grassPatches}
    </group>
  )
})

// Enhanced garden plot - MEMOIZED
const GardenPlot = React.memo(() => {
  // Memoize soil patches to prevent recreation
  const soilPatches = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => {
      const x = (Math.random() - 0.5) * 28
      const z = (Math.random() - 0.5) * 28
      const scale = Math.random() * 0.3 + 0.1
      return (
        <mesh key={i} position={[x, 0.06, z]} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]} receiveShadow>
          <circleGeometry args={[scale, 5]} />
          <meshStandardMaterial color="#4a2c17" roughness={1} />
        </mesh>
      )
    })
  }, [])

  return (
    <group>
      {/* Main dirt area - positioned at y=0 */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[30, 0.1, 30]} />
        <meshStandardMaterial color="#5D4037" roughness={1} />
      </mesh>

      {/* Soil texture variation - memoized */}
      {soilPatches}
    </group>
  )
})

// Enhanced plant component with better visuals
function EnhancedPlant({ position, color, type, growthStage, onClick, isSelected, rotation = 0 }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const scale = 0.3 + (growthStage || 1) * 0.2

  // Gentle animation for selected plants
  useFrame((state) => {
    if (isSelected && meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.1
    }
  })

  const renderPlantByType = () => {
    switch (type) {
      case "mushroom":
        return (
          <>
            {/* Stem */}
            <mesh position={[0, 0.1 + growthStage * 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.12, 0.2 + growthStage * 0.08, 8]} />
              <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
            </mesh>
            {/* Cap */}
            <mesh position={[0, 0.3 + growthStage * 0.08, 0]} castShadow>
              <sphereGeometry args={[0.15 + growthStage * 0.05, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
            {/* Spots */}
            {[...Array(Math.min(growthStage * 2, 8))].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2
              const radius = 0.12 + growthStage * 0.04
              return (
                <mesh
                  key={i}
                  position={[Math.cos(angle) * radius, 0.32 + growthStage * 0.08, Math.sin(angle) * radius]}
                  castShadow
                >
                  <sphereGeometry args={[0.02, 6, 6]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
              )
            })}
          </>
        )

      case "crystal":
        return (
          <mesh position={[0, 0.2 + growthStage * 0.08, 0]} castShadow>
            <octahedronGeometry args={[0.15 + growthStage * 0.05, 0]} />
            <meshStandardMaterial
              color={color}
              metalness={0.7}
              roughness={0.2}
              emissive={color}
              emissiveIntensity={0.3 + growthStage * 0.1}
            />
          </mesh>
        )

      case "flower":
        return (
          <>
            {/* Stem */}
            <mesh position={[0, 0.15 + growthStage * 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 0.3 + growthStage * 0.15, 8]} />
              <meshStandardMaterial color="#4caf50" roughness={0.8} />
            </mesh>
            {/* Petals */}
            {growthStage >= 2 &&
              [...Array(Math.min(6, growthStage + 2))].map((_, i) => {
                const angle = (i / 6) * Math.PI * 2
                const petalSize = 0.08 + growthStage * 0.02
                return (
                  <mesh
                    key={i}
                    position={[
                      Math.cos(angle) * petalSize * 2,
                      0.35 + growthStage * 0.15,
                      Math.sin(angle) * petalSize * 2,
                    ]}
                    castShadow
                  >
                    <sphereGeometry args={[petalSize, 8, 8]} />
                    <meshStandardMaterial color={color} roughness={0.6} />
                  </mesh>
                )
              })}
            {/* Center */}
            {growthStage >= 3 && (
              <mesh position={[0, 0.35 + growthStage * 0.15, 0]} castShadow>
                <sphereGeometry args={[0.05 + growthStage * 0.02, 8, 8]} />
                <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.2} />
              </mesh>
            )}
          </>
        )

      case "tree":
        return (
          <>
            {/* Trunk */}
            <mesh position={[0, 0.2 + growthStage * 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.12, 0.4 + growthStage * 0.2, 8]} />
              <meshStandardMaterial color="#795548" roughness={0.9} />
            </mesh>
            {/* Foliage layers */}
            {growthStage >= 2 && (
              <mesh position={[0, 0.5 + growthStage * 0.15, 0]} castShadow>
                <coneGeometry args={[0.25 + growthStage * 0.08, 0.4 + growthStage * 0.15, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}
            {growthStage >= 4 && (
              <mesh position={[0, 0.7 + growthStage * 0.15, 0]} castShadow>
                <coneGeometry args={[0.2 + growthStage * 0.06, 0.3 + growthStage * 0.12, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}
          </>
        )

      case "cactus":
        return (
          <>
            {/* Main body */}
            <mesh position={[0, 0.15 + growthStage * 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.3 + growthStage * 0.15, 8]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Ridges */}
            {[...Array(6)].map((_, i) => {
              const angle = (i / 6) * Math.PI * 2
              return (
                <mesh
                  key={i}
                  position={[Math.cos(angle) * 0.09, 0.15 + growthStage * 0.08, Math.sin(angle) * 0.09]}
                  rotation={[0, angle, 0]}
                  castShadow
                >
                  <boxGeometry args={[0.02, 0.3 + growthStage * 0.15, 0.02]} />
                  <meshStandardMaterial color="#4a7c59" roughness={0.9} />
                </mesh>
              )
            })}
            {/* Flower on top for mature cactus */}
            {growthStage >= 5 && (
              <mesh position={[0, 0.4 + growthStage * 0.15, 0]} castShadow>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color="#ff9800" emissive="#ff9800" emissiveIntensity={0.3} />
              </mesh>
            )}
          </>
        )

      default: // basic and others
        return (
          <>
            {/* Leaves/foliage */}
            <mesh position={[0, 0.2 + growthStage * 0.05, 0]} castShadow>
              <sphereGeometry args={[0.15 + growthStage * 0.03, 12, 12]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Additional leaves for higher growth stages */}
            {growthStage >= 3 && (
              <mesh position={[0.1, 0.25 + growthStage * 0.05, 0.1]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <sphereGeometry args={[0.1 + growthStage * 0.02, 8, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}
            {growthStage >= 4 && (
              <mesh position={[-0.1, 0.25 + growthStage * 0.05, -0.1]} rotation={[0, -Math.PI / 4, 0]} castShadow>
                <sphereGeometry args={[0.1 + growthStage * 0.02, 8, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}
          </>
        )
    }
  }

  return (
    <group
      ref={meshRef}
      position={position}
      scale={scale}
      rotation={[0, rotation, 0]}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) onClick()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Decorative pot */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.12, 12]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.9} />
      </mesh>

      {/* Pot rim */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <torusGeometry args={[0.15, 0.02, 8, 16]} />
        <meshStandardMaterial color="#A0522D" roughness={0.8} />
      </mesh>

      {/* Soil */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.02, 12]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>

      {/* Plant-specific geometry */}
      {renderPlantByType()}

      {/* Selection glow effect */}
      {isSelected && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.3, 32]} />
          <meshStandardMaterial
            color={color}
            transparent={true}
            opacity={0.6}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  )
}

// OPTIMIZED Placement indicator - reduced complexity
const PlacementIndicator = React.memo(({ position, color, isValid }) => {
  return (
    <mesh position={[position.x, 0.05, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1.2, 16]} /> {/* Reduced segments from 32 to 16 */}
      <meshStandardMaterial
        color={isValid ? color : "#ff0000"}
        transparent={true}
        opacity={0.5} // Reduced opacity for better performance
        emissive={isValid ? color : "#ff0000"}
        emissiveIntensity={0.3} // Reduced intensity
      />
    </mesh>
  )
})

// OPTIMIZED Mouse tracker - throttled updates
function MouseTracker({ selectedPlantType, onPositionUpdate, plants }) {
  const { camera, mouse, raycaster } = useThree()
  const lastUpdateTime = useRef(0)
  const THROTTLE_MS = 16 // ~60fps throttling

  useFrame((state) => {
    if (selectedPlantType && raycaster) {
      // Throttle updates for better performance
      const now = state.clock.getElapsedTime() * 1000
      if (now - lastUpdateTime.current < THROTTLE_MS) return
      lastUpdateTime.current = now

      try {
        // Update raycaster
        raycaster.setFromCamera(mouse, camera)

        // Create a simple ground plane at y=0
        const groundY = 0
        const cameraPosition = camera.position
        const direction = raycaster.ray.direction

        // Calculate intersection with ground plane (y = 0)
        if (direction.y !== 0) {
          const t = (groundY - cameraPosition.y) / direction.y
          if (t > 0) {
            const intersectionX = cameraPosition.x + direction.x * t
            const intersectionZ = cameraPosition.z + direction.z * t

            // Check if placement is valid
            const halfWidth = 15
            const halfLength = 15
            const isInPlot =
              intersectionX >= -halfWidth &&
              intersectionX <= halfWidth &&
              intersectionZ >= -halfLength &&
              intersectionZ <= halfLength

            const notTooClose = !plants.some((plant) => {
              const dx = plant.position[0] - intersectionX
              const dz = plant.position[2] - intersectionZ
              return Math.sqrt(dx * dx + dz * dz) < 2
            })

            onPositionUpdate({
              position: { x: intersectionX, y: groundY, z: intersectionZ },
              isValid: isInPlot && notTooClose,
            })
          }
        }
      } catch (error) {
        console.warn("Mouse tracking error:", error)
      }
    }
  })

  return null
}

// Main garden scene content
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

  // OPTIMIZED: Memoize position update handler
  const handlePositionUpdate = useCallback(({ position, isValid }) => {
    setPlacementPosition(position)
    setIsValidPlacement(isValid)
  }, [])

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
      <OrbitControls
        minDistance={8}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2 - 0.1}
        target={[0, 0, 0]}
        enablePan={true}
        panSpeed={0.5}
      />

      {/* Sky and environment */}
      <Sky distance={450000} sunPosition={[100, 20, 100]} inclination={0} azimuth={0.25} />

      {/* Enhanced lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <hemisphereLight args={["#87CEEB", "#4a7c59", 0.6]} />

      {/* Mouse tracker for placement highlight */}
      <MouseTracker selectedPlantType={selectedPlantType} onPositionUpdate={handlePositionUpdate} plants={plants} />

      {/* Ground */}
      <Ground onClick={handleGroundClick} />

      {/* Garden plot */}
      <GardenPlot />

      {/* Garden fence */}
      <GardenFence />

      {/* Plants */}
      {plants.map((plant) => (
        <EnhancedPlant
          key={plant.id}
          position={plant.position}
          color={plant.color}
          type={plant.type}
          growthStage={plant.growthStage}
          rotation={plant.rotation || 0}
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
export default function GardenScene({ selectedPlantType, onError, onSelectPlant }) {
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
            camera={{ position: [0, 8, 15], fov: 60 }}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              alpha: false,
              stencil: false,
              depth: true,
            }}
            dpr={[1, 2]}
          >
            <GardenSceneContent
              selectedPlantType={selectedPlantType}
              plantRotation={plantRotation}
              onSelectPlant={onSelectPlant}
            />
          </Canvas>
        </Suspense>
      </CustomErrorBoundary>

      {/* Enhanced UI */}
      <EnhancedUI selectedPlantType={selectedPlantType} onRotatePlant={rotatePlant} />

      {/* Inventory bar */}
      <PlantInventoryBar onSelectPlant={onSelectPlant} selectedPlant={selectedPlantType} />
    </div>
  )
}
