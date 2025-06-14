"use client"

import { useState, useEffect } from "react"
import { Leaf, User, Sprout, Coins, RefreshCw } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PlantInventory from "@/components/plant-inventory"
import UserProfile from "@/components/user-profile"
import { useGardenStore, type PlantType } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

// Import components with no SSR
const LoadingScreen = dynamic(() => import("@/components/loading-screen"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="text-green-400 text-xl">Loading...</div>
    </div>
  ),
})

// Import the 3D garden scene with no SSR
const GardenScene3D = dynamic(() => import("@/components/garden-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="text-green-400 text-xl">Loading 3D Garden...</div>
    </div>
  ),
})

export default function GardenPage() {
  const [selectedPlantType, setSelectedPlantType] = useState<PlantType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { username, coins } = useGardenStore()
  const router = useRouter()

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)

    // Redirect if no username
    if (typeof window !== "undefined" && !username) {
      router.push("/")
      return
    }

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => {
      clearTimeout(timer)
      setIsMounted(false)
    }
  }, [username, router])

  // Handle 3D scene error
  const handleSceneError = (error) => {
    console.error("3D Scene error:", error)
    setLoadError(error)
  }

  // Retry loading the 3D scene
  const handleRetry = () => {
    setLoadError(null)
    setRetryCount((prev) => prev + 1)
  }

  // Show nothing during SSR
  if (!isMounted) {
    return <div className="h-screen w-full bg-black"></div>
  }

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="flex h-screen flex-col bg-black">
      {/* Header */}
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
            {username}
          </Badge>
        </div>
      </header>

      {/* Main content */}
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
                  <h3 className="mb-2 text-xl font-bold text-green-400">3D Garden Error</h3>
                  <p className="mb-4 text-green-200">
                    We encountered an issue loading the 3D garden. Please try refreshing the page.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleRetry}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </div>
              </div>
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
