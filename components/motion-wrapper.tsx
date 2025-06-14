"use client"

import { useState, useEffect, type ReactNode } from "react"

// Enhanced motion wrapper with better production support
let motion: any = null
let AnimatePresence: any = null
let isMotionLoaded = false

// Improved motion loading with better error handling
const loadMotion = async () => {
  if (isMotionLoaded) return true

  try {
    // Use dynamic import with better error handling
    const framerMotion = await import("framer-motion")
    motion = framerMotion.motion
    AnimatePresence = framerMotion.AnimatePresence
    isMotionLoaded = true
    return true
  } catch (error) {
    console.warn("Framer Motion failed to load, using fallbacks:", error)
    // Enhanced fallback components
    motion = {
      div: ({
        children,
        initial,
        animate,
        exit,
        transition,
        whileHover,
        whileTap,
        style,
        className,
        ...props
      }: any) => (
        <div
          className={className}
          style={{
            ...style,
            // Apply some basic CSS transitions as fallback
            transition: "all 0.3s ease-in-out",
          }}
          {...props}
        >
          {children}
        </div>
      ),
      button: ({
        children,
        initial,
        animate,
        exit,
        transition,
        whileHover,
        whileTap,
        style,
        className,
        ...props
      }: any) => (
        <button
          className={className}
          style={{
            ...style,
            transition: "all 0.2s ease-in-out",
          }}
          {...props}
        >
          {children}
        </button>
      ),
      span: ({
        children,
        initial,
        animate,
        exit,
        transition,
        whileHover,
        whileTap,
        style,
        className,
        ...props
      }: any) => (
        <span
          className={className}
          style={{
            ...style,
            transition: "all 0.2s ease-in-out",
          }}
          {...props}
        >
          {children}
        </span>
      ),
    }
    AnimatePresence = ({ children }: { children: ReactNode }) => <>{children}</>
    isMotionLoaded = true
    return false
  }
}

// Enhanced MotionDiv with better production support
export function MotionDiv({ children, ...props }: any) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadMotion().then(setIsLoaded)
  }, [])

  // Don't render anything during SSR
  if (!isMounted) {
    return <div {...props}>{children}</div>
  }

  if (!motion) {
    return <div {...props}>{children}</div>
  }

  const MotionComponent = motion.div
  return <MotionComponent {...props}>{children}</MotionComponent>
}

export function MotionButton({ children, ...props }: any) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadMotion().then(setIsLoaded)
  }, [])

  if (!isMounted) {
    return <button {...props}>{children}</button>
  }

  if (!motion) {
    return <button {...props}>{children}</button>
  }

  const MotionComponent = motion.button
  return <MotionComponent {...props}>{children}</MotionComponent>
}

export function MotionSpan({ children, ...props }: any) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadMotion().then(setIsLoaded)
  }, [])

  if (!isMounted) {
    return <span {...props}>{children}</span>
  }

  if (!motion) {
    return <span {...props}>{children}</span>
  }

  const MotionComponent = motion.span
  return <MotionComponent {...props}>{children}</MotionComponent>
}

export function SafeAnimatePresence({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadMotion().then(setIsLoaded)
  }, [])

  if (!isMounted) {
    return <>{children}</>
  }

  if (!AnimatePresence) {
    return <>{children}</>
  }

  return <AnimatePresence>{children}</AnimatePresence>
}
