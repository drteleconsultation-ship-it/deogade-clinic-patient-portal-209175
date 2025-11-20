import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

function Success() {
  return (
    <main className="container section">
      <div className="card" style={{ padding: 24 }}>
        <h1 className="section-title" role="status">Booking Confirmed</h1>
        <p className="section-subtitle">Thank you! Your appointment is confirmed. A confirmation email will be sent shortly.</p>
        <div className="hr" />
        <a className="btn" href="/">Back to Home</a>
      </div>
    </main>
  );
}

function Failure() {
  return (
    <main className="container section">
      <div className="card" style={{ padding: 24 }}>
        <h1 className="section-title" role="status">Payment/Booking Failed</h1>
        <p className="section-subtitle">Something went wrong. Please try again or contact support via WhatsApp.</p>
        <div className="hr" />
        <a className="btn" href="/">Back to Home</a>
      </div>
    </main>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root application rendering the layout, header, footer, and routes.
   * Routes:
   * - /           -> Home
   * - /success    -> Success placeholder
   * - /failure    -> Failure placeholder
   */
  return (
    <BrowserRouter>
      <div className="App" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/success" element={<Success />} />
          <Route path="/failure" element={<Failure />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
