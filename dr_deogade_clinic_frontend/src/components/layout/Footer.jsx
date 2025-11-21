import React from 'react';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function Footer() {
  /** Site footer with contact, quick links, and legal */
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-grid">
        <section aria-labelledby="footer-about">
          <h3 id="footer-about" className="footer-heading">About</h3>
          <p className="muted">
            Dr. Deogade Clinic — compassionate dental care with modern facilities.
            Book online for in-clinic or virtual consultations.
          </p>
          <a
            className="whatsapp-link"
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
          >
            💬 WhatsApp
          </a>
        </section>

        <section aria-labelledby="footer-links">
          <h3 id="footer-links" className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#services">Services</a></li>
            <li><a href="#charges">Charges</a></li>
            <li><a href="#location">Location</a></li>
            <li><Link to="/booking">Book Appointment</Link></li>
          </ul>
        </section>

        <section aria-labelledby="footer-legal">
          <h3 id="footer-legal" className="footer-heading">Legal</h3>
          <ul className="footer-links">
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </section>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="muted">© {year} Dr. Deogade Clinic. All rights reserved.</p>
          <p className="muted">Made with care for patients.</p>
        </div>
      </div>
    </footer>
  );
}
