export interface PlantDataType {
  id: string
  name: string
  description: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  shape: "round" | "flat" | "spiky" | "crystal" | "leafy" | "flowering"
  color: string
  growthTime: number // seconds for full growth
  growthStages: number // number of growth stages
}

const plantData: Record<string, PlantDataType> = {
  basic: {
    id: "basic",
    name: "Basic Plant",
    description: "A common plant that grows quickly",
    rarity: "common",
    shape: "flat",
    color: "#4caf50",
    growthTime: 60, // 1 minute
    growthStages: 5,
  },
  mushroom: {
    id: "mushroom",
    name: "Trench Shroom",
    description: "A common mushroom that thrives in dark, damp trenches",
    rarity: "common",
    shape: "round",
    color: "#f44336",
    growthTime: 120, // 2 minutes
    growthStages: 5,
  },
  crystal: {
    id: "crystal",
    name: "Crystal Bloom",
    description: "An uncommon crystalline plant that absorbs and reflects light",
    rarity: "uncommon",
    shape: "crystal",
    color: "#2196f3",
    growthTime: 300, // 5 minutes
    growthStages: 5,
  },
  flower: {
    id: "flower",
    name: "Golden Flower",
    description: "A rare flower with vibrant petals",
    rarity: "rare",
    shape: "flowering",
    color: "#ffc107",
    growthTime: 600, // 10 minutes
    growthStages: 5,
  },
  tree: {
    id: "tree",
    name: "Ancient Tree",
    description: "A rare tree with mystical properties",
    rarity: "rare",
    shape: "spiky",
    color: "#795548",
    growthTime: 900, // 15 minutes
    growthStages: 5,
  },
  rare: {
    id: "rare",
    name: "Void Plant",
    description: "An epic plant that seems to bend reality around it",
    rarity: "epic",
    shape: "crystal",
    color: "#9c27b0",
    growthTime: 1800, // 30 minutes
    growthStages: 5,
  },
  legendary: {
    id: "legendary",
    name: "Ether Blossom",
    description: "A legendary plant said to connect to other dimensions",
    rarity: "legendary",
    shape: "crystal",
    color: "#e91e63",
    growthTime: 3600, // 1 hour
    growthStages: 5,
  },
  cactus: {
    id: "cactus",
    name: "Desert Cactus",
    description: "A hardy plant with protective spines",
    rarity: "uncommon",
    shape: "spiky",
    color: "#66bb6a",
    growthTime: 240, // 4 minutes
    growthStages: 5,
  },
  venus: {
    id: "venus",
    name: "Venus Flytrap",
    description: "A carnivorous plant with a snapping trap",
    rarity: "rare",
    shape: "flat",
    color: "#8bc34a",
    growthTime: 720, // 12 minutes
    growthStages: 5,
  },
  bonsai: {
    id: "bonsai",
    name: "Bonsai Tree",
    description: "A miniature tree grown with special care",
    rarity: "epic",
    shape: "leafy",
    color: "#81c784",
    growthTime: 1500, // 25 minutes
    growthStages: 5,
  },
  glowshroom: {
    id: "glowshroom",
    name: "Glowing Mushroom",
    description: "A luminescent fungus that glows in the dark",
    rarity: "rare",
    shape: "round",
    color: "#00bcd4",
    growthTime: 540, // 9 minutes
    growthStages: 5,
  },
  sunflower: {
    id: "sunflower",
    name: "Giant Sunflower",
    description: "A tall flower that follows the sun",
    rarity: "uncommon",
    shape: "flowering",
    color: "#fdd835",
    growthTime: 360, // 6 minutes
    growthStages: 5,
  },
  bamboo: {
    id: "bamboo",
    name: "Lucky Bamboo",
    description: "A fast-growing plant that brings good fortune",
    rarity: "uncommon",
    shape: "spiky",
    color: "#7cb342",
    growthTime: 180, // 3 minutes
    growthStages: 5,
  },
  orchid: {
    id: "orchid",
    name: "Exotic Orchid",
    description: "A delicate flower with intricate patterns",
    rarity: "epic",
    shape: "flowering",
    color: "#ba68c8",
    growthTime: 1200, // 20 minutes
    growthStages: 5,
  },
  starfruit: {
    id: "starfruit",
    name: "Cosmic Starfruit",
    description: "A legendary plant with star-shaped fruits",
    rarity: "legendary",
    shape: "crystal",
    color: "#ffeb3b",
    growthTime: 2700, // 45 minutes
    growthStages: 5,
  },
}

export function getPlantData(type: string): PlantDataType | undefined {
  return plantData[type]
}

export function getAllPlantData(): Record<string, PlantDataType> {
  return plantData
}
