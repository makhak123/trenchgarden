"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGardenStore, type PlantType } from "@/lib/store"

export default function PlantInventory({ onSelectPlant, selectedPlant }) {
  const [filter, setFilter] = useState("all")
  const { inventory } = useGardenStore()

  // Default plants everyone has
  const defaultPlants = [
    {
      id: "basic-plant-default",
      name: "Basic Plant",
      type: "basic" as PlantType,
      description: "A simple plant to start your garden",
      color: "#4caf50",
      rarity: "common",
    },
  ]

  // Combine default plants with inventory
  const allPlants = [...defaultPlants, ...inventory]

  const filteredPlants = allPlants.filter((plant) => {
    if (filter === "all") return true
    return plant.rarity === filter
  })

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4">
        <h2 className="font-mono text-2xl font-bold text-green-400">Plant Inventory</h2>
        <p className="text-sm text-green-200/70">Select a plant to place in your garden plots</p>
      </div>

      <Tabs defaultValue="all" className="flex-1" onValueChange={setFilter}>
        <TabsList className="bg-green-900/20">
          <TabsTrigger value="all" className="data-[state=active]:bg-green-700">
            All
          </TabsTrigger>
          <TabsTrigger value="common" className="data-[state=active]:bg-green-700">
            Common
          </TabsTrigger>
          <TabsTrigger value="uncommon" className="data-[state=active]:bg-green-700">
            Uncommon
          </TabsTrigger>
          <TabsTrigger value="rare" className="data-[state=active]:bg-green-700">
            Rare
          </TabsTrigger>
          <TabsTrigger value="legendary" className="data-[state=active]:bg-green-700">
            Legendary
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="flex-1 data-[state=active]:flex-1">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 md:grid-cols-3">
              {filteredPlants.map((plant) => (
                <Card
                  key={plant.id}
                  className={`cursor-pointer border-green-900/30 transition-all hover:border-green-500/50 ${
                    selectedPlant === plant.type ? "border-green-500 bg-green-900/20" : "bg-black/40"
                  }`}
                  onClick={() => onSelectPlant(plant.type)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-green-300">{plant.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={`
                          ${plant.rarity === "common" ? "border-gray-500 text-gray-300" : ""}
                          ${plant.rarity === "uncommon" ? "border-green-500 text-green-300" : ""}
                          ${plant.rarity === "rare" ? "border-blue-500 text-blue-300" : ""}
                          ${plant.rarity === "legendary" ? "border-amber-500 text-amber-300" : ""}
                        `}
                      >
                        {plant.rarity}
                      </Badge>
                    </div>
                    <CardDescription>{plant.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="flex h-32 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${plant.color}20` }}
                    >
                      <div className={`h-16 w-16 rounded-full`} style={{ backgroundColor: plant.color }} />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      variant={selectedPlant === plant.type ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => onSelectPlant(plant.type)}
                    >
                      {selectedPlant === plant.type ? "Selected" : "Select"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
