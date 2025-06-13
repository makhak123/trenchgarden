"use client"

import { useRef, useState, Suspense, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Text, Html, Sky, Cloud, PointerLockControls } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { useGardenStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { ShoppingBag, RotateCcw, Users, RotateCw, Gamepad2 } from "lucide-react"
import { useRouter } from "next/navigation"
import PlantInventoryBar from "./plant-inventory-bar"
import { getPlantData } from "@/lib/plant-data"
import { Progress } from "@/components/ui/progress"
import { Vector3, Raycaster, Plane } from "three"
import { ErrorBoundary } from "react-error-boundary"

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

      {/* Garden name */}
      <Text
        position={[position[0], 0.05, position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        TRENCH GARDEN
      </Text>
    </group>
  )
}

// Low poly ground with grass texture - optimized for performance
function Ground({ onClick }) {
  return (
    <group>
      {/* Main ground plane - grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow onClick={onClick}>
        <planeGeometry args={[200, 200, 20, 20]} />
        <meshStandardMaterial color="#4a7c59" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Add some random low-poly terrain variation - reduced count for performance */}
      {Array.from({ length: 50 }).map((_, i) => {
        // Keep grass variations away from the garden plot
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

      {/* Add some grass tufts - reduced count for performance */}
      {Array.from({ length: 100 }).map((_, i) => {
        // Keep grass tufts away from the garden plot
        const x = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 80 + 20)
        const z = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 80 + 20)
        const height = Math.random() * 0.3 + 0.1
        return (
          <mesh key={`grass-${i}`} position={[x, height / 2, z]} castShadow>
            <boxGeometry args={[0.1, height, 0.1]} />
            <meshStandardMaterial color={Math.random() > 0.3 ? "#7cad89" : "#5d9c6f"} roughness={0.8} />
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

// Plant component with growth stages
function Plant({ position, type, color, owner, onClick, isSelected, growthStage, rotation = 0 }) {
  const mesh = useRef()
  const [hovered, setHovered] = useState(false)
  const plantData = getPlantData(type)
  const { username } = useGardenStore()

  // Calculate growth percentage
  const growthPercent = ((growthStage || 1) / 5) * 100

  useFrame((state) => {
    if (isSelected && mesh.current) {
      mesh.current.rotation.y += 0.01
    }
  })

  // Scale based on growth stage (1-5) - Make it more dramatic
  const scale = 0.2 + (growthStage || 1) * 0.25

  // Different plant types with growth stages
  const renderPlant = () => {
    switch (type) {
      case "mushroom":
        return (
          <group ref={mesh} rotation={[0, rotation, 0]}>
            {/* Stem - grows taller with stage */}
            <mesh position={[0, 0.1 + growthStage * 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.15, 0.2 + growthStage * 0.08, 8]} />
              <meshStandardMaterial color="#e0e0e0" roughness={0.8} />
            </mesh>

            {/* Cap - grows wider with stage */}
            <mesh position={[0, 0.3 + growthStage * 0.08, 0]} castShadow>
              <sphereGeometry args={[0.1 + growthStage * 0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>

            {/* Spots - more appear with growth */}
            {[...Array(Math.min(growthStage * 2, 10))].map((_, i) => {
              const theta = Math.random() * Math.PI * 2
              const phi = (Math.random() * Math.PI) / 4
              const x = (0.1 + growthStage * 0.08) * Math.sin(phi) * Math.cos(theta)
              const z = (0.1 + growthStage * 0.08) * Math.sin(phi) * Math.sin(theta)
              const y = 0.3 + growthStage * 0.08 + (0.1 + growthStage * 0.08) * Math.cos(phi)
              return (
                <mesh key={i} position={[x, y, z]} castShadow>
                  <sphereGeometry args={[0.02, 8, 8]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
              )
            })}
          </group>
        )
      case "crystal":
        return (
          <group ref={mesh} rotation={[0, rotation, 0]}>
            <mesh position={[0, 0.1 + growthStage * 0.08, 0]} castShadow>
              <octahedronGeometry args={[0.1 + growthStage * 0.08, 0]} />
              <meshStandardMaterial
                color={color}
                metalness={0.5}
                roughness={0.2}
                emissive={color}
                emissiveIntensity={0.2 + growthStage * 0.15}
              />
            </mesh>

            {/* Additional crystals appear with growth */}
            {growthStage >= 2 && (
              <mesh position={[0.1, 0.1 + growthStage * 0.05, 0.05]} rotation={[0.5, 0.5, 0]} castShadow>
                <octahedronGeometry args={[0.07 + growthStage * 0.03, 0]} />
                <meshStandardMaterial
                  color={color}
                  metalness={0.5}
                  roughness={0.2}
                  emissive={color}
                  emissiveIntensity={0.2 + growthStage * 0.15}
                />
              </mesh>
            )}

            {growthStage >= 3 && (
              <mesh position={[-0.1, 0.15 + growthStage * 0.05, -0.05]} rotation={[-0.2, 0.3, 0]} castShadow>
                <octahedronGeometry args={[0.05 + growthStage * 0.02, 0]} />
                <meshStandardMaterial
                  color={color}
                  metalness={0.5}
                  roughness={0.2}
                  emissive={color}
                  emissiveIntensity={0.2 + growthStage * 0.15}
                />
              </mesh>
            )}

            {growthStage >= 4 && (
              <mesh position={[0.05, 0.2 + growthStage * 0.06, -0.1]} rotation={[0.3, -0.2, 0.1]} castShadow>
                <octahedronGeometry args={[0.04 + growthStage * 0.02, 0]} />
                <meshStandardMaterial
                  color={color}
                  metalness={0.5}
                  roughness={0.2}
                  emissive={color}
                  emissiveIntensity={0.2 + growthStage * 0.15}
                />
              </mesh>
            )}

            {growthStage >= 5 && (
              <mesh position={[-0.07, 0.25 + growthStage * 0.06, 0.12]} rotation={[-0.1, 0.4, 0.2]} castShadow>
                <octahedronGeometry args={[0.03 + growthStage * 0.02, 0]} />
                <meshStandardMaterial
                  color={color}
                  metalness={0.5}
                  roughness={0.2}
                  emissive={color}
                  emissiveIntensity={0.2 + growthStage * 0.15}
                />
              </mesh>
            )}
          </group>
        )
      case "flower":
        return (
          <group ref={mesh} rotation={[0, rotation, 0]}>
            {/* Stem - grows taller with stage */}
            <mesh position={[0, 0.15 + growthStage * 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.03, 0.3 + growthStage * 0.15, 8]} />
              <meshStandardMaterial color="#4caf50" roughness={0.8} />
            </mesh>

            {/* Flower petals - more appear with growth */}
            {growthStage >= 2 &&
              [...Array(Math.min(6, growthStage + 2))].map((_, i) => {
                const angle = (i / Math.min(6, growthStage + 2)) * Math.PI * 2
                const petalSize = 0.05 + growthStage * 0.03
                return (
                  <mesh
                    key={i}
                    position={[
                      Math.cos(angle) * petalSize * 1.8,
                      0.3 + growthStage * 0.15,
                      Math.sin(angle) * petalSize * 1.8,
                    ]}
                    castShadow
                  >
                    <sphereGeometry args={[petalSize, 8, 8]} />
                    <meshStandardMaterial color={color} roughness={0.6} />
                  </mesh>
                )
              })}

            {/* Center - grows with stage */}
            {growthStage >= 3 && (
              <mesh position={[0, 0.3 + growthStage * 0.15, 0]} castShadow>
                <sphereGeometry args={[0.04 + growthStage * 0.02, 8, 8]} />
                <meshStandardMaterial color="#ffeb3b" roughness={0.5} emissive="#ffeb3b" emissiveIntensity={0.2} />
              </mesh>
            )}

            {/* Leaves - appear in later stages */}
            {growthStage >= 4 && (
              <mesh position={[0.05, 0.15, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
                <boxGeometry args={[0.15, 0.02, 0.08]} />
                <meshStandardMaterial color="#4caf50" roughness={0.8} />
              </mesh>
            )}

            {growthStage >= 5 && (
              <mesh position={[-0.05, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
                <boxGeometry args={[0.15, 0.02, 0.08]} />
                <meshStandardMaterial color="#4caf50" roughness={0.8} />
              </mesh>
            )}
          </group>
        )
      case "tree":
        return (
          <group ref={mesh} rotation={[0, rotation, 0]}>
            {/* Trunk - grows taller with stage */}
            <mesh position={[0, 0.2 + growthStage * 0.15, 0]} castShadow>
              <cylinderGeometry
                args={[0.05 + growthStage * 0.02, 0.07 + growthStage * 0.03, 0.4 + growthStage * 0.2, 8]}
              />
              <meshStandardMaterial color="#795548" roughness={0.9} />
            </mesh>

            {/* Foliage - more layers appear with growth */}
            {growthStage >= 2 && (
              <mesh position={[0, 0.4 + growthStage * 0.2, 0]} castShadow>
                <coneGeometry args={[0.2 + growthStage * 0.08, 0.4 + growthStage * 0.15, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}

            {growthStage >= 3 && (
              <mesh position={[0, 0.6 + growthStage * 0.2, 0]} castShadow>
                <coneGeometry args={[0.15 + growthStage * 0.06, 0.3 + growthStage * 0.12, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}

            {growthStage >= 4 && (
              <mesh position={[0, 0.8 + growthStage * 0.2, 0]} castShadow>
                <coneGeometry args={[0.1 + growthStage * 0.04, 0.2 + growthStage * 0.1, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}

            {growthStage >= 5 && (
              <mesh position={[0, 1.0 + growthStage * 0.2, 0]} castShadow>
                <coneGeometry args={[0.05 + growthStage * 0.03, 0.1 + growthStage * 0.08, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}
          </group>
        )
      case "rare":
        return (
          <group ref={mesh} rotation={[0, rotation, 0]}>
            {/* Base */}
            <mesh position={[0, 0.05 + growthStage * 0.03, 0]} castShadow>
              <cylinderGeometry
                args={[0.1 + growthStage * 0.03, 0.15 + growthStage * 0.04, 0.1 + growthStage * 0.03, 8]}
              />
              <meshStandardMaterial color="#212121" roughness={0.5} />
            </mesh>

            {/* Center stem */}
            <mesh position={[0, 0.15 + growthStage * 0.08, 0]} castShadow>
              <cylinderGeometry
                args={[0.02 + growthStage * 0.008, 0.02 + growthStage * 0.008, 0.3 + growthStage * 0.15, 8]}
              />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.2 + growthStage * 0.15}
                roughness={0.3}
              />
            </mesh>

            {/* Floating orbs - more appear with growth */}
            {[...Array(Math.min(growthStage * 2, 10))].map((_, i) => {
              const angle = (i / Math.min(growthStage * 2, 10)) * Math.PI * 2
              const y = 0.2 + growthStage * 0.12 + Math.sin(i) * 0.08
              const radius = 0.1 + growthStage * 0.03
              return (
                <mesh key={i} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]} castShadow>
                  <sphereGeometry args={[0.03 + growthStage * 0.015, 8, 8]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.3 + growthStage * 0.2}
                    roughness={0.3}
                  />
                </mesh>
              )
            })}
          </group>
        )
      case "legendary":
        return (
          <group ref={mesh} rotation={[0, rotation, 0]}>
            {/* Base */}
            <mesh position={[0, 0.05, 0]} castShadow>
              <torusGeometry args={[0.1 + growthStage * 0.03, 0.03, 16, 16]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Center crystal */}
            <mesh position={[0, 0.2 + growthStage * 0.08, 0]} castShadow>
              <dodecahedronGeometry args={[0.1 + growthStage * 0.04, 0]} />
              <meshStandardMaterial
                color={color}
                metalness={0.7}
                roughness={0.2}
                emissive={color}
                emissiveIntensity={0.3 + growthStage * 0.15}
              />
            </mesh>

            {/* Orbiting mini crystals */}
            {growthStage >= 2 &&
              [...Array(Math.min(growthStage * 2, 10))].map((_, i) => {
                const angle = ((Date.now() * 0.001 + (i * Math.PI * 2) / 3) % (Math.PI * 2)) + i * (Math.PI / 3)
                const radius = 0.15 + growthStage * 0.06
                return (
                  <mesh
                    key={i}
                    position={[
                      Math.cos(angle) * radius,
                      0.2 + growthStage * 0.08 + Math.sin(i * 0.5) * 0.15,
                      Math.sin(angle) * radius,
                    ]}
                    castShadow
                  >
                    <tetrahedronGeometry args={[0.04 + growthStage * 0.015, 0]} />
                    <meshStandardMaterial
                      color={color}
                      metalness={0.7}
                      roughness={0.2}
                      emissive={color}
                      emissiveIntensity={0.3 + growthStage * 0.15}
                    />
                  </mesh>
                )
              })}
          </group>
        )
      case "cactus":
        return (
          <group ref={mesh} rotation={[0, rotation, 0]}>
            {/* Pot */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.15, 0.15, 8]} />
              <meshStandardMaterial color="#a57c65" roughness={0.9} />
            </mesh>

            {/* Main stem */}
            <mesh position={[0, 0.15 + growthStage * 0.1, 0]} castShadow>
              <cylinderGeometry
                args={[0.05 + growthStage * 0.01, 0.05 + growthStage * 0.01, 0.3 + growthStage * 0.1, 8]}
              />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>

            {/* Spikes - more appear with growth */}
            {[...Array(Math.min(growthStage * 3, 15))].map((_, i) => {
              const angle = (i / Math.min(growthStage * 3, 15)) * Math.PI * 2
              const height = (i % 3) * 0.1 + 0.15 + growthStage * 0.05
              return (
                <mesh
                  key={i}
                  position={[
                    Math.cos(angle) * (0.06 + growthStage * 0.01),
                    height,
                    Math.sin(angle) * (0.06 + growthStage * 0.01),
                  ]}
                  rotation={[0, 0, Math.PI / 2 - angle]}
                  castShadow
                >
                  <cylinderGeometry args={[0.001, 0.001, 0.05 + growthStage * 0.01, 4]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.5} />
                </mesh>
              )
            })}

            {/* Arms - appear in later stages */}
            {growthStage >= 3 && (
              <mesh position={[0.08, 0.25 + growthStage * 0.05, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
                <cylinderGeometry
                  args={[0.03 + growthStage * 0.005, 0.03 + growthStage * 0.005, 0.15 + growthStage * 0.05, 8]}
                />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}

            {growthStage >= 4 && (
              <mesh position={[-0.07, 0.35 + growthStage * 0.05, 0]} rotation={[0, 0, -Math.PI / 5]} castShadow>
                <cylinderGeometry
                  args={[0.025 + growthStage * 0.005, 0.025 + growthStage * 0.005, 0.12 + growthStage * 0.04, 8]}
                />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}

            {/* Flower on top - appears in final stage */}
            {growthStage >= 5 && (
              <mesh position={[0, 0.5 + growthStage * 0.1, 0]} castShadow>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color="#ff9800" emissive="#ff9800" emissiveIntensity={0.2} roughness={0.6} />
              </mesh>
            )}
          </group>
        )
      case "venus":
        return (
          <group ref={mesh} rotation={[0, rotation, 0]}>
            {/* Base/Pot */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.15, 0.15, 8]} />
              <meshStandardMaterial color="#5d4037" roughness={0.9} />
            </mesh>

            {/* Stem */}
            <mesh position={[0, 0.15 + growthStage * 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 0.2 + growthStage * 0.1, 8]} />
              <meshStandardMaterial color="#558b2f" roughness={0.8} />
            </mesh>

            {/* Trap - grows with stage */}
            {growthStage >= 2 && (
              <group position={[0, 0.3 + growthStage * 0.1, 0]}>
                {/* Lower jaw */}
                <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 8, 0, 0]} castShadow>
                  <sphereGeometry args={[0.1 + growthStage * 0.03, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial color={color} roughness={0.7} side={2} />
                </mesh>

                {/* Upper jaw */}
                <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 8, 0, 0]} castShadow>
                  <sphereGeometry args={[0.1 + growthStage * 0.03, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial color={color} roughness={0.7} side={2} />
                </mesh>

                {/* Teeth - more appear with growth */}
                {growthStage >= 3 &&
                  [...Array(Math.min(growthStage * 2, 10))].map((_, i) => {
                    const angle = (i / Math.min(growthStage * 2, 10)) * Math.PI
                    const radius = 0.09 + growthStage * 0.02
                    return (
                      <mesh
                        key={i}
                        position={[Math.cos(angle) * radius, -0.02, Math.sin(angle) * radius]}
                        rotation={[Math.PI / 2 - Math.PI / 8, 0, 0]}
                        castShadow
                      >
                        <coneGeometry args={[0.01 + growthStage * 0.002, 0.03 + growthStage * 0.005, 4]} />
                        <meshStandardMaterial color="#ffffff" roughness={0.5} />
                      </mesh>
                    )
                  })}

                {growthStage >= 4 &&
                  [...Array(Math.min(growthStage * 2, 10))].map((_, i) => {
                    const angle = (i / Math.min(growthStage * 2, 10)) * Math.PI
                    const radius = 0.09 + growthStage * 0.02
                    return (
                      <mesh
                        key={i}
                        position={[Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius]}
                        rotation={[-Math.PI / 2 + Math.PI / 8, 0, 0]}
                        castShadow
                      >
                        <coneGeometry args={[0.01 + growthStage * 0.002, 0.03 + growthStage * 0.005, 4]} />
                        <meshStandardMaterial color="#ffffff" roughness={0.5} />
                      </mesh>
                    )
                  })}
              </group>
            )}
          </group>
        )
      case "bonsai":
        return (
          <group ref={mesh} rotation={[0, rotation, 0]}>
            {/* Pot */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.2, 0.15, 8]} />
              <meshStandardMaterial color="#795548" roughness={0.9} />
            </mesh>

            {/* Trunk - grows thicker and more twisted with stage */}
            <mesh position={[0, 0.15 + growthStage * 0.05, 0]} rotation={[0, 0, growthStage * 0.1]} castShadow>
              <cylinderGeometry
                args={[0.04 + growthStage * 0.01, 0.05 + growthStage * 0.02, 0.2 + growthStage * 0.1, 8]}
              />
              <meshStandardMaterial color="#5d4037" roughness={0.9} />
            </mesh>

            {/* Branches - more appear with growth */}
            {growthStage >= 2 && (
              <mesh position={[0.08, 0.25 + growthStage * 0.05, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
                <cylinderGeometry args={[0.02, 0.03, 0.15, 8]} />
                <meshStandardMaterial color="#5d4037" roughness={0.9} />
              </mesh>
            )}

            {growthStage >= 3 && (
              <mesh position={[-0.08, 0.3 + growthStage * 0.05, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
                <cylinderGeometry args={[0.02, 0.025, 0.12, 8]} />
                <meshStandardMaterial color="#5d4037" roughness={0.9} />
              </mesh>
            )}

            {/* Foliage - more appears with growth */}
            {growthStage >= 2 && (
              <mesh position={[0.15, 0.3 + growthStage * 0.05, 0]} castShadow>
                <sphereGeometry args={[0.08 + growthStage * 0.02, 8, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}

            {growthStage >= 3 && (
              <mesh position={[-0.15, 0.35 + growthStage * 0.05, 0]} castShadow>
                <sphereGeometry args={[0.07 + growthStage * 0.02, 8, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}

            {growthStage >= 4 && (
              <mesh position={[0, 0.4 + growthStage * 0.05, 0]} castShadow>
                <sphereGeometry args={[0.1 + growthStage * 0.02, 8, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}

            {/* Flowers - appear in final stage */}
            {growthStage >= 5 &&
              [...Array(5)].map((_, i) => {
                const angle = (i / 5) * Math.PI * 2
                return (
                  <mesh
                    key={i}
                    position={[Math.cos(angle) * 0.15, 0.4 + growthStage * 0.05, Math.sin(angle) * 0.15]}
                    castShadow
                  >
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshStandardMaterial color="#ff80ab" emissive="#ff80ab" emissiveIntensity={0.2} roughness={0.6} />
                  </mesh>
                )
              })}
          </group>
        )
      default: // basic
        return (
          <group ref={mesh} rotation={[0, rotation, 0]}>
            {/* Pot */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry
                args={[0.1 + growthStage * 0.02, 0.12 + growthStage * 0.03, 0.15 + growthStage * 0.04, 8]}
              />
              <meshStandardMaterial color="#795548" roughness={0.9} />
            </mesh>

            {/* Stem - grows taller with stage */}
            <mesh position={[0, 0.1 + growthStage * 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.2 + growthStage * 0.08, 8]} />
              <meshStandardMaterial color="#4caf50" roughness={0.8} />
            </mesh>

            {/* Leaves - more appear with growth */}
            {growthStage >= 2 && (
              <mesh position={[0, 0.2 + growthStage * 0.08, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
                <boxGeometry args={[0.1 + growthStage * 0.03, 0.02, 0.1 + growthStage * 0.03]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}

            {growthStage >= 3 && (
              <mesh position={[0, 0.25 + growthStage * 0.08, 0]} rotation={[0, Math.PI / 4, Math.PI / 4]} castShadow>
                <boxGeometry args={[0.1 + growthStage * 0.03, 0.02, 0.1 + growthStage * 0.03]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}

            {growthStage >= 4 && (
              <mesh position={[0, 0.3 + growthStage * 0.08, 0]} rotation={[0, -Math.PI / 4, Math.PI / 4]} castShadow>
                <boxGeometry args={[0.1 + growthStage * 0.03, 0.02, 0.1 + growthStage * 0.03]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}

            {growthStage >= 5 && (
              <mesh position={[0, 0.35 + growthStage * 0.08, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
                <boxGeometry args={[0.1 + growthStage * 0.03, 0.02, 0.1 + growthStage * 0.03]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            )}
          </group>
        )
    }
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

      {/* Username and growth progress label */}
      <Html position={[0, 1.5, 0]} center>
        <div
          className={`flex flex-col items-center transition-opacity ${hovered || isSelected ? "opacity-100" : "opacity-0"}`}
        >
          <div
            className="px-3 py-2 rounded text-sm whitespace-nowrap mb-2 font-bold"
            style={{ backgroundColor: "rgba(0,0,0,0.8)", color: "white" }}
          >
            {owner || username}
          </div>
          <div className="w-32 bg-black/80 p-2 rounded">
            <div className="text-sm text-center text-white mb-1 font-bold">Growth: {growthStage}/5</div>
            <Progress value={growthPercent} className="h-2 bg-gray-700" indicatorClassName="bg-green-500" />
          </div>
        </div>
      </Html>
    </group>
  )
}

// First-person WASD controls
function WASDControls() {
  const { camera } = useThree()
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false,
  })

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "KeyW") setKeys((keys) => ({ ...keys, forward: true }))
      if (e.code === "KeyS") setKeys((keys) => ({ ...keys, backward: true }))
      if (e.code === "KeyA") setKeys((keys) => ({ ...keys, left: true }))
      if (e.code === "KeyD") setKeys((keys) => ({ ...keys, right: true }))
      if (e.code === "ShiftLeft") setKeys((keys) => ({ ...keys, shift: true }))
    }

    const handleKeyUp = (e) => {
      if (e.code === "KeyW") setKeys((keys) => ({ ...keys, forward: false }))
      if (e.code === "KeyS") setKeys((keys) => ({ ...keys, backward: false }))
      if (e.code === "KeyA") setKeys((keys) => ({ ...keys, left: false }))
      if (e.code === "KeyD") setKeys((keys) => ({ ...keys, right: false }))
      if (e.code === "ShiftLeft") setKeys((keys) => ({ ...keys, shift: false }))
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    // Calculate movement speed
    const speed = keys.shift ? 10 : 5

    // Get camera direction vectors
    const direction = new Vector3()
    const frontVector = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const sideVector = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion)

    // Calculate movement direction
    direction
      .set(0, 0, 0)
      .add(keys.forward ? frontVector.clone().multiplyScalar(-1) : new Vector3(0, 0, 0))
      .add(keys.backward ? frontVector.clone() : new Vector3(0, 0, 0))
      .add(keys.left ? sideVector.clone().multiplyScalar(-1) : new Vector3(0, 0, 0))
      .add(keys.right ? sideVector.clone() : new Vector3(0, 0, 0))
      .normalize()
      .multiplyScalar(speed * delta)

    // Only move in X and Z directions (no flying)
    direction.y = 0

    // Apply movement to camera
    camera.position.add(direction)

    // Keep camera at a fixed height
    camera.position.y = 1.7
  })

  return null
}

// Scene setup and camera controls
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
    point.z <= gardenPlot.position[2] + halfLength &&
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
function GardenSceneContent({ selectedPlantType, plantRotation, controlsMode }) {
  const { username, plants, addPlant, updatePlantGrowth } = useGardenStore()
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [placementPosition, setPlacementPosition] = useState({ x: 0, y: 0, z: 0 })
  const [isValidPlacement, setIsValidPlacement] = useState(false)
  const { toast } = useToast()
  const controlsRef = useRef()

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
    if (selectedPlantType && controlsMode === "orbit") {
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
    } else {
      switch (selectedPlantType) {
        case "mushroom":
          color = "#f44336"
          break
        case "crystal":
          color = "#2196f3"
          break
        case "flower":
          color = "#ffc107"
          break
        case "tree":
          color = "#4caf50"
          break
        case "rare":
          color = "#9c27b0"
          break
        case "legendary":
          color = "#e91e63"
          break
        case "cactus":
          color = "#66bb6a"
          break
        case "venus":
          color = "#8bc34a"
          break
        case "bonsai":
          color = "#81c784"
          break
      }
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

      {/* Controls based on mode */}
      {controlsMode === "orbit" ? (
        <OrbitControls
          ref={controlsRef}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2 - 0.1}
          target={[0, 0, 0]}
        />
      ) : (
        <PointerLockControls />
      )}

      {/* WASD movement controls */}
      {controlsMode === "wasd" && <WASDControls />}

      {/* Sky and clouds */}
      <Sky sunPosition={[100, 10, 100]} turbidity={0.1} />
      <Cloud position={[-20, 40, -20]} args={[3, 2]} />
      <Cloud position={[20, 30, 10]} args={[3, 2]} />
      <Cloud position={[-10, 35, 30]} args={[3, 2]} />

      {/* Enhanced lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <hemisphereLight args={["#87CEEB", "#4a7c59", 0.6]} />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" />

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
      {selectedPlantType && controlsMode === "orbit" && (
        <PlacementHighlight
          position={placementPosition}
          color={getPlantData(selectedPlantType)?.color || "#4caf50"}
          isValid={isValidPlacement}
        />
      )}

      {/* Username display */}
      <Text
        position={[0, 3, -20]}
        fontSize={2}
        color="#4caf50"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {username}'s Garden
      </Text>
    </>
  )
}

// Main component that wraps the Canvas
export default function GardenScene({ selectedPlantType, onError }) {
  const router = useRouter()
  const [plantRotation, setPlantRotation] = useState(0)
  const [controlsMode, setControlsMode] = useState("orbit") // "orbit" or "wasd"
  const [canvasLoaded, setCanvasLoaded] = useState(false)
  const [localSelectedPlantType, setLocalSelectedPlantType] = useState(selectedPlantType)

  // Add a state to track if the component is mounted
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

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

  const toggleControlsMode = () => {
    setControlsMode((prev) => (prev === "orbit" ? "wasd" : "orbit"))
  }

  // Only render the Canvas when the component is mounted
  if (!isMounted) {
    return <div className="h-full w-full bg-black"></div>
  }

  return (
    <div className="relative h-full w-full">
      <Suspense
        fallback={
          <div className="h-full w-full bg-black flex items-center justify-center text-green-400">
            Loading 3D Garden...
          </div>
        }
      >
        <ErrorBoundary
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-black">
              <div className="text-center p-8 bg-black/70 rounded-lg border border-green-500/20">
                <h3 className="text-xl font-bold text-green-400 mb-2">3D Garden Unavailable</h3>
                <p className="text-green-200">
                  Unable to load the 3D garden view. Please check your browser compatibility.
                </p>
              </div>
            </div>
          }
          onError={() => {
            setHasError(true)
            if (onError) onError()
          }}
        >
          <Canvas
            shadows
            className="h-full w-full"
            camera={{ position: [0, 1.7, 10], fov: 60 }}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            performance={{ min: 0.5 }}
            onCreated={() => setCanvasLoaded(true)}
          >
            <Suspense fallback={null}>
              <GardenSceneContent
                selectedPlantType={localSelectedPlantType}
                plantRotation={plantRotation}
                controlsMode={controlsMode}
              />
              {/* Add a simple environment for better lighting */}
              <Environment preset="sunset" />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </Suspense>

      {/* UI Controls */}
      <div className="absolute bottom-24 left-4 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="border-green-600 bg-black/70 text-green-400 hover:bg-green-900/30"
          onClick={toggleControlsMode}
        >
          <Gamepad2 className="h-4 w-4" />
        </Button>

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

      <div className="absolute bottom-24 right-4 text-sm text-white bg-black/70 p-2 rounded">
        {controlsMode === "wasd" ? (
          <span>WASD to move, Mouse to look</span>
        ) : (
          <span>Click inside your plot to place selected plant</span>
        )}
      </div>

      {/* Minecraft-style inventory bar */}
      <PlantInventoryBar onSelectPlant={setLocalSelectedPlantType} selectedPlant={localSelectedPlantType} />
    </div>
  )
}
