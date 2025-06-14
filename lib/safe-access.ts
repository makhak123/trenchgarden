"use client"

/**
 * Safe property access utilities to prevent undefined errors
 */

// Global error handler setup
export function setupGlobalErrorHandler() {
  if (typeof window !== "undefined") {
    // Catch unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      console.warn("Unhandled promise rejection:", event.reason)
      event.preventDefault()
    })

    // Catch general errors
    window.addEventListener("error", (event) => {
      if (event.message && event.message.includes("Cannot read properties of undefined")) {
        console.warn("Caught undefined property error:", event.message)
        event.preventDefault()
        return true
      }
    })
  }
}

// Safe property getter
export function safeGet<T = any>(obj: any, path: string | string[], defaultValue: T | null = null): T | null {
  try {
    if (!obj || typeof obj !== "object") return defaultValue

    const keys = Array.isArray(path) ? path : path.split(".")
    let result = obj

    for (const key of keys) {
      if (result == null || typeof result !== "object") {
        return defaultValue
      }
      result = result[key]
    }

    return result !== undefined ? result : defaultValue
  } catch (error) {
    console.warn(`Safe get failed for path ${path}:`, error)
    return defaultValue
  }
}

// Safe property setter
export function safeSet(obj: any, path: string | string[], value: any): boolean {
  try {
    if (!obj || typeof obj !== "object") return false

    const keys = Array.isArray(path) ? path : path.split(".")
    const lastKey = keys.pop()

    if (!lastKey) return false

    let current = obj
    for (const key of keys) {
      if (current[key] == null || typeof current[key] !== "object") {
        current[key] = {}
      }
      current = current[key]
    }

    current[lastKey] = value
    return true
  } catch (error) {
    console.warn(`Safe set failed for path ${path}:`, error)
    return false
  }
}

// Safe function caller
export function safeCall<T = any>(fn: Function | undefined, ...args: any[]): T | null {
  try {
    if (typeof fn === "function") {
      return fn(...args)
    }
    return null
  } catch (error) {
    console.warn("Safe call failed:", error)
    return null
  }
}

// Safe object property access with proxy
export function createSafeProxy<T extends object>(target: T, name = "SafeProxy"): T {
  if (!target || typeof target !== "object") {
    return target
  }

  return new Proxy(target, {
    get(obj, prop, receiver) {
      try {
        const value = Reflect.get(obj, prop, receiver)

        // If accessing a function, wrap it safely
        if (typeof value === "function") {
          return function (...args: any[]) {
            try {
              return value.apply(this, args)
            } catch (error) {
              console.warn(`${name}.${String(prop)} method call failed:`, error)
              return undefined
            }
          }
        }

        return value
      } catch (error) {
        console.warn(`${name}.${String(prop)} property access failed:`, error)
        return undefined
      }
    },

    set(obj, prop, value, receiver) {
      try {
        return Reflect.set(obj, prop, value, receiver)
      } catch (error) {
        console.warn(`${name}.${String(prop)} property set failed:`, error)
        return false
      }
    },
  })
}

// Initialize safe globals
if (typeof window !== "undefined") {
  // Ensure common globals exist
  window.THREE = window.THREE || {}

  // Safe console methods
  if (!window.console) {
    window.console = {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {},
      debug: () => {},
    } as any
  }
}
