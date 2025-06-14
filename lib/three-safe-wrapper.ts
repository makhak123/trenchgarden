"use client"

/**
 * Safe wrapper for Three.js components to prevent undefined property errors
 */

import { useEffect, useRef } from "react"

// Safe Three.js object wrapper
export function createSafeThreeObject<T extends object>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj

  return new Proxy(obj, {
    get(target, prop, receiver) {
      try {
        const value = Reflect.get(target, prop, receiver)

        // If it's a function, wrap it safely
        if (typeof value === "function") {
          return function (...args: any[]) {
            try {
              return value.apply(this, args)
            } catch (error) {
              console.warn(`Safe Three.js method call failed for ${String(prop)}:`, error)
              return undefined
            }
          }
        }

        return value
      } catch (error) {
        console.warn(`Safe Three.js property access failed for ${String(prop)}:`, error)
        return undefined
      }
    },

    set(target, prop, value, receiver) {
      try {
        return Reflect.set(target, prop, value, receiver)
      } catch (error) {
        console.warn(`Safe Three.js property set failed for ${String(prop)}:`, error)
        return false
      }
    },
  })
}

// Hook for safe Three.js refs
export function useSafeThreeRef<T extends object>() {
  const ref = useRef<T | null>(null)

  const safeRef = {
    get current() {
      const current = ref.current
      return current ? createSafeThreeObject(current) : null
    },
    set current(value: T | null) {
      ref.current = value
    },
  }

  return safeRef
}

// Safe useFrame wrapper
export function useSafeFrame(callback: (state: any, delta: number) => void) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    // This will be used with useFrame from @react-three/fiber
    const safeCallback = (state: any, delta: number) => {
      try {
        callbackRef.current(state, delta)
      } catch (error) {
        console.warn("Safe useFrame callback error:", error)
      }
    }

    return safeCallback
  }, [])
}
