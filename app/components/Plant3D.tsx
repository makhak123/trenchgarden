"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import type * as THREE from "three"

interface Plant3DProps {
  position: [number, number, number]
  plantType: string
  growthStage: number
  color?: string
  onClick?: () => void
  showInfo?: boolean
}

export default function Plant3D({
  position,
  plantType,
  growthStage = 1,
  color = "#3a5f0b",
  onClick,
  showInfo = true,
}: Plant3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Simple animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
    }
  })

  // Scale based on growth stage (1-5)
  const scale = 0.2 + growthStage * 0.15

  // Different plant types
  const renderPlantGeometry = () => {
    switch (plantType) {
      case "mushroom":
        return (
          <>
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
          </>
        )
      case "crystal":
        return (
          <>
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
          </>
        )
      case "flower":
        return (
          <>
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
          </>
        )
      case "tree":
        return (
          <>
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
          </>
        )
      case "rare":
        return (
          <>
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
          </>
        )
      case "legendary":
        return (
          <>
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
          </>
        )
      case "cactus":
        return (
          <>
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
          </>
        )
      case "venus":
        return (
          <>
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
          </>
        )
      case "bonsai":
        return (
          <>
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
          </>
        )
      default: // basic
        return (
          <>
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
          </>
        )
    }
  }

  return (
    <group
      position={position}
      scale={scale}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        {/* Base/Soil */}
        <mesh position={[0, 0, 0]} scale={[0.3, 0.1, 0.3]}>
          <cylinderGeometry />
          <meshStandardMaterial color="#3d2817" />
        </mesh>

        {/* Plant specific geometry */}
        {renderPlantGeometry()}
      </mesh>

      {/* Info label that appears on hover */}
      {showInfo && hovered && (
        <Html position={[0, 1, 0]} center>
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {plantType} (Stage {growthStage})
          </div>
        </Html>
      )}
    </group>
  )
}
