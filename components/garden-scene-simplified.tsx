"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useGardenStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { getPlantData } from "@/lib/plant-data"
import { ShoppingBag, Users, RotateCcw, RotateCw } from "lucide-react"
import { useRouter } from "next/navigation"
import PlantInventoryBar from "./plant-inventory-bar"
import { Progress } from "@/components/ui/progress"

// Plant component for 2D view
function Plant2D({ plant, isSelected, onClick }) {
  const { username } = useGardenStore()
  const plantData = getPlantData(plant.type)
  const growthPercent = ((plant.growthStage || 1) / 5) * 100

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-300 ${
        isSelected ? "z-10 scale-110 ring-2 ring-green-400" : ""
      }`}
      style={{
        left: `${((plant.position[0] + 15) / 30) * 100}%`,
        top: `${((plant.position[2] + 15) / 30) * 100}%`,
        transform: `translate(-50%, -50%) rotate(${plant.rotation || 0}rad)`,
      }}
      onClick={() => onClick(plant)}
    >
      <div className="h-12 w-12 rounded-full border-2 border-green-500/30" style={{ backgroundColor: plant.color }}>
        <div className="flex h-full w-full items-center justify-center text-white font-bold">
          {plant.type.charAt(0).toUpperCase()}
        </div>
      </div>

      {isSelected && (
        <div className="absolute left-1/2 top-full mt-2 w-40 -translate-x-1/2 rounded-md bg-black/80 p-2 border border-green-500/30">
          <div className="text-xs text-white mb-1 text-center">
            {plant.owner || username}'s {plantData?.name || plant.type}
          </div>
          <div className="text-xs text-white mb-1 text-center">Growth: {plant.growthStage}/5</div>
          <Progress value={growthPercent} className="h-1.5 bg-gray-700" indicatorClassName="bg-green-500" />
          {plantData && (
            <div className="text-xs text-gray-300 mt-1 text-center">
              {Math.floor((plantData.growthTime * (5 - plant.growthStage)) / 60)} min remaining
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Placement indicator for 2D view
function PlacementIndicator({ position, color, isValid }) {
  return (
    <div
      className={`absolute h-12 w-12 rounded-full border-2 transition-all ${
        isValid ? "border-green-400 bg-green-400/20" : "border-red-400 bg-red-400/20"
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    ></div>
  )
}

export default function GardenSceneSimplified({ selectedPlantType, onSelectPlant }) {
  const router = useRouter()
  const { username, plants, addPlant, updatePlantGrowth } = useGardenStore()
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [placementPosition, setPlacementPosition] = useState({ x: 50, y: 50 })
  const [isValidPlacement, setIsValidPlacement] = useState(true)
  const [plantRotation, setPlantRotation] = useState(0)
  const [localSelectedPlantType, setLocalSelectedPlantType] = useState(selectedPlantType)
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setLocalSelectedPlantType(selectedPlantType)
    return () => setIsMounted(false)
  }, [selectedPlantType])

  // Update plant growth over time
  useEffect(() => {
    if (!isMounted) return

    const growthInterval = setInterval(() => {
      try {
        updatePlantGrowth()
      } catch (error) {
        console.error("Error updating plant growth:", error)
      }
    }, 5000)

    return () => clearInterval(growthInterval)
  }, [updatePlantGrowth, isMounted])

  const handleGardenClick = (e) => {
    try {
      if (!localSelectedPlantType) return

      // Get click position relative to the garden container
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      // Convert to garden coordinates (from percentage to -15 to 15 range)
      const gardenX = (x / 100) * 30 - 15
      const gardenZ = (y / 100) * 30 - 15

      // Check if too close to another plant
      const tooClose = plants.some((plant) => {
        const dx = plant.position[0] - gardenX
        const dz = plant.position[2] - gardenZ
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

      // Get color based on plant type
      let color = "#4caf50"
      const plantData = getPlantData(localSelectedPlantType)
      if (plantData) {
        color = plantData.color
      }

      addPlant(localSelectedPlantType, [gardenX, 0.05, gardenZ], color, plantRotation)

      toast({
        title: "Plant added",
        description: `Added ${localSelectedPlantType} to your garden`,
      })
    } catch (error) {
      console.error("Error adding plant:", error)
      toast({
        title: "Error",
        description: "Failed to add plant. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMouseMove = (e) => {
    try {
      if (!localSelectedPlantType) return

      // Get mouse position relative to the garden container
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      setPlacementPosition({ x, y })

      // Convert to garden coordinates (from percentage to -15 to 15 range)
      const gardenX = (x / 100) * 30 - 15
      const gardenZ = (y / 100) * 30 - 15

      // Check if too close to another plant
      const tooClose = plants.some((plant) => {
        const dx = plant.position[0] - gardenX
        const dz = plant.position[2] - gardenZ
        return Math.sqrt(dx * dx + dz * dz) < 1.5
      })

      setIsValidPlacement(!tooClose)
    } catch (error) {
      console.error("Error tracking mouse:", error)
    }
  }

  const rotatePlant = (direction) => {
    try {
      setPlantRotation((prev) => {
        if (direction === "clockwise") {
          return (prev + Math.PI / 8) % (Math.PI * 2)
        } else {
          return (prev - Math.PI / 8 + Math.PI * 2) % (Math.PI * 2)
        }
      })
    } catch (error) {
      console.error("Error rotating plant:", error)
    }
  }

  // Don't render anything during SSR
  if (!isMounted) {
    return <div className="h-full w-full bg-black"></div>
  }

  return (
    <div className="relative h-full w-full">
      {/* Garden background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-green-900/30 to-black"
        onClick={() => setSelectedPlant(null)}
      >
        {/* Garden plot */}
        <div
          className="absolute left-1/2 top-1/2 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-lg border-4 border-amber-800/50 bg-amber-900/30"
          onClick={handleGardenClick}
          onMouseMove={handleMouseMove}
        >
          {/* Plants */}
          {plants.map((plant) => (
            <Plant2D key={plant.id} plant={plant} isSelected={selectedPlant === plant} onClick={setSelectedPlant} />
          ))}

          {/* Placement indicator */}
          {localSelectedPlantType && (
            <PlacementIndicator
              position={placementPosition}
              color={getPlantData(localSelectedPlantType)?.color || "#4caf50"}
              isValid={isValidPlacement}
            />
          )}
        </div>
      </div>

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
