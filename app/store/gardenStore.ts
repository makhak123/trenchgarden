import { create } from "zustand"

export interface Plant {
  id: string
  type: string
  growthStage: number
  color: string
  plantedAt: number
}

interface GardenState {
  plants: Plant[]
  addPlant: (type: string, color?: string) => void
  waterPlant: (id: string) => void
  harvestPlant: (id: string) => void
}

export const useGardenStore = create<GardenState>((set) => ({
  plants: [
    { id: "1", type: "flower", growthStage: 3, color: "#ff5722", plantedAt: Date.now() },
    { id: "2", type: "mushroom", growthStage: 2, color: "#9c27b0", plantedAt: Date.now() },
    { id: "3", type: "crystal", growthStage: 4, color: "#2196f3", plantedAt: Date.now() },
    { id: "4", type: "default", growthStage: 1, color: "#4caf50", plantedAt: Date.now() },
  ],

  addPlant: (type, color = "#4caf50") =>
    set((state) => ({
      plants: [
        ...state.plants,
        {
          id: Math.random().toString(36).substring(2, 9),
          type,
          growthStage: 1,
          color,
          plantedAt: Date.now(),
        },
      ],
    })),

  waterPlant: (id) =>
    set((state) => ({
      plants: state.plants.map((plant) =>
        plant.id === id && plant.growthStage < 5 ? { ...plant, growthStage: plant.growthStage + 1 } : plant,
      ),
    })),

  harvestPlant: (id) =>
    set((state) => ({
      plants: state.plants.filter((plant) => plant.id !== id),
    })),
}))
