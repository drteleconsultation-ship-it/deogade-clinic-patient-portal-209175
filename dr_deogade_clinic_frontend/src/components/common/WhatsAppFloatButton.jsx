import React from 'react';

/**
 * WhatsApp floating action button with prefilled message using wa.me deep link.
 * Environment: optionally uses REACT_APP_FRONTEND_URL as site origin.
 */

// PUBLIC_INTERFACE
export default function WhatsAppFloatButton({
  phone = '919999999999',
  message = 'Hello Dr. Deogade, I would like to book an appointment.',
  label = 'Chat on WhatsApp',
}) {
  /** Renders a floating WhatsApp button in bottom-right corner. */
  const origin =
    (typeof window !== 'undefined' && (process.env.REACT_APP_FRONTEND_URL || window.location.origin)) ||
    '';
  const text = `${message} ${origin ? `- via ${origin}` : ''}`.trim();
  const href = `https://wa.me/${encodeURIComponent(phone)}?text=${encodeURIComponent(text)}`;

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="wa-fab"
      >
        <span className="wa-icon" aria-hidden="true">💬</span>
        <span className="wa-label">{label}</span>
      </a>
      <style>{`
        .wa-fab {
          position: fixed;
          right: 16px;
          bottom: 16px;
          z-index: 70;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #25D366;
          color: #fff;
          text-decoration: none;
          border-radius: 999px;
          padding: 10px 14px;
          border: 1px solid rgba(0,0,0,.08);
          box-shadow: 0 10px 30px rgba(0,0,0,.18);
          font-weight: 700;
          transition: transform .15s ease, box-shadow .15s ease, opacity .2s ease;
        }
        .wa-fab:hover { transform: translateY(-1px); box-shadow: 0 12px 34px rgba(0,0,0,.22); }
        .wa-fab:active { transform: translateY(0); }
        .wa-icon { font-size: 18px; line-height: 1; }
        .wa-label { font-size: 14px; }
        @media (max-width: 520px) {
          .wa-label { display: none; }
          .wa-fab { padding: 12px; border-radius: 999px; }
        }
        [data-theme="dark"] .wa-fab {
          border-color: rgba(255,255,255,.08);
        }
      `}</style>
    </>
  );
}
