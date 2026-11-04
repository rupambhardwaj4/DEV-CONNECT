import { Component } from 'react';
import { Button } from '../components/common';
import { STORAGE_KEYS } from '../lib/storage';
import { RefreshCw, Home, Bug, Copy, AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
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
    // Full reload, not an in-place re-render: a data-driven crash re-throws against the
    // same snapshot otherwise. Reloading lets the store re-run its schema/completeness
    // check and re-seed if the persisted payload is the culprit.
    window.location.reload();
  };

  handleReset = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.SNAPSHOT_KEY);
    } catch {
      /* if storage is unreadable the reload will fall back to a fresh seed anyway */
    }
    window.location.href = '/';
  };

  handleCopyError = () => {
    const errorText = this.state.error?.toString() || 'Unknown error';
    const errorInfoText = this.state.errorInfo?.componentStack || '';
    const fullText = `Error: ${errorText}\n\nStack:\n${errorInfoText}`;
    navigator.clipboard.writeText(fullText);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4" role="alert" aria-live="assertive">
          <div className="w-full max-w-md text-center">
            <div className="mb-6">
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-error)]/10">
                <AlertTriangle className="h-10 w-10 text-[var(--color-error)]" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Something went wrong
            </h1>

            <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
              We apologize for the inconvenience. An unexpected error has occurred while loading this page.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
              <Button onClick={this.handleRetry} icon={RefreshCw} className="w-full sm:w-auto">
                Try Again
              </Button>
              <Button variant="outline" onClick={this.handleReset} icon={RotateCcw} className="w-full sm:w-auto">
                Reset workspace
              </Button>
              <Button variant="ghost" onClick={() => window.location.href = '/'} icon={Home} className="w-full sm:w-auto">
                Go to Home
              </Button>
            </div>

            <p className="text-xs text-[var(--color-text-tertiary)] mb-6">
              If the page keeps failing, "Reset workspace" restores it to its original content.
            </p>
            
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