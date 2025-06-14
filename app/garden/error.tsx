"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function GardenError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error("Garden error:", error)
    // Automatically redirect to home instead of showing error screen
    router.push("/")
  }, [error, router])

  return null
}
