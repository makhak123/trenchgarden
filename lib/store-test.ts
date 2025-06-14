// Simple test to ensure store exports work correctly
import { useGardenStore } from "./store"

export function testStore() {
  try {
    const store = useGardenStore.getState()
    console.log("Store test passed:", !!store)
    return true
  } catch (error) {
    console.error("Store test failed:", error)
    return false
  }
}
