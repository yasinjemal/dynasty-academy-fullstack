'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center">
                <span className="text-4xl mb-2 block">⚠️</span>
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                We encountered an unexpected error. Please try again.
              </p>
              {this.state.error && (
                <details className="text-xs text-left bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <summary className="cursor-pointer font-semibold">Error Details</summary>
                  <pre className="mt-2 overflow-auto">{this.state.error.message}</pre>
                </details>
              )}
              <div className="flex gap-2 justify-center">
                <Button onClick={() => this.setState({ hasError: false })}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
