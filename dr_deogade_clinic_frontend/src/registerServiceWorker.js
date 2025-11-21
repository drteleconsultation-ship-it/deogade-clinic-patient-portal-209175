/**
 * Service Worker registration and update flow with toast prompt.
 * This file registers src/service-worker.js and listens for updates to prompt the user.
 */
import { createRoot } from 'react-dom/client';
import React, { useEffect, useState } from 'react';

// Inline lightweight toast just for SW updates in case ToastProvider isn't mounted yet
function SWUpdateToast({ onReload, onDismiss }) {
  return (
    <div style={styles.wrap} role="status" aria-live="polite" aria-atomic="true">
      <div style={styles.card}>
        <span style={{ marginRight: 8 }} aria-hidden="true">🔄</span>
        <div style={{ flex: 1 }}>
          <strong>Update available</strong>
          <div style={{ fontSize: 12, color: '#6B7280' }}>New version is ready. Reload to update.</div>
        </div>
        <button style={styles.btn} onClick={onReload} aria-label="Reload to update">Reload</button>
        <button style={{ ...styles.btn, marginLeft: 6 }} onClick={onDismiss} aria-label="Dismiss">Later</button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: 'fixed',
    right: 16,
    bottom: 16,
    zIndex: 200,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,.1)',
    background: 'white',
    boxShadow: '0 6px 20px rgba(0,0,0,.08)',
    color: '#111827',
  },
  btn: {
    border: '1px solid rgba(0,0,0,.1)',
    background: '#f3f4f6',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    fontWeight: 600,
  }
};

function mountUpdateToast({ onReload }) {
  let container = document.getElementById('sw-update-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'sw-update-root';
    document.body.appendChild(container);
  }
  const root = createRoot(container);
  function unmount() {
    setTimeout(() => {
      try { root.unmount(); } catch {}
      if (container && container.parentNode) container.parentNode.removeChild(container);
    }, 0);
  }
  root.render(<SWUpdateToast onReload={onReload} onDismiss={unmount} />);
}

export function registerServiceWorker() {
  if (process.env.NODE_ENV === 'development') {
    // In dev, CRA uses a dev server; skip SW for clarity
    return;
  }
  if ('serviceWorker' in navigator) {
    const swUrl = '/service-worker.js';

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          // Listen for updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                const isNew = navigator.serviceWorker.controller;
                if (isNew) {
                  // New content available, prompt user
                  mountUpdateToast({
                    onReload: () => {
                      if (registration.waiting) {
                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                      }
                      setTimeout(() => {
                        window.location.reload();
                      }, 200);
                    }
                  });
                }
              }
            };
          };

          // If there's a waiting worker already (e.g., on refresh), prompt
          if (registration.waiting) {
            mountUpdateToast({
              onReload: () => {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                setTimeout(() => window.location.reload(), 200);
              }
            });
          }

          // Listen for controller change (when updated SW takes control)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // We could auto-reload here, but we allow the user to control it via toast
          });
        })
        .catch(() => {
          // Ignore registration errors silently
        });
    });
  }
}

// PUBLIC_INTERFACE
export function unregisterServiceWorker() {
  /** Unregister service worker if needed (for troubleshooting) */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
