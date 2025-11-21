//
// Environment configuration helper for the frontend.
// Reads REACT_APP_* variables, exposes typed values, and sensible defaults.
// When REACT_APP_API_BASE is not set, services will use mock data.
//

/**
 * Safe JSON parse for feature flags/experiments.
 */
function tryParseJson(value, fallback) {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * PUBLIC_INTERFACE
 * Returns normalized environment configuration for the app.
 */
export function getEnv() {
  /** Provide normalized env values for use across services/UI. */
  const nodeEnv = process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';
  const isDev = nodeEnv !== 'production' && nodeEnv !== 'test';

  const apiBaseRaw =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    '';

  const apiBase =
    typeof apiBaseRaw === 'string' ? apiBaseRaw.trim().replace(/\/*$/, '') : '';

  const frontendUrl =
    (process.env.REACT_APP_FRONTEND_URL || '').toString().trim() ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  const wsUrl = (process.env.REACT_APP_WS_URL || '').toString().trim();

  // Common flags and controls
  const enableSourceMaps = (process.env.REACT_APP_ENABLE_SOURCE_MAPS || '').toString().trim();
  const sourceMaps = enableSourceMaps ? enableSourceMaps === 'true' : isDev;

  const port = parseInt(process.env.REACT_APP_PORT || '', 10) || 3000;
  const trustProxy = (process.env.REACT_APP_TRUST_PROXY || '').toString().trim() === 'true';
  const logLevel = (process.env.REACT_APP_LOG_LEVEL || 'info').toLowerCase();
  const healthPath = (process.env.REACT_APP_HEALTHCHECK_PATH || '/health').trim();

  // Parse flags from JSON or CSV list
  const rawFlags = tryParseJson(process.env.REACT_APP_FEATURE_FLAGS, null);
  let featureFlags = {};
  if (rawFlags && typeof rawFlags === 'object') {
    featureFlags = rawFlags;
  } else {
    const csv = (process.env.REACT_APP_FEATURE_FLAGS || '').toString().trim();
    if (csv) {
      featureFlags = csv.split(',').reduce((acc, k) => {
        const key = k.trim();
        if (key) acc[key] = true;
        return acc;
      }, {});
    }
  }

  // Normalize and expose typed flags with sensible defaults:
  // - mockAPIs: force mock mode even if API base is configured
  // - upiQRFallback: show QR fallback automatically
  // - enableReviews: show reviews section/widget
  const flags = {
    mockAPIs: Boolean(
      featureFlags.mockAPIs ||
        featureFlags['mock-apis'] ||
        featureFlags['mock_api'] ||
        (!apiBase && featureFlags.mockAPIs !== false)
    ),
    upiQRFallback: Boolean(
      (featureFlags.upiQRFallback || featureFlags['upi-qr-fallback']) ?? true
    ),
    enableReviews: Boolean(
      (featureFlags.enableReviews) ?? true
    ),
  };

  const experimentsEnabled =
    (process.env.REACT_APP_EXPERIMENTS_ENABLED || '').toString().trim() === 'true';

  return {
    // environment
    nodeEnv,
    isProd,
    isDev,

    // endpoints
    apiBase,
    frontendUrl,
    wsUrl,

    // build/runtime flags
    sourceMaps,
    port,
    trustProxy,
    logLevel,
    healthPath,

    // raw + typed flags
    featureFlags,
    flags,
    experimentsEnabled,
  };
}

/**
 * PUBLIC_INTERFACE
 * Returns true if API base URL is configured (non-empty) and mockAPIs flag is not forcing mock mode.
 */
export function hasApiBase() {
  /** Helper to know whether to use network or mock mode. */
  const { apiBase, flags = {} } = getEnv();
  if (flags.mockAPIs) return false;
  return !!apiBase;
}

export default {
  getEnv,
  hasApiBase,
};
