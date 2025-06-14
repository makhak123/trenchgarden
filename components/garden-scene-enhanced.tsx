"use client"

import { useRef, useState, Suspense, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { useGardenStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/lib/icon-loader" // Import from our utility
import { useRouter } from "next/navigation"
import PlantInventoryBar from "./plant-inventory-bar"
import { getPlantData } from "@/lib/plant-data"
import { Vector3, Raycaster, Plane } from "three"
import { Progress } from "@/components/ui/progress"

// Function to check if a URL is a blob URL
function isBlobUrl(url) {
  return url && typeof url === "string" && url.startsWith("blob:")
}

// Low-poly wooden fence post
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

// Fence rail (horizontal piece)
function FenceRail({ start, end, height }) {
  // Calculate the midpoint and length
  const midX = (start[0] + end[0]) / 2
  const midZ = (start[2] + end[2]) / 2
  const length = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[2] - start[2], 2))

  // Calculate rotation angle
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0])

  return (
    <mesh position={[midX, height, midZ]} rotation={[0, angle, 0]} castShadow>
      <boxGeometry args={[length, 0.1, 0.08]} />
      <meshStandardMaterial color="#A0522D" roughness={0.9} />
    </mesh>
  )
}

// Complete fence section
function FenceSection({ start, end, postSpacing = 3 }) {
  const posts = []
  const rails = []

  // Calculate the direction and length
  const dirX = end[0] - start[0]
  const dirZ = end[2] - start[2]
  const length = Math.sqrt(dirX * dirX + dirZ * dirZ)

  // Normalize direction
  const normDirX = dirX / length
  const normDirZ = dirZ / length

  // Calculate number of posts
  const numPosts = Math.max(2, Math.ceil(length / postSpacing) + 1)

  // Create posts
  for (let i = 0; i < numPosts; i++) {
    const t = i / (numPosts - 1)
    const x = start[0] + t * dirX
    const z = start[2] + t * dirZ
    posts.push(<FencePost key={`post-${i}`} position={[x, 0, z]} />)
  }

  // Create rails
  rails.push(<FenceRail key="rail-1" start={start} end={end} height={0.3} />)
  rails.push(<FenceRail key="rail-2" start={start} end={end} height={0.7} />)

  return (
    <group>
      {posts}
      {rails}
    </group>
  )
}

// Large garden plot with fence
function LargeGardenPlot({ position, size }) {
  const width = size[0]
  const length = size[2]

  // Calculate corner positions
  const corners = [
    [position[0] - width / 2, position[1], position[2] - length / 2], // front-left
    [position[0] + width / 2, position[1], position[2] - length / 2], // front-right
    [position[0] + width / 2, position[1], position[2] + length / 2], // back-right
    [position[0] - width / 2, position[1], position[2] + length / 2], // back-left
  ]

  return (
    <group>
      {/* Dirt ground */}
      <mesh position={position} receiveShadow>
        <boxGeometry args={[width, 0.1, length]} />
        <meshStandardMaterial color="#5D4037" roughness={1} />
      </mesh>

      {/* Fence sections */}
      <FenceSection start={corners[0]} end={corners[1]} />
      <FenceSection start={corners[1]} end={corners[2]} />
      <FenceSection start={corners[2]} end={corners[3]} />
      <FenceSection start={corners[3]} end={corners[0]} />
    </group>
  )
}

