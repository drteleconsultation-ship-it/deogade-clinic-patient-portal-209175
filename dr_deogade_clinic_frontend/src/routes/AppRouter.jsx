import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import Booking from '../pages/Booking';

const Success = () => (
  <main className="container" role="main" aria-labelledby="success-title" style={{ padding: '3rem 1rem' }}>
    <h1 id="success-title">Success</h1>
    <p>Your booking/payment was successful.</p>
  </main>
);

const Terms = () => (
  <main className="container" role="main" aria-labelledby="terms-title" style={{ padding: '3rem 1rem' }}>
    <h1 id="terms-title">Terms & Conditions</h1>
    <p>Clinic terms and conditions will be listed here.</p>
  </main>
);

const Privacy = () => (
  <main className="container" role="main" aria-labelledby="privacy-title" style={{ padding: '3rem 1rem' }}>
    <h1 id="privacy-title">Privacy Policy</h1>
    <p>Clinic privacy policy will be listed here.</p>
  </main>
);

// PUBLIC_INTERFACE
export default function AppRouter() {
  /** Router for the application */
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/success" element={<Success />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
