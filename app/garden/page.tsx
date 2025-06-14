"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useGardenStore } from "@/lib/store"
import LoadingScreen from "@/components/loading-screen"
import GardenSceneSafe from "@/components/garden-scene-safe"
import { CustomErrorBoundary } from "@/components/custom-error-boundary"

export default function GardenPage() {
  const router = useRouter()
  const { username } = useGardenStore()
  const [selectedPlantType, setSelectedPlantType] = useState(null)
  const [showLoading, setShowLoading] = useState(true)
  const [gardenError, setGardenError] = useState(null)

  useEffect(() => {
    if (!username) {
      router.push("/")
    }
  }, [username, router])

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

  if (!username) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 text-xl">Redirecting...</div>
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
