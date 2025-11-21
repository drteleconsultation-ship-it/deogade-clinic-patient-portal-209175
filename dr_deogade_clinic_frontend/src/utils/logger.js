//
// Simple, zero-dependency logger with levels and namespacing.
// Honors REACT_APP_LOG_LEVEL: 'silent' | 'error' | 'warn' | 'info' | 'debug'
//
// Usage:
//   import logger from '../utils/logger';
//   const log = logger.createLogger('BookingService');
//   log.info('Created booking', data);
//
// PUBLIC_INTERFACE
export function createLogger(namespace = 'app') {
  /**
   * PUBLIC INTERFACE: Create a logger instance with a namespace.
   * Respects REACT_APP_LOG_LEVEL. Levels: silent<error<warn<info<debug
   */
  const levelStr = (process.env.REACT_APP_LOG_LEVEL || 'info').toLowerCase();
  const levels = ['silent', 'error', 'warn', 'info', 'debug'];
  const currentIdx = Math.max(0, levels.indexOf(levelStr));

  const should = (lvl) => levels.indexOf(lvl) <= currentIdx;

  const prefix = `[${namespace}]`;

  const safe = (fn, ...args) => {
    try {
      // eslint-disable-next-line no-console
      fn(...args);
    } catch {
      /* ignore */
    }
  };

  return {
    // PUBLIC_INTERFACE
    error: (...args) => should('error') && safe(console.error, prefix, ...args),
    // PUBLIC_INTERFACE
    warn: (...args) => should('warn') && safe(console.warn, prefix, ...args),
    // PUBLIC_INTERFACE
    info: (...args) => should('info') && safe(console.info, prefix, ...args),
    // PUBLIC_INTERFACE
    debug: (...args) => should('debug') && safe(console.debug, prefix, ...args),
    // PUBLIC_INTERFACE
    setLevel: (lvl) => {
      // No-op at runtime in CRA env; provided for API completeness.
      // Level should be controlled via env at build time.
    },
    // PUBLIC_INTERFACE
    getLevel: () => levelStr,
    // PUBLIC_INTERFACE
    namespace,
  };
}

// Default app logger
const defaultLogger = createLogger('app');

export default {
  createLogger,
  default: defaultLogger,
  error: defaultLogger.error,
  warn: defaultLogger.warn,
  info: defaultLogger.info,
  debug: defaultLogger.debug,
};
