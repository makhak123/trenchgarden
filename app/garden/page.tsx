"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Leaf, User, Sprout, Coins } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import PlantInventory from "@/components/plant-inventory"
import UserProfile from "@/components/user-profile"
import KeyboardControlsGuide from "@/components/keyboard-controls-guide"
import { useGardenStore, type PlantType } from "@/lib/store"
import { useRouter } from "next/navigation"
import { ErrorBoundary } from "react-error-boundary"

// Import components with no SSR
const LoadingScreen = dynamic(() => import("@/components/loading-screen"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="text-green-400 text-xl">Loading...</div>
    </div>
  ),
})

// Import basic garden scene as fallback - load this first to ensure we have a fallback
const GardenSceneBasic = dynamic(() => import("@/components/garden-scene-basic"), {
  ssr: false,
})

// Import enhanced garden scene with no SSR - load this after the basic scene
const GardenSceneEnhanced = dynamic(() => import("@/components/garden-scene-enhanced"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="text-green-400 text-xl">Loading 3D Garden...</div>
    </div>
  ),
})

function ErrorFallback({ error }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="text-center p-8 bg-black/70 rounded-lg border border-green-500/20 max-w-md">
        <h3 className="text-xl font-bold text-green-400 mb-2">3D Garden Unavailable</h3>
        <p className="text-green-200 mb-4">
          We encountered an issue loading the 3D garden. Using simplified mode for better compatibility.
        </p>
        <div className="text-xs text-green-400/60 bg-black/50 p-2 rounded mb-4 text-left overflow-auto max-h-32">
          <code>{error.message || "Error loading 3D garden"}</code>
        </div>
      </div>
    </div>
  )
}

export default function GardenPage() {
  const [selectedPlantType, setSelectedPlantType] = useState<PlantType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [useSimplifiedScene, setUseSimplifiedScene] = useState(false)
  const [hasError, setHasError] = useState(false)
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
    }, 2000)

    return () => clearTimeout(timer)
  }, [username, router])

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
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onError={(error) => {
                console.error("Garden scene error:", error)
                setUseSimplifiedScene(true)
                setHasError(true)
              }}
              resetKeys={[useSimplifiedScene]}
            >
              {useSimplifiedScene || hasError ? (
                <GardenSceneBasic selectedPlantType={selectedPlantType} />
              ) : (
                <GardenSceneEnhanced
                  selectedPlantType={selectedPlantType}
                  onSelectPlant={setSelectedPlantType}
                  onError={() => {
                    setUseSimplifiedScene(true)
                    setHasError(true)
                  }}
                />
              )}
            </ErrorBoundary>
            <KeyboardControlsGuide />
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
