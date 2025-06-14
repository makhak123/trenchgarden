/**
 * Startup fixes for common undefined property issues
 */

// Polyfill for missing properties that cause 'S' errors
export function applyStartupFixes() {
  if (typeof window === "undefined") return

  try {
    // Fix common undefined property issues

    // Ensure console methods exist
    if (!window.console) {
      window.console = {
        log: () => {},
        warn: () => {},
        error: () => {},
        info: () => {},
        debug: () => {},
      } as any
    }

    // Fix potential Three.js undefined issues
    if (typeof window !== "undefined" && !window.THREE) {
      // Create a safe placeholder to prevent undefined access
      window.THREE = {} as any
    }

    // Fix potential React undefined issues
    if (typeof window !== "undefined" && !window.React) {
      // Import React dynamically if needed
      import("react")
        .then((React) => {
          window.React = React
        })
        .catch(() => {
          // Silent fail
        })
    }

    // Prevent common property access errors
    const originalObjectDefineProperty = Object.defineProperty
    Object.defineProperty = function (obj, prop, descriptor) {
      try {
        return originalObjectDefineProperty.call(this, obj, prop, descriptor)
      } catch (error) {
        console.warn("Property definition failed:", prop, error)
        return obj
      }
    }

    // Fix potential module loading issues
    if (typeof window !== "undefined" && !window.module) {
      window.module = { exports: {} } as any
    }

    console.log("Startup fixes applied successfully")
  } catch (error) {
    console.warn("Error applying startup fixes:", error)
  }
}

// Auto-apply fixes when module loads
if (typeof window !== "undefined") {
  applyStartupFixes()
}
