import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

/**
 * Reads booking summary from navigation state to show confirmation info.
 */
function useSuccessData() {
  const location = useLocation();
  const state = location.state || {};
  return {
    patient: state.patient || null,
    slot: state.slot || null,
    amount: state.amount || '200',
    orderId: state.orderId || '',
  };
}

// PUBLIC_INTERFACE
export default function PaymentSuccess() {
  /** Success screen after payment, shows booking summary and next steps. */
  const { patient, slot, amount, orderId } = useSuccessData();

  return (
    <>
      <Header />
      <main className="container" role="main" aria-labelledby="success-title" style={{ padding: '2rem 1rem' }}>
        <h1 id="success-title" style={{ marginTop: 0 }}>Payment Successful</h1>
        <p className="muted">Thank you for your payment. Your booking request has been received.</p>

        <div className="card" style={{ marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>Booking Summary</h3>
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            {patient && (
              <li>
                Patient: <strong>{patient.fullName}</strong> {patient.phone ? <span className="muted">({patient.phone})</span> : null}
              </li>
            )}
            {slot && (
              <li>
                Slot: <strong>{slot.date}</strong> at <strong>{slot.time}</strong>
              </li>
            )}
            <li>Amount paid: <strong>₹{amount}</strong></li>
            {orderId ? <li>Reference: <code>{orderId}</code></li> : null}
          </ul>
          <p className="muted" style={{ marginTop: 10 }}>
            You will receive a confirmation message once the clinic confirms your appointment.
          </p>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary btn-sm" aria-label="Go to home">
            Go to Home
          </Link>
          <Link to="/booking" className="btn btn-sm" aria-label="Book another appointment" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
            Book another appointment
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
