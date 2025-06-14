"use client"

import React, { useState, useEffect, Suspense, useRef, useMemo, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Sky, Environment } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { useGardenStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import PlantInventoryBar from "./plant-inventory-bar"
import { getPlantData } from "@/lib/plant-data"
import { CustomErrorBoundary } from "./custom-error-boundary"
import EnhancedUI from "./enhanced-ui"
import { safeGet, safeCall, setupGlobalErrorHandler } from "@/lib/safe-access"

// Initialize safe access
if (typeof window !== "undefined") {
  setupGlobalErrorHandler()
}

// Fence post component with safe Three.js usage
function FencePost({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#A0522D" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Fence rail component
function FenceRail({ start = [0, 0, 0], end = [1, 0, 0], height = 0.5 }) {
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

// Garden fence with memoization
const GardenFence = React.memo(() => {
  const size = 18
  const postSpacing = 3

  const fenceElements = useMemo(() => {
    const posts = []
    const rails = []

    try {
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

      // Rails
      rails.push(<FenceRail key="front-rail-1" start={[-size, 0, -size]} end={[size, 0, -size]} height={0.3} />)
      rails.push(<FenceRail key="front-rail-2" start={[-size, 0, -size]} end={[size, 0, -size]} height={0.7} />)
      rails.push(<FenceRail key="right-rail-1" start={[size, 0, -size]} end={[size, 0, size]} height={0.3} />)
      rails.push(<FenceRail key="right-rail-2" start={[size, 0, -size]} end={[size, 0, size]} height={0.7} />)
      rails.push(<FenceRail key="back-rail-1" start={[size, 0, size]} end={[-size, 0, size]} height={0.3} />)
      rails.push(<FenceRail key="back-rail-2" start={[size, 0, size]} end={[-size, 0, size]} height={0.7} />)
      rails.push(<FenceRail key="left-rail-1" start={[-size, 0, size]} end={[-size, 0, -size]} height={0.3} />)
      rails.push(<FenceRail key="left-rail-2" start={[-size, 0, size]} end={[-size, 0, -size]} height={0.7} />)

      return [...posts, ...rails]
    } catch (error) {
      console.warn("Error creating fence elements:", error)
      return []
    }
  }, [size, postSpacing])

  return <group>{fenceElements}</group>
})

GardenFence.displayName = "GardenFence"

// Ground component with safe rendering
const Ground = React.memo(({ onClick }) => {
  const grassPatches = useMemo(() => {
    try {
      return Array.from({ length: 15 }).map((_, i) => {
        const x = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 90 + 25)
        const z = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 90 + 25)
        const scale = Math.random() * 0.5 + 0.2
        const color = Math.random() > 0.5 ? "#5d9c6f" : "#3a6349"

        return (
          <mesh
            key={i}
            position={[x, -0.08, z]}
            rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]}
            receiveShadow
          >
            <circleGeometry args={[scale, 6]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        )
      })
    } catch (error) {
      console.warn("Error creating grass patches:", error)
      return []
    }
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow onClick={onClick}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#4a7c59" roughness={0.8} metalness={0.1} />
      </mesh>
      {grassPatches}
    </group>
  )
})

Ground.displayName = "Ground"

// Garden plot component
const GardenPlot = React.memo(() => {
  const soilPatches = useMemo(() => {
    try {
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
    } catch (error) {
      console.warn("Error creating soil patches:", error)
      return []
    }
  }, [])

  return (
    <group>
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[30, 0.1, 30]} />
        <meshStandardMaterial color="#5D4037" roughness={1} />
      </mesh>
      {soilPatches}
    </group>
  )
})

GardenPlot.displayName = "GardenPlot"

// Enhanced plant component with safe rendering
function EnhancedPlant({
  position = [0, 0, 0],
  color = "#4caf50",
  type = "basic",
  growthStage = 1,
  onClick,
  isSelected = false,
  rotation = 0,
}) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const scale = 0.3 + (growthStage || 1) * 0.2

  useFrame((state) => {
    try {
      if (isSelected && meshRef.current) {
        const mesh = meshRef.current
        if (mesh && mesh.rotation) {
          mesh.rotation.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.1
        }
      }
    } catch (error) {
      console.warn("Error in plant animation:", error)
    }
  })

  const renderPlantByType = useCallback(() => {
    try {
      switch (type) {
        case "mushroom":
          return (
            <>
              <mesh position={[0, 0.1 + growthStage * 0.05, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.12, 0.2 + growthStage * 0.08, 8]} />
                <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.3 + growthStage * 0.08, 0]} castShadow>
                <sphereGeometry args={[0.15 + growthStage * 0.05, 12, 8]} />
                <meshStandardMaterial color={color} roughness={0.7} />
              </mesh>
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
              <mesh position={[0, 0.15 + growthStage * 0.08, 0]} castShadow>
                <cylinderGeometry args={[0.03, 0.04, 0.3 + growthStage * 0.15, 8]} />
                <meshStandardMaterial color="#4caf50" roughness={0.8} />
              </mesh>
              {growthStage >= 2 && (
                <mesh position={[0, 0.35 + growthStage * 0.15, 0]} castShadow>
                  <sphereGeometry args={[0.08 + growthStage * 0.02, 8, 8]} />
                  <meshStandardMaterial color={color} roughness={0.6} />
                </mesh>
              )}
            </>
          )

        default:
          return (
            <mesh position={[0, 0.2 + growthStage * 0.05, 0]} castShadow>
              <sphereGeometry args={[0.15 + growthStage * 0.03, 12, 12]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
          )
      }
    } catch (error) {
      console.warn("Error rendering plant type:", error)
      return (
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      )
    }
  }, [type, color, growthStage])

  return (
    <group
      ref={meshRef}
      position={position}
      scale={scale}
      rotation={[0, rotation, 0]}
      onClick={(e) => {
        e.stopPropagation()
        safeCall(onClick)
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Pot */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.12, 12]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.9} />
      </mesh>

      {/* Soil */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.02, 12]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>

      {/* Plant */}
      {renderPlantByType()}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.3, 16]} />
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

