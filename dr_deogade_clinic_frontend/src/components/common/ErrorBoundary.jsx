import React from 'react';
import logger from '../../utils/logger';

/**
 * Accessible Error Boundary with fallback UI and reset option.
 * Catches errors in child components and displays a friendly message.
 */

// PUBLIC_INTERFACE
export default class ErrorBoundary extends React.Component {
  /** ErrorBoundary wraps child components and renders a fallback on error. */
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
    this.handleReport = this.handleReport.bind(this);
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You could send this to an error reporting service
    const log = logger.createLogger('ErrorBoundary');
    log.error('Caught error', error, info);
    if (typeof this.props.onError === 'function') {
      try { this.props.onError(error, info); } catch {
        // ignore
      }
    }
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onReset === 'function') {
      try { this.props.onReset(); } catch {
        // ignore
      }
    }
  }

  handleReport() {
    const { error } = this.state;
    const body = [
      'Issue report for Dr. Deogade Clinic frontend',
      '',
      `Error: ${error?.message || String(error)}`,
      `Stack: ${error?.stack || 'N/A'}`,
      `URL: ${typeof window !== 'undefined' ? window.location.href : ''}`,
      `UserAgent: ${typeof navigator !== 'undefined' ? navigator.userAgent : ''}`,
      `Time: ${new Date().toISOString()}`,
    ].join('\n');
    const mailto = `mailto:clinic@example.com?subject=${encodeURIComponent('Website issue report')}&body=${encodeURIComponent(body)}`;
    try {
      window.location.href = mailto;
    } catch {
      // ignore
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="container"
        style={{ padding: '2rem 1rem' }}
      >
        <div className="card" style={{ borderColor: 'var(--color-error)' }}>
          <h1 style={{ marginTop: 0 }}>Something went wrong</h1>
          <p className="muted">
            The page encountered an unexpected error. You can try reloading this section or report the issue.
          </p>
          {this.state.error?.message ? (
            <pre
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                padding: 12,
                borderRadius: 8,
                overflowX: 'auto',
                fontSize: 12,
              }}
              aria-label="Error details"
            >
              {this.state.error.message}
            </pre>
          ) : null}
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={this.handleReset} aria-label="Try again">
              Try again
            </button>
            <button
              className="btn btn-sm"
              onClick={this.handleReport}
              aria-label="Report this issue"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              Report issue
            </button>
          </div>
        </div>
      </main>
    );
  }
}
