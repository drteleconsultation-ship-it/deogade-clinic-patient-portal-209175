import React from 'react';

// PUBLIC_INTERFACE
export default function Footer() {
  /** Footer with quick info and copyright. */
  return (
    <footer className="footer" role="contentinfo">
      <div className="container" style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#fff' }}>Dr. Deogade Clinic</div>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>Compassionate care with modern facilities</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a className="btn secondary" href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Chat">WhatsApp</a>
            <a className="btn" href="#book">Book Appointment</a>
          </div>
        </div>
        <hr className="hr" />
        <div style={{ fontSize: 12, color: '#9CA3AF' }}>
          © {new Date().getFullYear()} Dr. Deogade Clinic. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