// Placement indicator
const PlacementIndicator = React.memo(({ position = { x: 0, y: 0, z: 0 }, color = "#4caf50", isValid = true }) => {
  return (
    <mesh position={[position.x, 0.05, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1.2, 16]} />
      <meshStandardMaterial
        color={isValid ? color : "#ff0000"}
        transparent={true}
        opacity={0.5}
        emissive={isValid ? color : "#ff0000"}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
})

PlacementIndicator.displayName = "PlacementIndicator"

// Mouse tracker with safe Three.js usage
function MouseTracker({ selectedPlantType, onPositionUpdate, plants = [] }) {
  const { camera, mouse, raycaster } = useThree()
  const lastUpdateTime = useRef(0)
  const THROTTLE_MS = 16

  useFrame((state) => {
    if (!selectedPlantType || !raycaster) return

    try {
      const now = state.clock.getElapsedTime() * 1000
      if (now - lastUpdateTime.current < THROTTLE_MS) return
      lastUpdateTime.current = now

      raycaster.setFromCamera(mouse, camera)

      const groundY = 0
      const cameraPosition = camera.position
      const direction = raycaster.ray.direction

      if (direction.y !== 0) {
        const t = (groundY - cameraPosition.y) / direction.y
        if (t > 0) {
          const intersectionX = cameraPosition.x + direction.x * t
          const intersectionZ = cameraPosition.z + direction.z * t

          const halfWidth = 15
          const halfLength = 15
          const isInPlot =
            intersectionX >= -halfWidth &&
            intersectionX <= halfWidth &&
            intersectionZ >= -halfLength &&
            intersectionZ <= halfLength

          const notTooClose = !plants.some((plant) => {
            const dx = safeGet(plant, "position.0", 0) - intersectionX
            const dz = safeGet(plant, "position.2", 0) - intersectionZ
            return Math.sqrt(dx * dx + dz * dz) < 2
          })

          safeCall(onPositionUpdate, {
            position: { x: intersectionX, y: groundY, z: intersectionZ },
            isValid: isInPlot && notTooClose,
          })
        }
      }
    } catch (error) {
      console.warn("Mouse tracking error:", error)
    }
  })

  return null
}

// Main garden scene content
function GardenSceneContent({ selectedPlantType, plantRotation = 0, onSelectPlant }) {
  const store = useGardenStore()
  const username = safeGet(store, "username", "Player")
  const plants = safeGet(store, "plants", [])
  const addPlant = safeGet(store, "addPlant", () => {})
  const updatePlantGrowth = safeGet(store, "updatePlantGrowth", () => {})

  const [selectedPlant, setSelectedPlant] = useState(null)
  const [placementPosition, setPlacementPosition] = useState({ x: 0, y: 0, z: 0 })
  const [isValidPlacement, setIsValidPlacement] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const interval = setInterval(() => {
      safeCall(updatePlantGrowth)
    }, 5000)
    return () => clearInterval(interval)
  }, [updatePlantGrowth])

  const handlePositionUpdate = useCallback(({ position, isValid }) => {
    setPlacementPosition(position)
    setIsValidPlacement(isValid)
  }, [])

  const handleGroundClick = useCallback(
    (event) => {
      if (!selectedPlantType) return

      try {
        event.stopPropagation()
        const point = safeGet(event, "point", { x: 0, y: 0, z: 0 })

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

        const tooClose = plants.some((plant) => {
          const plantPos = safeGet(plant, "position", [0, 0, 0])
          const dx = plantPos[0] - point.x
          const dz = plantPos[2] - point.z
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
        const color = safeGet(plantData, "color", "#4caf50")

        safeCall(addPlant, selectedPlantType, [point.x, 0.05, point.z], color, plantRotation)

        toast({
          title: "Plant added",
          description: `Added ${selectedPlantType} to your garden`,
        })
      } catch (error) {
        console.warn("Error handling ground click:", error)
      }
    },
    [selectedPlantType, plants, addPlant, plantRotation, toast],
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

      <Environment preset="park" />
      <Sky distance={450000} sunPosition={[100, 20, 100]} inclination={0} azimuth={0.25} />

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

      <MouseTracker selectedPlantType={selectedPlantType} onPositionUpdate={handlePositionUpdate} plants={plants} />

      <Ground onClick={handleGroundClick} />
      <GardenPlot />
      <GardenFence />

      {plants.map((plant) => (
        <EnhancedPlant
          key={safeGet(plant, "id", Math.random())}
          position={safeGet(plant, "position", [0, 0, 0])}
          color={safeGet(plant, "color", "#4caf50")}
          type={safeGet(plant, "type", "basic")}
          growthStage={safeGet(plant, "growthStage", 1)}
          rotation={safeGet(plant, "rotation", 0)}
          onClick={() => setSelectedPlant(plant)}
          isSelected={safeGet(selectedPlant, "id") === safeGet(plant, "id")}
        />
      ))}

      {selectedPlantType && (
        <PlacementIndicator
          position={placementPosition}
          color={safeGet(getPlantData(selectedPlantType), "color", "#4caf50")}
          isValid={isValidPlacement}
        />
      )}
    </>
  )
}

// Main garden scene component
export default function GardenScene({ selectedPlantType, onError, onSelectPlant }) {
  const [plantRotation, setPlantRotation] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [contextLost, setContextLost] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setIsMounted(true)
    setupGlobalErrorHandler()
    return () => setIsMounted(false)
  }, [])

  const rotatePlant = useCallback((direction) => {
    setPlantRotation((prev) => {
      if (direction === "clockwise") {
        return (prev + Math.PI / 8) % (Math.PI * 2)
      } else {
        return (prev - Math.PI / 8 + Math.PI * 2) % (Math.PI * 2)
      }
    })
  }, [])

  const handleContextRecovery = useCallback(() => {
    console.log("Attempting WebGL context recovery...")
    setContextLost(false)
    setRetryCount((prev) => prev + 1)
  }, [])

  if (!isMounted) {
    return <div className="h-full w-full bg-black"></div>
  }

  if (contextLost) {
    return (
      <div className="relative h-full w-full">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90">
          <div className="text-center p-8 bg-black/70 rounded-lg border border-green-500/20 max-w-md">
            <h3 className="text-xl font-bold text-green-400 mb-2">3D Context Recovery</h3>
            <p className="text-green-200 mb-4">
              The 3D graphics context was lost. This can happen due to browser memory management or GPU issues.
            </p>
            <div className="flex flex-col gap-2">
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleContextRecovery}>
                Restore 3D Garden
              </Button>
              <Button
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-900/20"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 to-black"></div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <CustomErrorBoundary
        fallback={({ error, reset }) => {
          safeCall(onError, error)
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
            key={`garden-canvas-${retryCount}`}
            shadows
            camera={{ position: [0, 8, 15], fov: 60 }}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              alpha: false,
              stencil: false,
              depth: true,
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false,
            }}
            dpr={[1, 2]}
            onCreated={(state) => {
              try {
                const gl = safeGet(state, "gl")
                const domElement = safeGet(gl, "domElement")

                if (gl && domElement) {
                  const handleContextLost = (event) => {
                    try {
                      event.preventDefault()
                      console.warn("WebGL context lost - attempting recovery")
                      setContextLost(true)
                    } catch (error) {
                      console.error("Error handling context lost:", error)
                    }
                  }

                  const handleContextRestored = () => {
                    try {
                      console.log("WebGL context restored")
                      setContextLost(false)
                    } catch (error) {
                      console.error("Error handling context restored:", error)
                    }
                  }

                  safeCall(domElement.addEventListener?.bind(domElement), "webglcontextlost", handleContextLost, false)
                  safeCall(
                    domElement.addEventListener?.bind(domElement),
                    "webglcontextrestored",
                    handleContextRestored,
                    false,
                  )
                }
              } catch (error) {
                console.error("Error in Canvas onCreated:", error)
                setContextLost(true)
              }
            }}
            onError={(error) => {
              console.error("Canvas error:", error)
              setContextLost(true)
            }}
          >
            <GardenSceneContent
              selectedPlantType={selectedPlantType}
              plantRotation={plantRotation}
              onSelectPlant={onSelectPlant}
            />
          </Canvas>
        </Suspense>
      </CustomErrorBoundary>

      <EnhancedUI selectedPlantType={selectedPlantType} onRotatePlant={rotatePlant} />
      <PlantInventoryBar onSelectPlant={onSelectPlant} selectedPlant={selectedPlantType} />
    </div>
  )
}
