import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';

// PUBLIC_INTERFACE
export default function CTAStickyBar() {
  /** Sticky CTA bar that stays at the bottom for quick booking access */
  const { actions } = useBooking();
  const location = useLocation();

  const openModal = (e) => {
    // If we are already on /booking we can just open modal, else navigate.
    if (location.pathname === '/booking') {
      e.preventDefault();
      actions.open();
    }
  };

  return (
    <div className="cta-sticky" role="region" aria-label="Quick booking">
      <div className="container cta-sticky-inner">
        <div className="cta-text">
          <strong>Need an appointment?</strong>
          <span className="muted">Book a 10-minute consultation</span>
        </div>
        <Link to="/booking" className="btn btn-primary btn-lg" aria-label="Open booking page" onClick={openModal}>
          Book Now
        </Link>
      </div>
    </div>
  );
}
