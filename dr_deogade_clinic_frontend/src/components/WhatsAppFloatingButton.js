import React from 'react';
import { getWhatsAppLink } from '../services/apiClient';

// PUBLIC_INTERFACE
export default function WhatsAppFloatingButton() {
  /** Floating WhatsApp quick chat button. */
  const href = getWhatsAppLink();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 84,
        zIndex: 50,
        background: '#25D366',
        color: '#fff',
        borderRadius: 999,
        padding: '14px 18px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        fontWeight: 700
      }}
    >
      WhatsApp
    </a>
  );
}
