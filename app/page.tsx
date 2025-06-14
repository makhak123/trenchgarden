"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useGardenStore } from "@/lib/store"
import { MotionDiv } from "@/components/motion-wrapper"
import dynamic from "next/dynamic"

// Import LoadingScreen with no SSR and a loading component
const LoadingScreen = dynamic(() => import("@/components/loading-screen"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="text-green-400 text-xl">Loading...</div>
    </div>
  ),
})

// Import 3D background with no SSR and a loading component
const GardenBackground = dynamic(() => import("@/components/garden-background"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 to-black"></div>,
})

export default function Home() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { setUsername: storeUsername } = useGardenStore()

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)

    // Simulate loading time
    const timer = setTimeout(() => {
      try {
        setIsLoading(false)
      } catch (error) {
        console.error("Error during loading:", error)
        // Show a fallback UI in case of error
        setIsLoading(false)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleEnterGarden = () => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to continue",
        variant: "destructive",
      })
      return
    }

    storeUsername(username)
    router.push("/garden")
  }

  // Show nothing during SSR
  if (!isMounted) {
    return <div className="h-screen w-full bg-black"></div>
  }

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* 3D Garden Background */}
      <GardenBackground />

      {/* Overlay gradient for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/70" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <MotionDiv
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 50, damping: 10, delay: 0.3 }}
        >
          <h1 className="mb-2 font-mono text-6xl font-bold tracking-tighter text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] md:text-7xl">
            TRENCH GARDEN
          </h1>
        </MotionDiv>

        <MotionDiv
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 50, damping: 10, delay: 0.5 }}
        >
          <p className="mb-8 max-w-md text-lg text-green-200 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
            Plant and grow your own virtual garden with your Garden Coins
          </p>
        </MotionDiv>

        <MotionDiv
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 50, damping: 10, delay: 0.7 }}
          className="w-full max-w-xs backdrop-blur-sm bg-black/40 p-6 rounded-lg border border-green-500/20 shadow-xl"
        >
          <Label htmlFor="username" className="mb-2 block text-left text-green-400">
            Choose a Username
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="border-green-600 bg-black/50 text-green-200 mb-4"
            maxLength={15}
          />

          <div className="flex flex-col gap-3">
            <Button size="lg" className="bg-green-600 text-lg hover:bg-green-700 w-full" onClick={handleEnterGarden}>
              Enter Garden
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-green-600 text-lg text-green-400 hover:bg-green-900/20 w-full"
              onClick={() => router.push("/connect")}
            >
              Connect Wallet
            </Button>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 50, damping: 10, delay: 0.9 }}
          className="mt-8 text-sm text-green-400/80 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm"
        >
          Hold Garden Coins to unlock rare plants
        </MotionDiv>
      </div>
    </div>
  )
}