// Low poly ground with grass texture
function Ground({ onClick }) {
  return (
    <group>
      {/* Main ground plane - grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow onClick={onClick}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#4a7c59" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Add some random low-poly terrain variation */}
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

// Placement highlight indicator
function PlacementHighlight({ position, color, isValid }) {
  return (
    <mesh position={[position.x, 0.05, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1, 32]} />
      <meshStandardMaterial
        color={isValid ? color : "#ff0000"}
        transparent={true}
        opacity={0.5}
        emissive={isValid ? color : "#ff0000"}
        emissiveIntensity={0.5}
      />
    </mesh>
  )
}

// Plant component with growth stages - updated to match loading screen aesthetics
function Plant({ position, type, color, owner, onClick, isSelected, growthStage, rotation = 0 }) {
  const mesh = useRef()
  const [hovered, setHovered] = useState(false)
  const { username } = useGardenStore()
  const plantData = getPlantData(type)

  // Calculate growth percentage
  const growthPercent = ((growthStage || 1) / 5) * 100

  // Simple animation for selected plants - avoid complex animations that might cause errors
  useFrame(() => {
    if (isSelected && mesh.current) {
      mesh.current.rotation.y += 0.01
    }
  })

  // Different plant types with growth stages - simplified for compatibility
  const renderPlant = () => {
    // Base pot for all plants
    const pot = (
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.1, 8]} />
        <meshStandardMaterial color="#795548" roughness={0.9} />
      </mesh>
    )

    // Plant-specific geometry - using only basic geometries
    let plantGeometry

    switch (type) {
      case "mushroom":
        plantGeometry = (
          <>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 0.1 + growthStage * 0.03, 8]} />
              <meshStandardMaterial color="#e0e0e0" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.2 + growthStage * 0.03, 0]} castShadow>
              <sphereGeometry args={[0.08 + growthStage * 0.02, 8, 8]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          </>
        )
        break

      case "crystal":
        plantGeometry = (
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[0.1 + growthStage * 0.02, 0.1 + growthStage * 0.03, 0.1 + growthStage * 0.02]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
          </mesh>
        )
        break

      case "flower":
        plantGeometry = (
          <>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.1 + growthStage * 0.04, 8]} />
              <meshStandardMaterial color="#4caf50" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.2 + growthStage * 0.04, 0]} castShadow>
              <sphereGeometry args={[0.08 + growthStage * 0.02, 8, 8]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
          </>
        )
        break

      case "tree":
        plantGeometry = (
          <>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 0.1 + growthStage * 0.05, 8]} />
              <meshStandardMaterial color="#795548" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.2 + growthStage * 0.05, 0]} castShadow>
              <coneGeometry args={[0.1 + growthStage * 0.02, 0.2 + growthStage * 0.05, 8]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
          </>
        )
        break

      case "cactus":
        plantGeometry = (
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry
              args={[0.05 + growthStage * 0.01, 0.05 + growthStage * 0.01, 0.1 + growthStage * 0.05, 8]}
            />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        )
        break

      case "venus":
        plantGeometry = (
          <>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.1 + growthStage * 0.03, 8]} />
              <meshStandardMaterial color="#558b2f" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.2 + growthStage * 0.03, 0]} castShadow>
              <sphereGeometry args={[0.08 + growthStage * 0.02, 8, 8]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          </>
        )
        break

      case "bonsai":
        plantGeometry = (
          <>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 0.08 + growthStage * 0.02, 8]} />
              <meshStandardMaterial color="#5d4037" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.2 + growthStage * 0.02, 0]} castShadow>
              <sphereGeometry args={[0.08 + growthStage * 0.02, 8, 8]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
          </>
        )
        break

      case "rare":
      case "legendary":
        plantGeometry = (
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[0.1 + growthStage * 0.02, 0.1 + growthStage * 0.03, 0.1 + growthStage * 0.02]} />
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
          </mesh>
        )
        break

      default: // basic
        plantGeometry = (
          <mesh position={[0, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.08 + growthStage * 0.02, 8, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        )
    }

    return (
      <group ref={mesh} rotation={[0, rotation, 0]}>
        {pot}
        {plantGeometry}
      </group>
    )
  }

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) onClick(position)
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {renderPlant()}

      {/* Growth progress indicator */}
      {(hovered || isSelected) && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-black/80 p-2 rounded-md min-w-[120px]">
            <div className="text-xs text-white mb-1 text-center">
              {owner || username}'s {plantData?.name || type}
            </div>
            <div className="text-xs text-white mb-1 text-center">Growth: {growthStage}/5</div>
            <Progress value={growthPercent} className="h-1.5 bg-gray-700" indicatorClassName="bg-green-500" />
            {plantData && (
              <div className="text-xs text-gray-300 mt-1 text-center">
                {Math.floor((plantData.growthTime * (5 - growthStage)) / 60)} min remaining
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

// Garden scene setup and camera controls
function SceneSetup() {
  const { camera } = useThree()

  useEffect(() => {
    // Position camera to see the scene
    camera.position.set(0, 1.7, 10)
    camera.lookAt(0, 1.7, 0)
  }, [camera])

  return null
}

// Garden plot definition - one large plot
const gardenPlot = { position: [0, 0, 0], size: [30, 0.1, 30] }

// Check if a point is inside the garden plot
function isInsidePlot(point) {
  const halfWidth = gardenPlot.size[0] / 2
  const halfLength = gardenPlot.size[2] / 2

  return (
    point.x >= gardenPlot.position[0] - halfWidth &&
    point.x <= gardenPlot.position[0] + halfWidth &&
    point.z >= gardenPlot.position[2] - halfLength &&
    point.z <= gardenPlot.position[2] + halfLength
  )
}

// Check if a position is too close to existing plants
function isTooCloseToPlants(position, plants, minDistance = 1.5) {
  return plants.some((plant) => {
    const dx = plant.position[0] - position.x
    const dz = plant.position[2] - position.z
    return Math.sqrt(dx * dx + dz * dz) < minDistance
  })
}

// Main garden scene content
function GardenSceneContent({ selectedPlantType, plantRotation }) {
  const { username, plants, addPlant, updatePlantGrowth } = useGardenStore()
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [placementPosition, setPlacementPosition] = useState({ x: 0, y: 0, z: 0 })
  const [isValidPlacement, setIsValidPlacement] = useState(false)
  const { toast } = useToast()

  // Raycaster for mouse position
  const raycaster = new Raycaster()
  const plane = new Plane(new Vector3(0, 1, 0), 0)

  // Update plant growth over time
  useEffect(() => {
    const growthInterval = setInterval(() => {
      updatePlantGrowth()
    }, 5000) // Check growth every 5 seconds

    return () => clearInterval(growthInterval)
  }, [updatePlantGrowth])

  // Track mouse position for placement highlight
  useFrame((state) => {
    if (selectedPlantType) {
      raycaster.setFromCamera(state.mouse, state.camera)
      const intersection = new Vector3()
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        setPlacementPosition(intersection)

        // Check if placement is valid
        const isInPlot = isInsidePlot(intersection)
        const notTooClose = !isTooCloseToPlants(intersection, plants)
        setIsValidPlacement(isInPlot && notTooClose)
      }
    }
  })

  // Handle plant placement
  const handleGroundClick = (event) => {
    if (!selectedPlantType) {
      // Don't show toast when no plant is selected
      return
    }

    event.stopPropagation()
    const { point } = event

    // Check if the click is inside the garden plot
    if (!isInsidePlot(point)) {
      toast({
        title: "Invalid location",
        description: "Plants can only be placed inside your garden plot",
        variant: "destructive",
      })
      return
    }

    // Check if too close to another plant
    const tooClose = isTooCloseToPlants(point, plants)

    if (tooClose) {
      toast({
        title: "Too close",
        description: "Plants need more space between them",
        variant: "destructive",
      })
      return
    }

    // Get color based on plant type
    let color = "#4caf50"
    const plantData = getPlantData(selectedPlantType)
    if (plantData) {
      color = plantData.color
    }

    addPlant(selectedPlantType, [point.x, 0.05, point.z], color, plantRotation)

    toast({
      title: "Plant added",
      description: `Added ${selectedPlantType} to your garden`,
    })
  }

  const handlePlantClick = (position) => {
    setSelectedPosition(position)
  }

  return (
    <>
      {/* Scene setup */}
      <SceneSetup />

      {/* Controls */}
      <OrbitControls minDistance={5} maxDistance={50} maxPolarAngle={Math.PI / 2 - 0.1} target={[0, 0, 0]} />

      {/* Enhanced lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <hemisphereLight args={["#87CEEB", "#4a7c59", 0.6]} />

      {/* Ground */}
      <Ground onClick={handleGroundClick} />

      {/* Garden plot */}
      <LargeGardenPlot position={gardenPlot.position} size={gardenPlot.size} />

      {/* Plants */}
      {plants.map((plant) => (
        <Plant
          key={plant.id}
          position={plant.position}
          type={plant.type}
          color={plant.color}
          owner={plant.owner || username}
          onClick={() => handlePlantClick(plant.position)}
          isSelected={
            selectedPosition && selectedPosition[0] === plant.position[0] && selectedPosition[2] === plant.position[2]
          }
          growthStage={plant.growthStage}
          rotation={plant.rotation || 0}
        />
      ))}

      {/* Placement highlight - only show when a plant is selected */}
      {selectedPlantType && (
        <PlacementHighlight
          position={placementPosition}
          color={getPlantData(selectedPlantType)?.color || "#4caf50"}
          isValid={isValidPlacement}
        />
      )}
    </>
  )
}

// Main component that wraps the Canvas
export default function GardenSceneEnhanced({ selectedPlantType, onSelectPlant }) {
  const router = useRouter()
  const [plantRotation, setPlantRotation] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [localSelectedPlantType, setLocalSelectedPlantType] = useState(selectedPlantType)

  // Get icons from our utility
  const { ShoppingBag, RotateCcw, Users, RotateCw } = Icons

  useEffect(() => {
    setIsMounted(true)
    setLocalSelectedPlantType(selectedPlantType)
    return () => setIsMounted(false)
  }, [selectedPlantType])

  const rotatePlant = (direction) => {
    setPlantRotation((prev) => {
      if (direction === "clockwise") {
        return (prev + Math.PI / 8) % (Math.PI * 2)
      } else {
        return (prev - Math.PI / 8 + Math.PI * 2) % (Math.PI * 2)
      }
    })
  }

  // Only render the Canvas when the component is mounted
  if (!isMounted) {
    return <div className="h-full w-full bg-black"></div>
  }

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        className="h-full w-full"
        camera={{ position: [0, 1.7, 10], fov: 60 }}
        gl={{
          antialias: false, // Disable antialiasing for better compatibility
          powerPreference: "default",
          alpha: false,
          stencil: false,
          depth: true,
        }}
        dpr={[1, 1.5]} // Limit pixel ratio for better performance
        onCreated={(state) => {
          // Disable features that might cause compatibility issues
          if (state.gl) {
            state.gl.logarithmicDepthBuffer = false

            // Ensure we're not using any problematic extensions
            if (state.gl.extensions) {
              // Safely access extensions
              try {
                const extensions = state.gl.extensions
                if (typeof extensions === "object" && extensions !== null) {
                  // No need to do anything with extensions
                }
              } catch (e) {
                console.error("Error accessing extensions:", e)
              }
            }

            // Add support for blob URLs
            const originalTexImage2D = state.gl.texImage2D
            if (originalTexImage2D) {
              state.gl.texImage2D = function (...args) {
                const [target, level, internalformat, format, type, source] = args

                // Check if the source is an HTMLImageElement with a blob URL
                if (source && source instanceof HTMLImageElement && isBlobUrl(source.src)) {
                  // Create a new image with crossOrigin set
                  const img = new Image()
                  img.crossOrigin = "anonymous"
                  img.onload = () => {
                    args[5] = img
                    originalTexImage2D.apply(this, args)
                  }
                  img.src = source.src
                  return
                }

                return originalTexImage2D.apply(this, args)
              }
            }
          }
        }}
      >
        <Suspense fallback={null}>
          <GardenSceneContent selectedPlantType={localSelectedPlantType} plantRotation={plantRotation} />
          {/* Use a simple environment preset instead of a complex one */}
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>

      {/* UI Controls */}
      <div className="absolute bottom-24 left-4 flex gap-2">
        {localSelectedPlantType && (
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

      {/* Minecraft-style inventory bar */}
      <PlantInventoryBar
        onSelectPlant={(type) => {
          setLocalSelectedPlantType(type)
          if (onSelectPlant) onSelectPlant(type)
        }}
        selectedPlant={localSelectedPlantType}
      />
    </div>
  )
}
