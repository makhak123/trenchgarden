"use client"

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  description?: string
}

export default function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  // Just try to reset automatically instead of showing UI
  if (resetError) {
    setTimeout(resetError, 100)
  }

  return null
}
