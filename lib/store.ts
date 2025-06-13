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
  growthProgress: number // Added to track partial growth between stages
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
const createInitialPlants = (username: string) => [
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
          const now = Date.now()
          const updatedPlants = state.plants.map((plant) => {
            if (plant.growthStage >= 5) return plant // Already fully grown

            const plantData = getPlantData(plant.type)
            if (!plantData) return plant

            const growthTime = plantData.growthTime * 1000 // Convert to milliseconds
            const timePerStage = growthTime / 5
            const timeSinceLastUpdate = now - plant.lastGrowthUpdate

            // Calculate progress percentage for this update
            const progressIncrement = timeSinceLastUpdate / timePerStage
            let newProgress = plant.growthProgress + progressIncrement
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
                setTimeout(() => get().gainExperience(expReward), 0)
              }
            }

            return {
              ...plant,
              growthStage: newGrowthStage,
              growthProgress: newProgress,
              lastGrowthUpdate: now,
            }
          })

          return { plants: updatedPlants }
        }),
    }),
    {
      name: "trench-garden-storage",
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
  {
    id: "desert-cactus",
    name: "Desert Cactus",
    type: "cactus",
    price: 40,
    description: "A hardy plant with protective spines",
    color: "#66bb6a",
    rarity: "uncommon",
    unlockLevel: 2,
  },
  {
    id: "venus-flytrap",
    name: "Venus Flytrap",
    type: "venus",
    price: 100,
    description: "A carnivorous plant with a snapping trap",
    color: "#8bc34a",
    rarity: "rare",
    unlockLevel: 3,
  },
  {
    id: "bonsai-tree",
    name: "Bonsai Tree",
    type: "bonsai",
    price: 250,
    description: "A miniature tree grown with special care",
    color: "#81c784",
    rarity: "epic",
    unlockLevel: 4,
  },
  {
    id: "glowing-mushroom",
    name: "Glowing Mushroom",
    type: "glowshroom",
    price: 120,
    description: "A luminescent fungus that glows in the dark",
    color: "#00bcd4",
    rarity: "rare",
    unlockLevel: 3,
  },
  {
    id: "giant-sunflower",
    name: "Giant Sunflower",
    type: "sunflower",
    price: 60,
    description: "A tall flower that follows the sun",
    color: "#fdd835",
    rarity: "uncommon",
    unlockLevel: 2,
  },
  {
    id: "lucky-bamboo",
    name: "Lucky Bamboo",
    type: "bamboo",
    price: 35,
    description: "A fast-growing plant that brings good fortune",
    color: "#7cb342",
    rarity: "uncommon",
    unlockLevel: 1,
  },
  {
    id: "exotic-orchid",
    name: "Exotic Orchid",
    type: "orchid",
    price: 350,
    description: "A delicate flower with intricate patterns",
    color: "#ba68c8",
    rarity: "epic",
    unlockLevel: 6,
  },
  {
    id: "cosmic-starfruit",
    name: "Cosmic Starfruit",
    type: "starfruit",
    price: 600,
    description: "A legendary plant with star-shaped fruits",
    color: "#ffeb3b",
    rarity: "legendary",
    unlockLevel: 8,
  },
]
