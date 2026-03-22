import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Optional fallback UI when a child throws during render */
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message?: string
}

/**
 * Error boundaries must be class components (there is no hook equivalent yet).
 * Catches render errors in the subtree and prevents the whole app from unmounting.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="error-boundary" role="alert">
            <p>Something went wrong in this section.</p>
            <p className="error-boundary__detail">{this.state.message}</p>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => this.setState({ hasError: false, message: undefined })}
            >
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
