"use client"

import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback: React.ComponentType<{ error: Error }> | ((error: Error) => React.ReactNode)
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ThreeErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Three.js error caught:", error, errorInfo)
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props

      if (typeof fallback === "function") {
        return fallback(this.state.error)
      }

      const FallbackComponent = fallback
      return <FallbackComponent error={this.state.error} />
    }

    return this.props.children
  }
}
