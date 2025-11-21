import React from 'react';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function CTAStickyBar() {
  /** Sticky CTA bar that stays at the bottom for quick booking access */
  return (
    <div className="cta-sticky" role="region" aria-label="Quick booking">
      <div className="container cta-sticky-inner">
        <div className="cta-text">
          <strong>Need an appointment?</strong>
          <span className="muted">Book a 10-minute consultation</span>
        </div>
        <Link to="/booking" className="btn btn-primary btn-lg" aria-label="Open booking page">
          Book Now
        </Link>
      </div>
    </div>
  );
}
