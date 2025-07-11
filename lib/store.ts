import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getPlantData } from "./plant-data"

export type PlantType =
  | "basic"
  | "mushroom"
  | "crystal"
  | "flower"
  | "tree"
  | "rare"
  | "legendary"
  | "cactus"
  | "venus"
  | "bonsai"
  | "glowshroom"
  | "sunflower"
  | "bamboo"
  | "orchid"
  | "starfruit"

export interface Plant {
  id: string
  type: PlantType
  position: [number, number, number]
  growthStage: number
  color: string
  plantedAt: number
  owner: string
  rotation: number
  lastGrowthUpdate: number
  growthProgress?: number
}

export interface ShopItem {
  id: string
  name: string
  type: PlantType
  price: number
  description: string
  color: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  unlockLevel: number
}

interface GardenState {
  username: string
  coins: number
  level: number
  experience: number
  plants: Plant[]
  inventory: ShopItem[]

  // Actions
  setUsername: (name: string) => void
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
  addPlant: (type: PlantType, position: [number, number, number], color: string, rotation: number) => void
  removePlant: (id: string) => void
  purchaseItem: (itemId: string) => boolean
  gainExperience: (amount: number) => void
  updatePlantGrowth: () => void
}

// Create some initial plants for the garden
const createInitialPlants = (username: string): Plant[] => [
  {
    id: "initial-1",
    type: "basic" as PlantType,
    position: [-10, 0.05, -10] as [number, number, number],
    growthStage: 3,
    color: "#4caf50",
    plantedAt: Date.now() - 86400000, // 1 day ago
    owner: username || "Garden",
    rotation: Math.random() * Math.PI * 2,
    lastGrowthUpdate: Date.now() - 86400000,
    growthProgress: 0,
  },
  {
    id: "initial-2",
    type: "mushroom" as PlantType,
    position: [0, 0.05, 0] as [number, number, number],
    growthStage: 2,
    color: "#f44336",
    plantedAt: Date.now() - 43200000, // 12 hours ago
    owner: username || "Garden",
    rotation: Math.random() * Math.PI * 2,
    lastGrowthUpdate: Date.now() - 43200000,
    growthProgress: 0,
  },
  {
    id: "initial-3",
    type: "flower" as PlantType,
    position: [10, 0.05, 10] as [number, number, number],
    growthStage: 4,
    color: "#ffc107",
    plantedAt: Date.now() - 172800000, // 2 days ago
    owner: username || "Garden",
    rotation: Math.random() * Math.PI * 2,
    lastGrowthUpdate: Date.now() - 172800000,
    growthProgress: 0,
  },
  {
    id: "initial-4",
    type: "cactus" as PlantType,
    position: [-5, 0.05, 5] as [number, number, number],
    growthStage: 5,
    color: "#66bb6a",
    plantedAt: Date.now() - 259200000, // 3 days ago
    owner: username || "Garden",
    rotation: Math.random() * Math.PI * 2,
    lastGrowthUpdate: Date.now() - 259200000,
    growthProgress: 0,
  },
  {
    id: "initial-5",
    type: "venus" as PlantType,
    position: [5, 0.05, -5] as [number, number, number],
    growthStage: 3,
    color: "#8bc34a",
    plantedAt: Date.now() - 129600000, // 1.5 days ago
    owner: username || "Garden",
    rotation: Math.random() * Math.PI * 2,
    lastGrowthUpdate: Date.now() - 129600000,
    growthProgress: 0,
  },
]

