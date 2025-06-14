"use client"

import { useState, useEffect, useRef } from "react"
import { MotionDiv, MotionSpan, SafeAnimatePresence } from "@/components/motion-wrapper"
import dynamic from "next/dynamic"
import { Leaf } from "lucide-react"

// Import 3D components with no SSR
const LoadingCanvas = dynamic(() => import("@/components/loading-canvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 to-black"></div>,
})

// Particle effect component
const ParticleEffect = () => {
  const particles = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 2 + 2,
    delay: Math.random() * 2,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <MotionDiv
          key={particle.id}
          className="absolute rounded-full bg-green-400/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}

// Animated letter component for the title
const AnimatedLetter = ({ letter, index }) => {
  return (
    <MotionSpan
      className="inline-block"
      initial={{ opacity: 0, y: -100 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          delay: 0.5 + index * 0.1,
          type: "spring",
          stiffness: 100,
          damping: 10,
          mass: 0.8,
        },
      }}
      whileHover={{
        scale: 1.2,
        color: "#4ade80",
        rotate: Math.random() * 10 - 5,
        transition: { duration: 0.2 },
      }}
    >
      {letter}
    </MotionSpan>
  )
}

// Animated progress bar component
const AnimatedProgressBar = ({ progress }) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 50, damping: 15 }}
      className="w-80 mb-8"
    >
      <div className="h-3 w-full bg-green-900/30 rounded-full overflow-hidden backdrop-blur-sm border border-green-500/30">
        <MotionDiv
          className="h-full bg-gradient-to-r from-green-500 to-green-300"
          style={{ width: `${progress}%` }}
          initial={{ width: "0%" }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      </div>

      <div className="flex justify-between mt-2 text-green-300 text-sm font-mono">
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex items-center"
        >
          <span className="bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Loading assets...</span>
        </MotionDiv>

        <MotionDiv
          className="bg-black/50 px-2 py-1 rounded backdrop-blur-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 15 }}
        >
          <MotionSpan
            key={Math.round(progress)}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="inline-block"
          >
            {Math.round(progress)}%
          </MotionSpan>
        </MotionDiv>
      </div>
    </MotionDiv>
  )
}

// Main loading screen component
export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [showEnterButton, setShowEnterButton] = useState(false)
  const loadingInterval = useRef<NodeJS.Timeout | null>(null)
  const title = "TRENCH GARDEN"
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    loadingInterval.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          if (loadingInterval.current) clearInterval(loadingInterval.current)
          setShowEnterButton(true)
          return 100
        }
        return newProgress
      })
    }, 200)

    return () => {
      if (loadingInterval.current) clearInterval(loadingInterval.current)
    }
  }, [])

  if (!isMounted) {
    return <div className="fixed inset-0 bg-black"></div>
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* 3D Garden Background */}
      <div className="absolute inset-0 opacity-80">
        <LoadingCanvas />
      </div>

      {/* Particle effects */}
      <ParticleEffect />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Logo animation */}
        <div className="mb-12 relative">
          <MotionDiv
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="absolute -left-16 -top-8"
          >
            <Leaf className="h-16 w-16 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
          </MotionDiv>

          <div className="font-mono text-6xl font-bold tracking-tighter text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">
            {title.split("").map((letter, index) => (
              <AnimatedLetter key={index} letter={letter} index={index} />
            ))}
          </div>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, type: "spring", stiffness: 100, damping: 10 }}
            className="text-center mt-2 text-green-300/80 font-mono text-sm"
          >
            <span className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Grow your virtual garden</span>
          </MotionDiv>
        </div>

        {/* Loading bar */}
        <AnimatedProgressBar progress={progress} />

        {/* Enter button */}
        <SafeAnimatePresence>
          {showEnterButton && (
            <MotionDiv
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <button
                onClick={onComplete}
                className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-md text-xl font-medium shadow-lg shadow-green-900/30 border border-green-400/20 transition-all duration-200 hover:scale-105"
              >
                Enter Garden
              </button>
            </MotionDiv>
          )}
        </SafeAnimatePresence>

        {/* Loading spinner */}
        <SafeAnimatePresence>
          {!showEnterButton && (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0, y: 20, scale: 0 }}
              transition={{
                opacity: { duration: 0.3 },
                rotate: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              }}
              className="absolute bottom-10"
            >
              <div className="h-8 w-8 rounded-full border-4 border-t-green-400 border-r-green-400/40 border-b-green-400/10 border-l-green-400/70" />
            </MotionDiv>
          )}
        </SafeAnimatePresence>
      </div>

      {/* Version info */}
      <MotionDiv
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute bottom-4 right-4 text-green-400/60 text-sm bg-black/30 px-2 py-1 rounded backdrop-blur-sm"
      >
        Version 1.0.0
      </MotionDiv>
    </div>
  )
}
