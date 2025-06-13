"use client"

import { useState, useEffect, useCallback } from "react"
import { useGardenStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { getPlantData } from "@/lib/plant-data"

export default function PlantInventoryBar({ onSelectPlant, selectedPlant }) {
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

  return (
    <div className="absolute bottom-0 left-0 right-0 flex h-24 items-center justify-center bg-gradient-to-t from-black/80 to-transparent px-4 pb-2">
      <div className="flex h-20 items-center gap-1 rounded-md bg-black/80 p-1 backdrop-blur-md">
        {slots.map((plant, index) => {
          if (!plant) {
            // Empty slot
            return (
              <div
                key={`empty-${index}`}
                className="flex h-16 w-16 items-center justify-center rounded border-2 border-gray-700/50 bg-gray-800/30"
              >
                <span className="text-gray-500 text-xs">Empty</span>
                <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0 text-[10px] bg-gray-700">{index + 1}</Badge>
              </div>
            )
          }

          const plantData = getPlantData(plant.type)
          return (
            <TooltipProvider key={plant.id || `plant-${index}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "group relative flex h-16 w-16 cursor-pointer items-center justify-center rounded border-2 transition-all hover:border-green-400",
                      selectedPlant === plant.type
                        ? "border-green-500 bg-green-900/40"
                        : "border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/30",
                    )}
                    onClick={() => handlePlantClick(plant.type)}
                    onMouseEnter={() => setHoveredPlant(plant.type)}
                    onMouseLeave={() => setHoveredPlant(null)}
                  >
                    <div
                      className="h-12 w-12 rounded-sm"
                      style={{
                        backgroundColor: plant.color,
                        boxShadow: `0 0 15px ${plant.color}60`,
                      }}
                    />
                    <Badge
                      className={cn(
                        "absolute -right-1 -top-1 h-5 w-5 p-0 text-[10px]",
                        plant.rarity === "common" && "bg-gray-500",
                        plant.rarity === "uncommon" && "bg-green-500",
                        plant.rarity === "rare" && "bg-blue-500",
                        plant.rarity === "epic" && "bg-purple-500",
                        plant.rarity === "legendary" && "bg-amber-500",
                      )}
                    >
                      {index + 1}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-black/90 text-white">
                  <div className="flex flex-col gap-1 p-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{plant.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          plant.rarity === "common" && "border-gray-500 text-gray-300",
                          plant.rarity === "uncommon" && "border-green-500 text-green-300",
                          plant.rarity === "rare" && "border-blue-500 text-blue-300",
                          plant.rarity === "epic" && "border-purple-500 text-purple-300",
                          plant.rarity === "legendary" && "border-amber-500 text-amber-300",
                        )}
                      >
                        {plant.rarity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-300">{plant.description}</p>
                    <p className="text-xs text-gray-400">Growth time: {plantData?.growthTime || 60} seconds</p>
                    <p className="text-xs text-gray-400 italic">
                      Click to {selectedPlant === plant.type ? "deselect" : "select"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    </div>
  )
}
