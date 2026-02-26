/**
 * Centralized logger utility.
 * Suppresses debug/error logs in production to prevent log flood.
 * In production, only warn-level and above are logged.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args) => {
    if (isDev) console.debug(...args);
  },
  info: (...args) => {
    if (isDev) console.info(...args);
  },
  warn: (...args) => {
    console.warn(...args);
  },
  error: (...args) => {
    if (isDev) console.error(...args);
  },
};

export default logger;

