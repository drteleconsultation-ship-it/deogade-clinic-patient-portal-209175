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

  const featureFlags =
    tryParseJson(process.env.REACT_APP_FEATURE_FLAGS, null) ||
    // fallback to simple CSV "flag1,flag2"
    (() => {
      const raw = (process.env.REACT_APP_FEATURE_FLAGS || '').toString().trim();
      if (!raw) return {};
      return raw.split(',').reduce((acc, k) => {
        const key = k.trim();
        if (key) acc[key] = true;
        return acc;
      }, {});
    })();

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
    featureFlags,
    experimentsEnabled,
  };
}

/**
 * PUBLIC_INTERFACE
 * Returns true if API base URL is configured (non-empty).
 */
export function hasApiBase() {
  /** Helper to know whether to use network or mock mode. */
  return !!getEnv().apiBase;
}

export default {
  getEnv,
  hasApiBase,
};
