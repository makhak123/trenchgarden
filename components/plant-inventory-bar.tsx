"use client"

import { useState, useEffect, useCallback } from "react"
import { useGardenStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getPlantData } from "@/lib/plant-data"
import { CustomTooltip } from "@/components/ui/custom-tooltip"
import { Sparkles } from "lucide-react"

export function PlantInventoryBar({ onSelectPlant, selectedPlant }) {
  const { inventory } = useGardenStore()
  const [hoveredPlant, setHoveredPlant] = useState(null)

  // Default plants everyone has
  const defaultPlants = [
    {
      id: "basic-plant-default",
      name: "Basic Plant",
      type: "basic",
      description: "A simple plant to start your garden",
      color: "#4caf50",
      rarity: "common",
    },
    {
      id: "mushroom-default",
      name: "Mushroom",
      type: "mushroom",
      description: "A common mushroom that grows in dark places",
      color: "#f44336",
      rarity: "common",
    },
    {
      id: "cactus-default",
      name: "Cactus",
      type: "cactus",
      description: "A spiky desert plant that needs little water",
      color: "#66bb6a",
      rarity: "uncommon",
    },
    {
      id: "venus-default",
      name: "Venus Flytrap",
      type: "venus",
      description: "A carnivorous plant with a snapping trap",
      color: "#8bc34a",
      rarity: "rare",
    },
    {
      id: "bonsai-default",
      name: "Bonsai Tree",
      type: "bonsai",
      description: "A miniature tree grown with special care",
      color: "#81c784",
      rarity: "epic",
    },
  ]

  // Combine default plants with inventory
  const allPlants = [...defaultPlants, ...inventory]

  // Always ensure we have 9 slots (Minecraft style)
  const slots = Array(9)
    .fill(null)
    .map((_, i) => allPlants[i] || null)

  // Handle plant selection/deselection
  const handlePlantClick = (plantType) => {
    // If the plant is already selected, deselect it
    if (selectedPlant === plantType) {
      onSelectPlant(null)
    } else {
      onSelectPlant(plantType)
    }
  }

  // Memoize the handler to prevent unnecessary re-renders
  const handleKeyDown = useCallback(
    (e) => {
      const key = e.key
      if (key >= "1" && key <= "9") {
        const index = Number.parseInt(key) - 1
        if (index < slots.length) {
          const plant = slots[index]
          if (plant) {
            handlePlantClick(plant.type)
          }
        }
      }
    },
    [slots, selectedPlant, onSelectPlant],
  )

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "border-gray-500/50 bg-gray-800/30"
      case "uncommon":
        return "border-green-500/50 bg-green-900/30"
      case "rare":
        return "border-blue-500/50 bg-blue-900/30"
      case "epic":
        return "border-purple-500/50 bg-purple-900/30"
      case "legendary":
        return "border-amber-500/50 bg-amber-900/30"
      default:
        return "border-gray-500/50 bg-gray-800/30"
    }
  }

  const getRarityBadgeColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "bg-gray-600"
      case "uncommon":
        return "bg-green-600"
      case "rare":
        return "bg-blue-600"
      case "epic":
        return "bg-purple-600"
      case "legendary":
        return "bg-amber-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="mx-4 mb-4">
        <Card className="border-green-500/20 bg-black/80 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-400" />
                <h3 className="font-medium text-green-400">Plant Inventory</h3>
              </div>
              <p className="text-xs text-green-300/70">Press 1-9 to quick select</p>
            </div>

            <div className="flex items-center justify-center gap-2">
              {slots.map((plant, index) => {
                if (!plant) {
                  // Empty slot
                  return (
                    <div
                      key={`empty-${index}`}
                      className="relative flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-700/50 bg-gray-800/20"
                    >
                      <span className="text-gray-500 text-xs">Empty</span>
                      <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0 text-[10px] bg-gray-700 border-gray-600">
                        {index + 1}
                      </Badge>
                    </div>
                  )
                }

                const plantData = getPlantData(plant.type)
                const isSelected = selectedPlant === plant.type

                return (
                  <CustomTooltip
                    key={plant.id || `plant-${index}`}
                    content={
                      <div className="flex flex-col gap-2 p-2 max-w-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white">{plant.name}</span>
                          <Badge className={cn("text-xs border-0", getRarityBadgeColor(plant.rarity))}>
                            {plant.rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-300">{plant.description}</p>
                        {plantData && <p className="text-xs text-gray-400">Growth time: {plantData.growthTime}s</p>}
                        <div className="border-t border-gray-600 pt-2">
                          <p className="text-xs text-green-400 font-medium">
                            {isSelected ? "Click to deselect" : "Click to select"}
                          </p>
                          <p className="text-xs text-gray-500">Hotkey: {index + 1}</p>
                        </div>
                      </div>
                    }
                  >
                    <div
                      className={cn(
                        "group relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 transition-all duration-200 hover:scale-105",
                        isSelected
                          ? "border-green-400 bg-green-900/40 shadow-lg shadow-green-500/25"
                          : getRarityColor(plant.rarity),
                        "hover:border-green-400/70",
                      )}
                      onClick={() => handlePlantClick(plant.type)}
                      onMouseEnter={() => setHoveredPlant(plant.type)}
                      onMouseLeave={() => setHoveredPlant(null)}
                    >
                      {/* Plant icon */}
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg transition-all duration-200",
                          isSelected && "animate-pulse",
                        )}
                        style={{
                          backgroundColor: plant.color,
                          boxShadow: isSelected ? `0 0 20px ${plant.color}60` : `0 0 10px ${plant.color}40`,
                        }}
                      >
                        <div className="flex h-full w-full items-center justify-center text-white font-bold text-sm">
                          {plant.type.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Slot number */}
                      <Badge
                        className={cn(
                          "absolute -right-1 -top-1 h-5 w-5 p-0 text-[10px] border-0 transition-colors",
                          isSelected ? "bg-green-600" : getRarityBadgeColor(plant.rarity),
                        )}
                      >
                        {index + 1}
                      </Badge>

                      {/* Selection glow effect */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-lg border-2 border-green-400 animate-pulse" />
                      )}

                      {/* Rarity sparkle effect for epic+ items */}
                      {(plant.rarity === "epic" || plant.rarity === "legendary") && (
                        <div className="absolute top-1 left-1">
                          <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </CustomTooltip>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PlantInventoryBar
