// Error handler utility to catch and handle runtime errors
export function handleRuntimeError(error: any, info?: string): void {
  console.error(`Runtime error${info ? ` in ${info}` : ""}:`, error)

  // Prevent unchecked runtime.lastError messages
  if (error && error.message && error.message.includes("runtime.lastError")) {
    // These errors often happen when components unmount during async operations
    // We can safely ignore them in most cases
    console.warn("Handled runtime.lastError:", error.message)
    return
  }

  // For other errors, we might want to report them to an error tracking service
  // or display a user-friendly error message
}

// Helper to safely execute async operations that might be interrupted
export async function safeAsync<T>(promise: Promise<T>, onError?: (error: any) => void): Promise<T | null> {
  try {
    return await promise
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.includes("runtime.lastError")
    ) {
      console.warn("Async operation interrupted:", error.message)
      return null
    }

    handleRuntimeError(error)
    if (onError) onError(error)
    return null
  }
}
