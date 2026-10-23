import { Component, useState, useEffect } from 'react';
import { Button } from '../components/common';
import { RefreshCw, Home, ArrowLeft, Bug, Copy, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
    
    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState(prev => ({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: prev.retryCount + 1 
    }));
  };

  handleCopyError = () => {
    const errorText = this.state.error?.toString() || 'Unknown error';
    const errorInfoText = this.state.errorInfo?.componentStack || '';
    const fullText = `Error: ${errorText}\n\nStack:\n${errorInfoText}`;
    navigator.clipboard.writeText(fullText);
  };

  render() {
    if (this.state.hasError) {
      const isRetryable = this.state.retryCount < 3;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4" role="alert" aria-live="assertive">
          <div className="w-full max-w-md text-center">
            <div className="mb-6">
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-error)]/10">
                <AlertTriangle className="h-10 w-10 text-[var(--color-error)]" />
                {this.state.retryCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-error)] text-white text-xs font-bold flex items-center justify-center">
                    {this.state.retryCount}
                  </span>
                )}
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Something went wrong
            </h1>
            
            <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
              We apologize for the inconvenience. An unexpected error has occurred while loading this page.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
              {isRetryable && (
                <Button onClick={this.handleRetry} icon={RefreshCw} className="w-full sm:w-auto">
                  Try Again
                </Button>
              )}
              <Button variant="outline" onClick={() => window.location.href = '/'} icon={Home} className="w-full sm:w-auto">
                Go to Home
              </Button>
              <Button variant="ghost" onClick={() => window.history.back()} icon={ArrowLeft} className="w-full sm:w-auto">
                Go Back
              </Button>
            </div>
            
            {this.state.retryCount >= 3 && (
              <div className="p-4 bg-[var(--color-warning)]/10 border border-[var(--color-warning)] rounded-lg mb-4 text-left">
                <div className="flex items-center gap-2 text-sm text-[var(--color-warning)] mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Multiple retries failed</span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  This might be a persistent issue. Please try clearing your browser cache or contact support.
                </p>
              </div>
            )}
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--color-surface-alt)]">
                  <Bug className="h-4 w-4" />
                  Error Details (Development)
                </summary>
                <div className="mt-3 p-4 bg-[var(--color-gray-100)] dark:bg-[var(--color-gray-800)] rounded-lg text-xs overflow-auto max-h-64">
                  <div className="mb-3 font-mono text-[var(--color-error)]">
                    {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="font-mono text-[var(--color-text-secondary)] whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" icon={Copy} onClick={this.handleCopyError}>
                    Copy Error
                  </Button>
                </div>
              </details>
            )}
            
            <p className="mt-6 text-xs text-[var(--color-text-tertiary)]">
              Error ID: <code className="font-mono">{(Date.now()).toString(36)}</code>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to throw errors
export function useErrorHandler() {
  const [error, setError] = useState(null);
  
  const throwError = (err) => {
    setError(err);
    throw err;
  };
  
  const clearError = () => setError(null);
  
  return { error, throwError, clearError };
}

// Higher-order component for wrapping components
export function withErrorBoundary(WrappedComponent, fallbackProps = {}) {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary {...fallbackProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}