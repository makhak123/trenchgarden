"use client"

import { useEffect } from "react"
import ErrorFallback from "@/components/error-fallback"

export default function GardenError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Garden page error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-black">
      <ErrorFallback
        error={error}
        resetError={reset}
        title="Garden Loading Error"
        description="We couldn't load your garden. This might be due to browser compatibility issues."
      />
    </div>
  )
}
