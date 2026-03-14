'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, info)
  }

  handleReset = (): void => {
    window.location.reload()
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-4 text-center">
          <div className="text-4xl">⚠</div>
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          {this.state.error?.message && (
            <p className="text-sm text-muted-foreground max-w-sm">{this.state.error.message}</p>
          )}
          <div className="flex gap-3">
            <Button onClick={this.handleReset}>Try Again</Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              Go Home
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
