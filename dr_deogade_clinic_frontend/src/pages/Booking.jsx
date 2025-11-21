import React, { useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BookingStepperModal from '../components/booking/BookingStepperModal';
import { useBooking } from '../context/BookingContext';

// PUBLIC_INTERFACE
export default function Booking() {
  /**
   * Page that immediately opens the booking modal. Keeps page content minimal
   * for accessibility and deep-linking to /booking.
   */
  const { actions } = useBooking();

  useEffect(() => {
    actions.open();
  }, [actions]);

  return (
    <>
      <Header />
      <main className="container" role="main" aria-labelledby="booking-page-title" style={{ padding: '2rem 0' }}>
        <h1 id="booking-page-title" className="sr-only">Booking</h1>
        <p className="muted">Use the modal to complete your booking.</p>
      </main>
      <Footer />
      <BookingStepperModal />
    </>
  );
}
