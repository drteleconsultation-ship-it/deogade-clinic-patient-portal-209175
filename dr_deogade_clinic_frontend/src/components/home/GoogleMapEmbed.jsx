import React from 'react';

/**
 * Responsive Google Map iframe embed.
 * Accepts either an embedUrl (full Google Maps embed URL) or a placeQuery to construct a basic embed.
 */

// PUBLIC_INTERFACE
export default function GoogleMapEmbed({
  title = 'Clinic location on Google Maps',
  embedUrl,
  placeQuery = 'Dr Deogade Clinic, Nagpur',
  height = 320,
  rounded = true,
}) {
  /** Responsive wrapper around an iframe map. */
  const url =
    embedUrl ||
    `https://www.google.com/maps?q=${encodeURIComponent(placeQuery)}&output=embed`;

  return (
    <div className="map-embed-wrap" style={{ borderRadius: rounded ? 12 : 0, overflow: 'hidden' }}>
      <iframe
        title={title}
        src={url}
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        aria-label={title}
      />
      <style>{`
        .map-embed-wrap {
          width: 100%;
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }
        .map-embed-wrap iframe {
          display: block;
          width: 100%;
          height: ${height}px;
        }
      `}</style>
    </div>
  );
}
