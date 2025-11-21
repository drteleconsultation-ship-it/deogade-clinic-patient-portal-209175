import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CTAStickyBar from '../components/common/CTAStickyBar';
import HeroClinicCard from '../components/home/HeroClinicCard';
import ServiceCharges from '../components/home/ServiceCharges';
import GoogleMapEmbed from '../components/home/GoogleMapEmbed';
import GoogleReviews from '../components/home/GoogleReviews';
import { getEnv } from '../config/env';

// PUBLIC_INTERFACE
export default function Home() {
  /** Home page with hero, services/charges, Google Map and Reviews sections */
  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      <Header />
      <main id="main">
        <section className="hero">
          <div className="container hero-grid">
            <HeroClinicCard />
            <div className="info-card" role="note" aria-label="Clinic information">
              <p><strong>Timings:</strong> Mon–Sat, 10:00 AM – 7:00 PM</p>
              <p><strong>Consultations:</strong> In-clinic and Online (10-minute slots)</p>
              <p className="badge" aria-label="Hygiene ensured">Sterilized instruments</p>
            </div>
          </div>
        </section>

        <section id="services" className="section">
          <div className="container">
            <h2 className="section-title">Our Services</h2>
            <div className="grid grid-3">
              <div className="card">
                <h3>General Dentistry</h3>
                <p className="muted">Routine check-ups, cleanings, fillings, and preventive care.</p>
              </div>
              <div className="card">
                <h3>Cosmetic Dentistry</h3>
                <p className="muted">Teeth whitening, veneers, and smile enhancement.</p>
              </div>
              <div className="card">
                <h3>Orthodontics</h3>
                <p className="muted">Teeth alignment options for teens and adults.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="charges" className="section">
          <div className="container">
            <ServiceCharges />
          </div>
        </section>

        <section id="location" className="section">
          <div className="container">
            <h2 className="section-title">Location</h2>
            <GoogleMapEmbed placeQuery="Dr Deogade Clinic, Nagpur" />
            <div style={{ marginTop: 8 }}>
              <a
                className="btn btn-sm"
                href="https://www.google.com/maps/search/?api=1&query=Dr%20Deogade%20Clinic%2C%20Nagpur"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open location in Google Maps"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </section>

        {getEnv().flags?.enableReviews !== false && (
          <section id="reviews" className="section">
            <div className="container">
              <GoogleReviews />
            </div>
          </section>
        )}
      </main>
      <Footer />
      <CTAStickyBar />
    </>
  );
}
