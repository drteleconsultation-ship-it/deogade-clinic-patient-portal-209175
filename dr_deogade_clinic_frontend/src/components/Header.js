import React from 'react';
import StickyCTA from './StickyCTA';

// PUBLIC_INTERFACE
export default function Header() {
  /** Header with clinic name, doctor details, and nav anchors. */
  return (
    <header className="navbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div className="badge" aria-label="Clinic">
            <span>Dr. Deogade Clinic</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#0F172A' }}>General & Dental Care</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Consultation • Care • Compassion</div>
          </div>
        </a>
        <nav aria-label="primary">
          <a style={{ marginRight: 16 }} href="#book">Book</a>
          <a style={{ marginRight: 16 }} href="#map">Location</a>
          <a href="#reviews">Reviews</a>
        </nav>
      </div>
      <StickyCTA />
    </header>
  );
}
