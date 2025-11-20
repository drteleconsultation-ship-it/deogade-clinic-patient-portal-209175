import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './theme.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Conditionally register service worker for PWA when enabled
if (process.env.REACT_APP_PWA_ENABLED === 'true' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {
      // ignore registration errors silently
    });
  });
}