export const useGardenStore = create<GardenState>()(
  persist(
    (set, get) => ({
      username: "",
      coins: 100,
      level: 1,
      experience: 0,
      plants: [],
      inventory: [],

      setUsername: (name) =>
        set((state) => {
          // If this is the first time setting a username, add initial plants
          const isFirstTime = !state.username && name
          return {
            username: name,
            plants: isFirstTime ? createInitialPlants(name) : state.plants,
          }
        }),

      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

      spendCoins: (amount) => {
        const { coins } = get()
        if (coins >= amount) {
          set({ coins: coins - amount })
          return true
        }
        return false
      },

      addPlant: (type, position, color, rotation = 0) =>
        set((state) => ({
          plants: [
            ...state.plants,
            {
              id: Math.random().toString(36).substring(2, 9),
              type,
              position,
              growthStage: 1,
              color,
              plantedAt: Date.now(),
              owner: state.username,
              rotation,
              lastGrowthUpdate: Date.now(),
              growthProgress: 0,
            },
          ],
        })),

      removePlant: (id) =>
        set((state) => ({
          plants: state.plants.filter((plant) => plant.id !== id),
        })),

      purchaseItem: (itemId) => {
        const shopItems = getShopItems()
        const item = shopItems.find((i) => i.id === itemId)

        if (!item) return false

        const { coins, level, inventory } = get()

        if (coins < item.price || level < item.unlockLevel) return false

        set({
          coins: coins - item.price,
          inventory: [...inventory, item],
        })

        return true
      },

      gainExperience: (amount) =>
        set((state) => {
          const newExperience = state.experience + amount
          const experienceToNextLevel = state.level * 100

          if (newExperience >= experienceToNextLevel) {
            return {
              experience: newExperience - experienceToNextLevel,
              level: state.level + 1,
              coins: state.coins + 50, // Level up bonus
            }
          }

          return { experience: newExperience }
        }),

      updatePlantGrowth: () =>
        set((state) => {
          try {
            const now = Date.now()
            const updatedPlants = state.plants.map((plant) => {
              try {
                if (plant.growthStage >= 5) return plant // Already fully grown

                const plantData = getPlantData(plant.type)
                if (!plantData) return plant

                const growthTime = plantData.growthTime * 1000 // Convert to milliseconds
                const timePerStage = growthTime / 5
                const timeSinceLastUpdate = now - (plant.lastGrowthUpdate || plant.plantedAt)

                // Calculate progress percentage for this update
                const progressIncrement = timeSinceLastUpdate / timePerStage
                let newProgress = (plant.growthProgress || 0) + progressIncrement
                let newGrowthStage = plant.growthStage

                // If progress exceeds 1, increment growth stage
                if (newProgress >= 1) {
                  const stagesGained = Math.floor(newProgress)
                  newGrowthStage = Math.min(plant.growthStage + stagesGained, 5)
                  newProgress = newProgress - stagesGained

                  // If plant reaches full growth, give experience
                  if (newGrowthStage >= 5) {
                    // Award experience based on rarity
                    let expReward = 5 // common
                    if (plantData.rarity === "uncommon") expReward = 10
                    if (plantData.rarity === "rare") expReward = 20
                    if (plantData.rarity === "epic") expReward = 35
                    if (plantData.rarity === "legendary") expReward = 50

                    // Add experience outside this function to avoid state update conflicts
                    setTimeout(() => {
                      try {
                        get().gainExperience(expReward)
                      } catch (error) {
                        console.warn("Error gaining experience:", error)
                      }
                    }, 0)
                  }
                }

                return {
                  ...plant,
                  growthStage: newGrowthStage,
                  growthProgress: newProgress,
                  lastGrowthUpdate: now,
                }
              } catch (error) {
                console.warn("Error updating plant growth:", error)
                return plant
              }
            })

            return { plants: updatedPlants }
          } catch (error) {
            console.error("Error in updatePlantGrowth:", error)
            return state
          }
        }),
    }),
    {
      name: "trench-garden-storage",
      // Add error handling for storage
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Error rehydrating storage:", error)
        }
      },
    },
  ),
)

// Shop items data
export const getShopItems = (): ShopItem[] => [
  {
    id: "basic-plant",
    name: "Basic Plant",
    type: "basic",
    price: 10,
    description: "A simple plant to start your garden",
    color: "#4caf50",
    rarity: "common",
    unlockLevel: 1,
  },
  {
    id: "red-mushroom",
    name: "Red Mushroom",
    type: "mushroom",
    price: 25,
    description: "A vibrant red mushroom",
    color: "#f44336",
    rarity: "common",
    unlockLevel: 1,
  },
  {
    id: "blue-crystal",
    name: "Blue Crystal",
    type: "crystal",
    price: 50,
    description: "A shimmering blue crystal",
    color: "#2196f3",
    rarity: "uncommon",
    unlockLevel: 2,
  },
  {
    id: "golden-flower",
    name: "Golden Flower",
    type: "flower",
    price: 75,
    description: "A rare golden flower",
    color: "#ffc107",
    rarity: "rare",
    unlockLevel: 3,
  },
  {
    id: "ancient-tree",
    name: "Ancient Tree",
    type: "tree",
    price: 150,
    description: "An ancient tree with mystical properties",
    color: "#795548",
    rarity: "rare",
    unlockLevel: 4,
  },
  {
    id: "void-plant",
    name: "Void Plant",
    type: "rare",
    price: 300,
    description: "A mysterious plant from another dimension",
    color: "#9c27b0",
    rarity: "epic",
    unlockLevel: 5,
  },
  {
    id: "ether-blossom",
    name: "Ether Blossom",
    type: "legendary",
    price: 500,
    description: "A legendary plant said to connect to other dimensions",
    color: "#e91e63",
    rarity: "legendary",
    unlockLevel: 7,
  },
]

// Export default for compatibility
export default useGardenStore
