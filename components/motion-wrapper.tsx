"use client"

import { useState, useEffect } from "react"

// Conditional motion imports with fallbacks
let motion: any = null
let AnimatePresence: any = null

// Try to import framer-motion, but provide fallbacks if it fails
const loadMotion = async () => {
  try {
    const framerMotion = await import("framer-motion")
    motion = framerMotion.motion
    AnimatePresence = framerMotion.AnimatePresence
    return true
  } catch (error) {
    console.warn("Framer Motion failed to load, using fallbacks:", error)
    // Fallback components that just render children without animation
    motion = {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    }
    AnimatePresence = ({ children }: any) => children
    return false
  }
}

export function MotionDiv({ children, ...props }: any) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    loadMotion().then(setIsLoaded)
  }, [])

  if (!motion) {
    return <div {...props}>{children}</div>
  }

  const MotionComponent = motion.div
  return <MotionComponent {...props}>{children}</MotionComponent>
}

export function MotionButton({ children, ...props }: any) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    loadMotion().then(setIsLoaded)
  }, [])

  if (!motion) {
    return <button {...props}>{children}</button>
  }

  const MotionComponent = motion.button
  return <MotionComponent {...props}>{children}</MotionComponent>
}

export function MotionSpan({ children, ...props }: any) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    loadMotion().then(setIsLoaded)
  }, [])

  if (!motion) {
    return <span {...props}>{children}</span>
  }

  const MotionComponent = motion.span
  return <MotionComponent {...props}>{children}</MotionComponent>
}

export function SafeAnimatePresence({ children }: any) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    loadMotion().then(setIsLoaded)
  }, [])

  if (!AnimatePresence) {
    return children
  }

  return <AnimatePresence>{children}</AnimatePresence>
}
