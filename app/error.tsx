"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Leaf, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Leaf className="mx-auto h-16 w-16 text-green-400" />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-green-400">Oops! Something went wrong</h1>

        <p className="mb-6 text-green-200">Don't worry, this happens sometimes. Let's get you back to your garden.</p>

        <div className="space-y-3">
          <Button onClick={reset} className="w-full bg-green-600 hover:bg-green-700">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="w-full border-green-600 text-green-400 hover:bg-green-900/20"
          >
            Go Home
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-green-400">Error Details (Development)</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-900 p-2 text-xs text-red-400">{error.message}</pre>
          </details>
        )}
      </div>
    </div>
  )
}
