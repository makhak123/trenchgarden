"use client"

import { useGardenStore } from "@/lib/store"

// Safe store access that only works on client
export function useGardenStoreSafe() {
  if (typeof window === "undefined") {
    // Return safe defaults for server
    return {
      username: null,
      coins: 0,
      plants: [],
      addPlant: () => {},
      updatePlantGrowth: () => {},
      setUsername: () => {},
      addCoins: () => {},
    }
  }

  try {
    return useGardenStore()
  } catch (error) {
    console.error("Error accessing store:", error)
    return {
      username: null,
      coins: 0,
      plants: [],
      addPlant: () => {},
      updatePlantGrowth: () => {},
      setUsername: () => {},
      addCoins: () => {},
    }
  }
}

export function getGardenStoreSafe() {
  if (typeof window === "undefined") {
    return {
      username: null,
      coins: 0,
      plants: [],
    }
  }

  try {
    return useGardenStore.getState()
  } catch (error) {
    console.error("Error accessing store state:", error)
    return {
      username: null,
      coins: 0,
      plants: [],
    }
  }
}
