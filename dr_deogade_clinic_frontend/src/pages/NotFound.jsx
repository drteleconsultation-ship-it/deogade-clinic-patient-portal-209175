import React from 'react';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function NotFound() {
  /** 404 page for unmatched routes */
  return (
    <main className="container" style={{ padding: '4rem 1rem' }} role="main" aria-labelledby="nf-title">
      <h1 id="nf-title" style={{ margin: 0 }}>Page not found</h1>
      <p className="muted">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary btn-sm" aria-label="Go back to home">
        Go Home
      </Link>
    </main>
  );
}
