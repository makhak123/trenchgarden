// WebGL detection utility
export function isWebGLAvailable(): boolean {
  try {
    // Create a canvas element
    const canvas = document.createElement("canvas")

    // Try to get WebGL context - return true if successful
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")))
  } catch (e) {
    console.error("WebGL detection error:", e)
    return false
  }
}

// Check if the browser environment is available
export function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}
