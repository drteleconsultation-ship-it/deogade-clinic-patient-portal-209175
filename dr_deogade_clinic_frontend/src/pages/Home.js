import React from 'react';
import BookingCard from '../components/BookingCard';
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton';
import { navigateToPayment } from '../services/apiClient';

// PUBLIC_INTERFACE
export default function Home() {
  /** Home page with hero, booking card, services, map/reviews placeholders. */
  const handleBook = (payload) => {
    // Placeholder: integrate payment/flow in future steps
    navigateToPayment(payload);
  };

  return (
    <>
      <section className="section" style={{ background: 'linear-gradient(180deg, rgba(37,99,235,0.06), rgba(249,250,251,1))' }}>
        <div className="container" style={{ display: 'grid', gap: 20, gridTemplateColumns: '1.2fr 1fr', alignItems: 'center' }}>
          <div>
            <div className="badge">Ocean Professional Care</div>
            <h1 style={{ fontSize: 36, margin: '10px 0' }}>Comprehensive Care at Dr. Deogade Clinic</h1>
            <p style={{ color: 'var(--color-muted)', marginBottom: 16 }}>
              Book online or visit in-clinic. Quick 10-minute slots, secure payments, and seamless experience.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a className="btn" href="#book">Book Appointment</a>
              <a className="btn secondary" href="#map">See Location</a>
            </div>
          </div>
          <div>
            <BookingCard onBook={handleBook} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Services & Charges</h2>
            <p className="section-subtitle">Transparent pricing and quality care</p>
          </div>
          <div className="grid-2">
            <div className="card" style={{ padding: 20 }}>
              <h3>Online Consultation</h3>
              <p style={{ color: 'var(--color-muted)' }}>Video call based consultation with prescription.</p>
              <div className="hr" />
              <strong>Starting ₹499</strong>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h3>In-Clinic Visit</h3>
              <p style={{ color: 'var(--color-muted)' }}>Visit the clinic with priority scheduling.</p>
              <div className="hr" />
              <strong>Starting ₹399</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="map" className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Find Us</h2>
            <p className="section-subtitle">Google Map and directions</p>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
              Map placeholder
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Reviews</h2>
            <p className="section-subtitle">What our patients say</p>
          </div>
          <div className="grid-2">
            <div className="card" style={{ padding: 20 }}>
              <p>"Excellent care and very professional!"</p>
              <div className="hr" />
              <small>- Verified Patient</small>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <p>"Quick booking and friendly staff."</p>
              <div className="hr" />
              <small>- Verified Patient</small>
            </div>
          </div>
        </div>
      </section>
      <WhatsAppFloatingButton />
    </>
  );
}
