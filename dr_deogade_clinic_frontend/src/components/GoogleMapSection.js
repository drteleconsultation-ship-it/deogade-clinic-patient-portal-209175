import React from 'react';
import { APP_CONFIG } from '../config';

/**
 * Safely derive configuration for Google Map section.
 * We use iframe embed URLs that do not require API keys by default.
 */
function getMapConfig() {
  const {
    REACT_APP_CLINIC_ADDRESS,
    REACT_APP_GOOGLE_MAPS_EMBED_URL,
    REACT_APP_GOOGLE_PLACE_URL
  } = process.env;

  const clinicAddress = REACT_APP_CLINIC_ADDRESS || 'Dr. Deogade Clinic, India';
  // Safe default: using Google Maps "query" embed which does not need an API key
  const defaultEmbed = `https://www.google.com/maps?q=${encodeURIComponent(clinicAddress)}&output=embed`;
  const embedUrl = REACT_APP_GOOGLE_MAPS_EMBED_URL || defaultEmbed;
  const placeUrl = REACT_APP_GOOGLE_PLACE_URL || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicAddress)}`;

  return { clinicAddress, embedUrl, placeUrl };
}

// PUBLIC_INTERFACE
export default function GoogleMapSection({ title = 'Find Us', subtitle = 'Google Map and directions' }) {
  /** Renders the Google Map section using iframe embed (no API key required) with Ocean Professional styling. */
  const { clinicAddress, embedUrl, placeUrl } = getMapConfig();

  // Feature flag: maps visibility
  const show = APP_CONFIG.featureFlags?.maps !== false;

  if (!show) return null;

  return (
    <section id="map" className="section" style={{ background: 'var(--color-surface)' }}>
      <div className="container">
        <div className="section-header">
          <div className="badge">Location</div>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ width: '100%', aspectRatio: '16/9', background: '#E5E7EB' }}>
            <iframe
              title="Clinic Location Map"
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: 12, flexWrap: 'wrap' }}>
            <div style={{ color: 'var(--color-muted)' }}>
              <strong style={{ color: 'var(--color-text)' }}>Address:</strong> {clinicAddress}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a className="btn secondary" href={placeUrl} target="_blank" rel="noreferrer">Open in Google Maps</a>
              <a
                className="btn"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinicAddress)}`}
                target="_blank" rel="noreferrer"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
