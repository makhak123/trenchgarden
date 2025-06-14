"use client"

import { useState, useEffect, Suspense, useRef, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Sky } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { useGardenStoreSafe } from "@/lib/store-safe"
import { useToast } from "@/hooks/use-toast"
import PlantInventoryBar from "./plant-inventory-bar"
import { getPlantData } from "@/lib/plant-data"
import { CustomErrorBoundary } from "./custom-error-boundary"
import EnhancedUI from "./enhanced-ui"

// Safe property access without eval
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
    console.warn("Safe access error:", error)
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
    console.warn("Safe call error:", error)
    return null
  }
}

// Simple fence post component
function FencePost({ position }) {
  const pos = position || [0, 0, 0]

  return (
    <group position={pos}>
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

// Simple fence rail component
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

// Garden fence component
function GardenFence() {
  const size = 18
  const postSpacing = 3

  const posts = []
  const rails = []

  // Create fence posts and rails manually to avoid complex loops
  const positions = [
    // Front fence
    [-18, 0, -18],
    [-15, 0, -18],
    [-12, 0, -18],
    [-9, 0, -18],
    [-6, 0, -18],
    [-3, 0, -18],
    [0, 0, -18],
    [3, 0, -18],
    [6, 0, -18],
    [9, 0, -18],
    [12, 0, -18],
    [15, 0, -18],
    [18, 0, -18],
    // Right fence
    [18, 0, -15],
    [18, 0, -12],
    [18, 0, -9],
    [18, 0, -6],
    [18, 0, -3],
    [18, 0, 0],
    [18, 0, 3],
    [18, 0, 6],
    [18, 0, 9],
    [18, 0, 12],
    [18, 0, 15],
    [18, 0, 18],
    // Back fence
    [15, 0, 18],
    [12, 0, 18],
    [9, 0, 18],
    [6, 0, 18],
    [3, 0, 18],
    [0, 0, 18],
    [-3, 0, 18],
    [-6, 0, 18],
    [-9, 0, 18],
    [-12, 0, 18],
    [-15, 0, 18],
    [-18, 0, 18],
    // Left fence
    [-18, 0, 15],
    [-18, 0, 12],
    [-18, 0, 9],
    [-18, 0, 6],
    [-18, 0, 3],
    [-18, 0, 0],
    [-18, 0, -3],
    [-18, 0, -6],
    [-18, 0, -9],
    [-18, 0, -12],
    [-18, 0, -15],
  ]

  positions.forEach((pos, index) => {
    posts.push(<FencePost key={`post-${index}`} position={pos} />)
  })

  // Add rails
  rails.push(<FenceRail key="front-rail-1" start={[-18, 0, -18]} end={[18, 0, -18]} height={0.3} />)
  rails.push(<FenceRail key="front-rail-2" start={[-18, 0, -18]} end={[18, 0, -18]} height={0.7} />)
  rails.push(<FenceRail key="right-rail-1" start={[18, 0, -18]} end={[18, 0, 18]} height={0.3} />)
  rails.push(<FenceRail key="right-rail-2" start={[18, 0, -18]} end={[18, 0, 18]} height={0.7} />)
  rails.push(<FenceRail key="back-rail-1" start={[18, 0, 18]} end={[-18, 0, 18]} height={0.3} />)
  rails.push(<FenceRail key="back-rail-2" start={[18, 0, 18]} end={[-18, 0, 18]} height={0.7} />)
  rails.push(<FenceRail key="left-rail-1" start={[-18, 0, 18]} end={[-18, 0, -18]} height={0.3} />)
  rails.push(<FenceRail key="left-rail-2" start={[-18, 0, 18]} end={[-18, 0, -18]} height={0.7} />)

  return <group>{[...posts, ...rails]}</group>
}

// Simple ground component
function Ground({ onClick }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow onClick={onClick}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#4a7c59" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  )
}

// Simple garden plot
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

// Simple plant component
function SimplePlant({ position, color, type, growthStage, onClick, isSelected, rotation }) {
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

  return (
    <group ref={meshRef} position={plantPos} scale={scale} rotation={[0, plantRotation, 0]} onClick={handleClick}>
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

      {/* Plant based on type */}
      {plantType === "mushroom" ? (
        <>
          <mesh position={[0, 0.1 + growth * 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.2 + growth * 0.08, 8]} />
            <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.3 + growth * 0.08, 0]} castShadow>
            <sphereGeometry args={[0.15 + growth * 0.05, 12, 8]} />
            <meshStandardMaterial color={plantColor} roughness={0.7} />
          </mesh>
        </>
      ) : plantType === "crystal" ? (
        <mesh position={[0, 0.2 + growth * 0.08, 0]} castShadow>
          <octahedronGeometry args={[0.15 + growth * 0.05, 0]} />
          <meshStandardMaterial
            color={plantColor}
            metalness={0.7}
            roughness={0.2}
            emissive={plantColor}
            emissiveIntensity={0.3 + growth * 0.1}
          />
        </mesh>
      ) : (
        <mesh position={[0, 0.2 + growth * 0.05, 0]} castShadow>
          <sphereGeometry args={[0.15 + growth * 0.03, 12, 12]} />
          <meshStandardMaterial color={plantColor} roughness={0.8} />
        </mesh>
      )}

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

// Placement indicator
function PlacementIndicator({ position, color, isValid }) {
  const pos = position || { x: 0, y: 0, z: 0 }
  const indicatorColor = isValid ? color || "#4caf50" : "#ff0000"

  return (
    <mesh position={[pos.x, 0.05, pos.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1.2, 16]} />
      <meshStandardMaterial
        color={indicatorColor}
        transparent={true}
        opacity={0.5}
        emissive={indicatorColor}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

// Mouse tracker
function MouseTracker({ selectedPlantType, onPositionUpdate, plants }) {
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

          const plantsArray = plants || []
          const notTooClose = !plantsArray.some((plant) => {
            const plantPos = safeAccess(plant, "position", [0, 0, 0])
            const dx = plantPos[0] - intersectionX
            const dz = plantPos[2] - intersectionZ
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
function GardenSceneContent({ selectedPlantType, plantRotation, onSelectPlant }) {
  const store = useGardenStoreSafe()
  const username = safeAccess(store, "username", "Player")
  const plants = safeAccess(store, "plants", [])
  const addPlant = safeAccess(store, "addPlant", () => {})
  const updatePlantGrowth = safeAccess(store, "updatePlantGrowth", () => {})

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
        const point = safeAccess(event, "point", { x: 0, y: 0, z: 0 })

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

        const plantsArray = plants || []
        const tooClose = plantsArray.some((plant) => {
          const plantPos = safeAccess(plant, "position", [0, 0, 0])
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
        const color = safeAccess(plantData, "color", "#4caf50")

        safeCall(addPlant, selectedPlantType, [point.x, 0.05, point.z], color, plantRotation || 0)

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

      <Sky distance={450000} sunPosition={[100, 20, 100]} inclination={0} azimuth={0.25} />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
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

      {plants &&
        plants.map &&
        plants.map((plant, index) => (
          <SimplePlant
            key={safeAccess(plant, "id", `plant-${index}`)}
            position={safeAccess(plant, "position", [0, 0, 0])}
            color={safeAccess(plant, "color", "#4caf50")}
            type={safeAccess(plant, "type", "basic")}
            growthStage={safeAccess(plant, "growthStage", 1)}
            rotation={safeAccess(plant, "rotation", 0)}
            onClick={() => setSelectedPlant(plant)}
            isSelected={safeAccess(selectedPlant, "id") === safeAccess(plant, "id")}
          />
        ))}

      {selectedPlantType && (
        <PlacementIndicator
          position={placementPosition}
          color={safeAccess(getPlantData(selectedPlantType), "color", "#4caf50")}
          isValid={isValidPlacement}
        />
      )}
    </>
  )
}

// Main garden scene component
export default function GardenSceneSafe({ selectedPlantType, onError, onSelectPlant }) {
  const [plantRotation, setPlantRotation] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [contextLost, setContextLost] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setIsMounted(true)
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
              antialias: false,
              powerPreference: "default",
              alpha: false,
              stencil: false,
              depth: true,
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false,
            }}
            dpr={1}
            onCreated={(state) => {
              try {
                const gl = safeAccess(state, "gl")
                const domElement = safeAccess(gl, "domElement")

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

                  if (domElement.addEventListener) {
                    domElement.addEventListener("webglcontextlost", handleContextLost, false)
                    domElement.addEventListener("webglcontextrestored", handleContextRestored, false)
                  }
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
