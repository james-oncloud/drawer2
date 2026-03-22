import { Component } from 'react'

/**
 * Error boundaries must be class components.
 * ES6 class + static getDerivedStateFromError.
 */
export class ErrorBoundary extends Component {
  state = { hasError: false, message: undefined }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
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
