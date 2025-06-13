"use client"

import type React from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Button } from "@/components/ui/button"
import { Leaf } from "lucide-react"

interface ThreeErrorBoundaryProps {
  children: React.ReactNode
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="text-center p-8 bg-black/70 rounded-lg border border-green-500/20 max-w-md">
        <Leaf className="h-12 w-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-400 mb-2">3D Garden Unavailable</h3>
        <p className="text-green-200 mb-4">
          We encountered an issue loading the 3D garden. This might be due to browser compatibility or hardware
          limitations.
        </p>
        <div className="text-xs text-green-400/60 bg-black/50 p-2 rounded mb-4 text-left overflow-auto max-h-32">
          <code>{error.message}</code>
        </div>
        <Button onClick={resetErrorBoundary} className="bg-green-600 hover:bg-green-700">
          Try Again
        </Button>
      </div>
    </div>
  )
}

export default function ThreeErrorBoundary({ children }: ThreeErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
        console.log("Error boundary reset")
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
