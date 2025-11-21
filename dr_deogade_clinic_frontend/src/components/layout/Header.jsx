import React from 'react';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function Header() {
  /** Site header with clinic branding and primary navigation */
  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Dr. Deogade Clinic Home">
          <div className="brand-mark" aria-hidden="true">🩺</div>
          <div className="brand-text">
            <span className="brand-title">Dr. Deogade Clinic</span>
            <span className="brand-subtitle">Dental & Oral Health Care</span>
          </div>
        </Link>

        <nav className="primary-nav" aria-label="Primary Navigation">
          <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="#charges">Charges</a></li>
            <li><a href="#location">Location</a></li>
            <li className="hide-on-mobile"><Link to="/terms">Terms</Link></li>
            <li className="hide-on-mobile"><Link to="/privacy">Privacy</Link></li>
            <li>
              <Link to="/booking" className="btn btn-primary btn-sm" aria-label="Book appointment">
                Book Now
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
