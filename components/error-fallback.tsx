"use client"

import { Button } from "@/components/ui/button"
import { Leaf, RefreshCw } from "lucide-react"

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  description?: string
}

export default function ErrorFallback({
  error,
  resetError,
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again.",
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-6">
        <Leaf className="mx-auto h-12 w-12 text-green-400" />
      </div>

      <h2 className="mb-2 text-xl font-bold text-green-400">{title}</h2>

      <p className="mb-6 text-green-200 max-w-md">{description}</p>

      {resetError && (
        <Button onClick={resetError} className="bg-green-600 hover:bg-green-700">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}

      {process.env.NODE_ENV === "development" && error && (
        <details className="mt-6 text-left max-w-md">
          <summary className="cursor-pointer text-sm text-green-400">Error Details</summary>
          <pre className="mt-2 overflow-auto rounded bg-gray-900 p-2 text-xs text-red-400">
            {error.message}
            {error.stack && "\n\n" + error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}
