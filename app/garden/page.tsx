"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Leaf } from "lucide-react"

// Completely disable SSR for all garden components
const LoadingScreen = dynamic(() => import("@/components/loading-screen"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Leaf className="mx-auto mb-4 h-12 w-12 text-green-400 animate-pulse" />
        <div className="text-green-400 text-xl">Loading Garden...</div>
      </div>
    </div>
  ),
})

const GardenSceneSafe = dynamic(() => import("@/components/garden-scene-safe"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Leaf className="mx-auto mb-4 h-12 w-12 text-green-400 animate-pulse" />
        <div className="text-green-400 text-xl">Loading 3D Garden...</div>
      </div>
    </div>
  ),
})

const CustomErrorBoundary = dynamic(
  () => import("@/components/custom-error-boundary").then((mod) => ({ default: mod.CustomErrorBoundary })),
  {
    ssr: false,
    loading: () => <div className="min-h-screen bg-black"></div>,
  },
)

export default function GardenPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [selectedPlantType, setSelectedPlantType] = useState(null)
  const [showLoading, setShowLoading] = useState(true)
  const [gardenError, setGardenError] = useState(null)
  const [username, setUsername] = useState(null)
  const router = useRouter()

  // Only run on client
  useEffect(() => {
    setIsMounted(true)

    // Safe store access only on client
    if (typeof window !== "undefined") {
      try {
        // Import store dynamically to avoid SSR issues
        import("@/lib/store")
          .then(({ useGardenStore }) => {
            const store = useGardenStore.getState()
            const currentUsername = store?.username

            if (!currentUsername) {
              router.push("/")
            } else {
              setUsername(currentUsername)
            }
          })
          .catch((error) => {
            console.error("Error loading store:", error)
            router.push("/")
          })
      } catch (error) {
        console.error("Error accessing store:", error)
        router.push("/")
      }
    }
  }, [router])

  const handleLoadingComplete = () => {
    setShowLoading(false)
  }

  const handleGardenError = (error) => {
    console.error("Garden error:", error)
    setGardenError(error)
  }

  const handleSelectPlant = (plantType) => {
    setSelectedPlantType(plantType)
  }

  // Don't render anything on server
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Leaf className="mx-auto mb-4 h-12 w-12 text-green-400 animate-pulse" />
          <div className="text-green-400 text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  // Show loading while checking username
  if (!username) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 text-xl">Checking access...</div>
      </div>
    )
  }

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  if (gardenError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-8 bg-black/70 rounded-lg border border-green-500/20 max-w-md">
          <h3 className="text-xl font-bold text-green-400 mb-2">Garden Error</h3>
          <p className="text-green-200 mb-4">There was an error loading your garden.</p>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-black">
      <CustomErrorBoundary
        fallback={({ error, reset }) => (
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center p-8 bg-black/70 rounded-lg border border-green-500/20 max-w-md">
              <h3 className="text-xl font-bold text-green-400 mb-2">Garden Error</h3>
              <p className="text-green-200 mb-4">Something went wrong with your garden.</p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2" onClick={reset}>
                Try Again
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => router.push("/")}
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      >
        <GardenSceneSafe
          selectedPlantType={selectedPlantType}
          onError={handleGardenError}
          onSelectPlant={handleSelectPlant}
        />
      </CustomErrorBoundary>
    </div>
  )
}
