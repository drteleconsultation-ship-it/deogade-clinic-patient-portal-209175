import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';

// PUBLIC_INTERFACE
export default function HeroClinicCard() {
  /** Hero card with clinic intro and quick actions */
  const { actions } = useBooking();
  const location = useLocation();

  const openModal = (e) => {
    if (location.pathname === '/booking') {
      e.preventDefault();
      actions.open();
    }
  };

  return (
    <div className="hero-card" role="region" aria-label="Clinic details">
      <span className="badge" aria-label="Professional theme accent">Ocean Professional</span>
      <h1 className="hero-title">Compassionate Dental Care by Dr. Deogade</h1>
      <p className="hero-subtitle">
        Book online or visit our clinic for reliable, patient-first dental treatments. Easy 10-minute
        consultations with transparent charges.
      </p>

      <div className="hero-cta">
        <Link to="/booking" className="btn btn-primary btn-lg" aria-label="Book a consultation" onClick={openModal}>
          Book Appointment
        </Link>
        <a
          className="btn btn-sm"
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open clinic location in Google Maps"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
        >
          View on Maps
        </a>
      </div>
    </div>
  );
}
