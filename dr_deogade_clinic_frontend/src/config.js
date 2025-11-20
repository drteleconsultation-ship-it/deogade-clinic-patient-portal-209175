const {
  REACT_APP_API_BASE,
  REACT_APP_BACKEND_URL,
  REACT_APP_FRONTEND_URL,
  REACT_APP_WS_URL,
  REACT_APP_NODE_ENV,
  REACT_APP_ENABLE_SOURCE_MAPS,
  REACT_APP_PORT,
  REACT_APP_TRUST_PROXY,
  REACT_APP_LOG_LEVEL,
  REACT_APP_HEALTHCHECK_PATH,
  REACT_APP_FEATURE_FLAGS,
  REACT_APP_EXPERIMENTS_ENABLED,
  REACT_APP_WHATSAPP_PHONE
} = process.env;

const parseJSON = (v, fallback = {}) => {
  try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};

 // PUBLIC_INTERFACE
export const APP_CONFIG = {
  /** Centralized app config sourced from env.
   * Feature flags can control visibility for sections like:
   * { "maps": true, "reviews": true }
   * Other relevant envs (read directly where needed):
   * - REACT_APP_CLINIC_ADDRESS
   * - REACT_APP_GOOGLE_MAPS_EMBED_URL
   * - REACT_APP_GOOGLE_PLACE_URL
   */
  apiBase: REACT_APP_API_BASE || REACT_APP_BACKEND_URL || '/api',
  frontendUrl: REACT_APP_FRONTEND_URL || window.location.origin,
  wsUrl: REACT_APP_WS_URL || '',
  nodeEnv: REACT_APP_NODE_ENV || 'development',
  enableSourceMaps: REACT_APP_ENABLE_SOURCE_MAPS === 'true',
  port: REACT_APP_PORT ? Number(REACT_APP_PORT) : undefined,
  trustProxy: REACT_APP_TRUST_PROXY === 'true',
  logLevel: REACT_APP_LOG_LEVEL || 'info',
  healthPath: REACT_APP_HEALTHCHECK_PATH || '/health',
  featureFlags: parseJSON(REACT_APP_FEATURE_FLAGS, {}),
  experiments: REACT_APP_EXPERIMENTS_ENABLED === 'true',
  whatsappPhone: REACT_APP_WHATSAPP_PHONE || ''
};
