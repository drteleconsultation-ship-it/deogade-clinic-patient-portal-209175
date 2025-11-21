import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { registerServiceWorker } from './registerServiceWorker';
import { getEnv } from './config/env';
import logger from './utils/logger';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Boot diagnostics
const env = getEnv();
const log = logger.createLogger('boot');
log.info('starting app', { nodeEnv: env.nodeEnv, apiBase: env.apiBase || '(none)', flags: env.flags, logLevel: env.logLevel });

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker for PWA support
registerServiceWorker();
