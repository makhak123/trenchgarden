"use client"

import { Button } from "@/components/ui/button"
import { Leaf, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-black text-green-400">
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <Leaf className="mx-auto h-16 w-16 text-green-400" />
            </div>

            <h1 className="mb-4 text-2xl font-bold">Something went wrong!</h1>

            <p className="mb-6 text-green-200">We encountered an unexpected error. Please try refreshing the page.</p>

            <Button onClick={reset} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
