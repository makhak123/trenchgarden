"use client"

import { useState, useEffect, type ReactNode } from "react"

// Enhanced motion wrapper with better production support and error handling
let motion: any = null
let AnimatePresence: any = null
let isMotionLoaded = false
let loadingPromise: Promise<boolean> | null = null

// Improved motion loading with better error handling
const loadMotion = async (): Promise<boolean> => {
  if (isMotionLoaded) return true
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    try {
      // Use dynamic import with better error handling
      const framerMotion = await import("framer-motion")

      // Safely access motion properties
      if (framerMotion && typeof framerMotion === "object") {
        motion = framerMotion.motion || null
        AnimatePresence = framerMotion.AnimatePresence || null

        if (motion && AnimatePresence) {
          isMotionLoaded = true
          return true
        }
      }

      throw new Error("Failed to load motion components")
    } catch (error) {
      console.warn("Framer Motion failed to load, using fallbacks:", error)

      // Enhanced fallback components with better error handling
      const createFallbackComponent =
        (tag: string) =>
        ({
          children,
          initial,
          animate,
          exit,
          transition,
          whileHover,
          whileTap,
          style,
          className,
          onClick,
          onMouseEnter,
          onMouseLeave,
          ...props
        }: any) => {
          const Component = tag as any
          return (
            <Component
              className={className}
              style={{
                ...style,
                // Apply some basic CSS transitions as fallback
                transition: "all 0.3s ease-in-out",
              }}
              onClick={onClick}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              {...props}
            >
              {children}
            </Component>
          )
        }

      motion = {
        div: createFallbackComponent("div"),
        button: createFallbackComponent("button"),
        span: createFallbackComponent("span"),
      }

      AnimatePresence = ({ children }: { children: ReactNode }) => <>{children}</>
      isMotionLoaded = true
      return false
    }
  })()

  return loadingPromise
}

// Enhanced MotionDiv with better production support
export function MotionDiv({ children, ...props }: any) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    let mounted = true
    setIsMounted(true)

    loadMotion()
      .then((success) => {
        if (mounted) {
          setIsLoaded(true)
        }
      })
      .catch((error) => {
        console.warn("Error loading motion:", error)
        if (mounted) {
          setIsLoaded(true) // Still set loaded to show fallback
        }
      })

    return () => {
      mounted = false
      setIsMounted(false)
    }
  }, [])

  // Don't render anything during SSR
  if (!isMounted) {
    return <div {...props}>{children}</div>
  }

  if (!motion || !motion.div) {
    return <div {...props}>{children}</div>
  }

  try {
    const MotionComponent = motion.div
    return <MotionComponent {...props}>{children}</MotionComponent>
  } catch (error) {
    console.warn("Error rendering MotionDiv:", error)
    return <div {...props}>{children}</div>
  }
}

export function MotionButton({ children, ...props }: any) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    let mounted = true
    setIsMounted(true)

    loadMotion()
      .then((success) => {
        if (mounted) {
          setIsLoaded(true)
        }
      })
      .catch((error) => {
        console.warn("Error loading motion:", error)
        if (mounted) {
          setIsLoaded(true)
        }
      })

    return () => {
      mounted = false
      setIsMounted(false)
    }
  }, [])

  if (!isMounted) {
    return <button {...props}>{children}</button>
  }

  if (!motion || !motion.button) {
    return <button {...props}>{children}</button>
  }

  try {
    const MotionComponent = motion.button
    return <MotionComponent {...props}>{children}</MotionComponent>
  } catch (error) {
    console.warn("Error rendering MotionButton:", error)
    return <button {...props}>{children}</button>
  }
}

export function MotionSpan({ children, ...props }: any) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    let mounted = true
    setIsMounted(true)

    loadMotion()
      .then((success) => {
        if (mounted) {
          setIsLoaded(true)
        }
      })
      .catch((error) => {
        console.warn("Error loading motion:", error)
        if (mounted) {
          setIsLoaded(true)
        }
      })

    return () => {
      mounted = false
      setIsMounted(false)
    }
  }, [])

  if (!isMounted) {
    return <span {...props}>{children}</span>
  }

  if (!motion || !motion.span) {
    return <span {...props}>{children}</span>
  }

  try {
    const MotionComponent = motion.span
    return <MotionComponent {...props}>{children}</MotionComponent>
  } catch (error) {
    console.warn("Error rendering MotionSpan:", error)
    return <span {...props}>{children}</span>
  }
}

export function SafeAnimatePresence({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    let mounted = true
    setIsMounted(true)

    loadMotion()
      .then((success) => {
        if (mounted) {
          setIsLoaded(true)
        }
      })
      .catch((error) => {
        console.warn("Error loading motion:", error)
        if (mounted) {
          setIsLoaded(true)
        }
      })

    return () => {
      mounted = false
      setIsMounted(false)
    }
  }, [])

  if (!isMounted) {
    return <>{children}</>
  }

  if (!AnimatePresence) {
    return <>{children}</>
  }

  try {
    return <AnimatePresence>{children}</AnimatePresence>
  } catch (error) {
    console.warn("Error rendering AnimatePresence:", error)
    return <>{children}</>
  }
}
