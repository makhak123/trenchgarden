/**
 * Safe property access utility to prevent undefined property errors
 */

// Type-safe property accessor
export function safeGet<T, K extends keyof T>(obj: T | undefined | null, key: K): T[K] | undefined {
  if (obj == null) return undefined
  try {
    return obj[key]
  } catch (error) {
    console.warn(`Safe access failed for key "${String(key)}":`, error)
    return undefined
  }
}

// Deep property access with path
export function safeGetPath<T = any>(obj: any, path: string): T | undefined {
  if (obj == null || typeof path !== "string") return undefined

  try {
    return path.split(".").reduce((current, key) => {
      if (current == null) return undefined
      return current[key]
    }, obj)
  } catch (error) {
    console.warn(`Safe path access failed for path "${path}":`, error)
    return undefined
  }
}

// Safe function call
export function safeCall<T extends (...args: any[]) => any>(
  fn: T | undefined | null,
  ...args: Parameters<T>
): ReturnType<T> | undefined {
  if (typeof fn !== "function") return undefined

  try {
    return fn(...args)
  } catch (error) {
    console.warn("Safe function call failed:", error)
    return undefined
  }
}

// Safe object property assignment
export function safeSet<T extends object, K extends keyof T>(obj: T | undefined | null, key: K, value: T[K]): boolean {
  if (obj == null) return false

  try {
    obj[key] = value
    return true
  } catch (error) {
    console.warn(`Safe set failed for key "${String(key)}":`, error)
    return false
  }
}

// Global error handler for undefined property access
export function setupGlobalErrorHandler() {
  if (typeof window !== "undefined") {
    // Override property access to catch undefined errors
    const originalError = window.onerror

    window.onerror = function (message, source, lineno, colno, error) {
      // Check if it's the "Cannot read properties of undefined" error
      if (typeof message === "string" && message.includes("Cannot read properties of undefined")) {
        console.warn("Caught undefined property access:", {
          message,
          source,
          lineno,
          colno,
          error,
        })

        // Don't let this error crash the app
        return true
      }

      // Call original error handler
      if (originalError) {
        return originalError.call(this, message, source, lineno, colno, error)
      }

      return false
    }

    // Also handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason && typeof event.reason.message === "string") {
        if (event.reason.message.includes("Cannot read properties of undefined")) {
          console.warn("Caught unhandled promise rejection for undefined property:", event.reason)
          event.preventDefault()
        }
      }
    })
  }
}
