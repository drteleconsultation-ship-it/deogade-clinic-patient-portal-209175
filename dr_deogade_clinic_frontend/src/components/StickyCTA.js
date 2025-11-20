import React from 'react';

// PUBLIC_INTERFACE
export default function StickyCTA() {
  /** Sticky call-to-action bar for quick access on mobile. */
  return (
    <div
      role="navigation"
      aria-label="quick actions"
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 45,
        background: 'rgba(255,255,255,0.95)',
        borderTop: '1px solid var(--color-border)',
        backdropFilter: 'blur(6px)'
      }}
    >
      <div className="container" style={{ display: 'flex', gap: 10, padding: '10px 0' }}>
        <a className="btn" href="#book" style={{ flex: 1, textAlign: 'center' }}>Book Appointment</a>
        <a className="btn secondary" href="https://wa.me/" target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center' }}>WhatsApp</a>
      </div>
    </div>
  );
}
