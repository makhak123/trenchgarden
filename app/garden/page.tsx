"use client"

import { useState, useEffect } from "react"
import { Leaf, User, Sprout, Coins, RefreshCw } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PlantInventory from "@/components/plant-inventory"
import UserProfile from "@/components/user-profile"
import { useGardenStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

// Enhanced dynamic imports with better error handling for production
const LoadingScreen = dynamic(() => import("@/components/loading-screen"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="text-center">
        <Leaf className="mx-auto mb-4 h-12 w-12 text-green-400 animate-pulse" />
        <div className="text-green-400 text-xl">Loading...</div>
      </div>
    </div>
  ),
})

// Enhanced 3D garden scene import with better error handling
const GardenScene3D = dynamic(() => import("@/components/garden-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="text-center">
        <Leaf className="mx-auto mb-4 h-12 w-12 text-green-400 animate-pulse" />
        <div className="text-green-400 text-xl">Loading 3D Garden...</div>
      </div>
    </div>
  ),
})

// Fallback 2D garden scene
const GardenScene2D = dynamic(() => import("@/components/garden-scene-simplified"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="text-center">
        <Leaf className="mx-auto mb-4 h-12 w-12 text-green-400 animate-pulse" />
        <div className="text-green-400 text-xl">Loading 2D Garden...</div>
      </div>
    </div>
  ),
})

export default function GardenPage() {
  const [selectedPlantType, setSelectedPlantType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [use2D, setUse2D] = useState(false)
  const { username, coins } = useGardenStore()
  const router = useRouter()

  // Enhanced client-side mounting with better error handling
  useEffect(() => {
    try {
      setIsMounted(true)

      // Enhanced username check
      if (typeof window !== "undefined" && !username) {
        console.warn("No username found, redirecting to home")
        router.push("/")
        return
      }

      // Enhanced loading with error handling
      const timer = setTimeout(() => {
        try {
          setIsLoading(false)
        } catch (error) {
          console.error("Error during loading completion:", error)
          setLoadError(error as Error)
          setIsLoading(false)
        }
      }, 1500)

      return () => {
        clearTimeout(timer)
        setIsMounted(false)
      }
    } catch (error) {
      console.error("Garden page mounting error:", error)
      setLoadError(error as Error)
      setIsLoading(false)
    }
  }, [username, router])

  // Enhanced 3D scene error handler with fallback to 2D
  const handleSceneError = (error: Error) => {
    console.error("3D Scene error:", error)

    // Check if it's a WebGL context error
    if (error.message.includes("WebGL") || error.message.includes("context")) {
      console.log("WebGL error detected, falling back to 2D mode")
      setUse2D(true)
      setLoadError(null)
    } else {
      setLoadError(error)
    }
  }

  // Enhanced retry handler
  const handleRetry = () => {
    try {
      setLoadError(null)
      setUse2D(false) // Try 3D again
      setRetryCount((prev) => prev + 1)
      setIsLoading(true)

      // Reset after a short delay
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error during retry:", error)
      setLoadError(error as Error)
    }
  }

  // Switch to 2D mode
  const handleSwitch2D = () => {
    setUse2D(true)
    setLoadError(null)
  }

  // Enhanced SSR handling
  if (!isMounted) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <Leaf className="mx-auto mb-4 h-12 w-12 text-green-400" />
          <div className="text-green-400">Loading Garden...</div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="flex h-screen flex-col bg-black">
      {/* Enhanced Header */}
      <header className="flex items-center justify-between border-b border-green-900/30 bg-black/80 px-4 py-3 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-400" />
          <span className="font-mono text-xl font-bold text-green-400">TRENCH GARDEN</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-600 bg-green-900/20 text-green-400">
            <Coins className="mr-1 h-4 w-4" />
            {coins} Coins
          </Badge>
          <Badge variant="outline" className="border-green-600 bg-green-900/20 text-green-400">
            {username || "Anonymous"}
          </Badge>
          {use2D && (
            <Badge variant="outline" className="border-blue-600 bg-blue-900/20 text-blue-400">
              2D Mode
            </Badge>
          )}
        </div>
      </header>

      {/* Enhanced Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Tabs defaultValue="garden" className="flex h-full flex-col">
          <TabsList className="mx-auto mb-2 mt-2 bg-green-900/20">
            <TabsTrigger value="garden" className="data-[state=active]:bg-green-700">
              <Leaf className="mr-2 h-4 w-4" />
              Garden
            </TabsTrigger>
            <TabsTrigger value="plants" className="data-[state=active]:bg-green-700">
              <Sprout className="mr-2 h-4 w-4" />
              Plants
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-green-700">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="garden" className="flex-1 overflow-hidden data-[state=active]:flex-1 relative">
            {loadError ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 p-4">
                <div className="max-w-md rounded-lg border border-green-500/20 bg-black/70 p-8 text-center">
                  <Leaf className="mx-auto mb-4 h-12 w-12 text-green-400" />
                  <h3 className="mb-2 text-xl font-bold text-green-400">Garden Loading Error</h3>
                  <p className="mb-4 text-green-200">
                    We encountered an issue loading your garden. This might be due to browser compatibility or WebGL
                    issues.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleRetry}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try 3D Again
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                      onClick={handleSwitch2D}
                    >
                      Use 2D Mode
                    </Button>
                    <Button
                      variant="outline"
                      className="border-green-600 text-green-400 hover:bg-green-900/20"
                      onClick={() => window.location.reload()}
                    >
                      Refresh Page
                    </Button>
                  </div>
                  {process.env.NODE_ENV === "development" && (
                    <details className="mt-4 text-left">
                      <summary className="cursor-pointer text-sm text-green-400">Error Details</summary>
                      <pre className="mt-2 overflow-auto rounded bg-gray-900 p-2 text-xs text-red-400">
                        {loadError.message}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ) : use2D ? (
              <GardenScene2D
                key={`garden-scene-2d-${retryCount}`}
                selectedPlantType={selectedPlantType}
                onSelectPlant={setSelectedPlantType}
              />
            ) : (
              <GardenScene3D
                key={`garden-scene-3d-${retryCount}`}
                selectedPlantType={selectedPlantType}
                onError={handleSceneError}
                onSelectPlant={setSelectedPlantType}
              />
            )}
          </TabsContent>

          <TabsContent value="plants" className="data-[state=active]:flex-1">
            <PlantInventory onSelectPlant={setSelectedPlantType} selectedPlant={selectedPlantType} />
          </TabsContent>

          <TabsContent value="profile" className="data-[state=active]:flex-1">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
