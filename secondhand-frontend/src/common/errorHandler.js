import logger from './utils/logger.js';

/**
 * Error types derived from backend HTTP status codes.
 * Frontend does NOT define its own error messages — all messages come from backend's
 * GlobalExceptionHandler → ErrorResponse { timestamp, status, error, message, path, validationErrors }
 */
export const ERROR_TYPES = Object.freeze({
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NETWORK: 'network',
  SERVER: 'server',
  UNKNOWN: 'unknown',
});

/**
 * Maps HTTP status code → error type.
 * The actual error MESSAGE always comes from backend.
 */
const STATUS_TO_TYPE = {
  400: ERROR_TYPES.VALIDATION,
  401: ERROR_TYPES.AUTHENTICATION,
  403: ERROR_TYPES.AUTHORIZATION,
  404: ERROR_TYPES.VALIDATION,
  409: ERROR_TYPES.VALIDATION,
  422: ERROR_TYPES.VALIDATION,
  429: ERROR_TYPES.VALIDATION,
};

const ERROR_TITLES = Object.freeze({
  [ERROR_TYPES.AUTHENTICATION]: 'Authentication Error',
  [ERROR_TYPES.AUTHORIZATION]: 'Authorization Error',
  [ERROR_TYPES.VALIDATION]: 'Validation Error',
  [ERROR_TYPES.NETWORK]: 'Network Error',
  [ERROR_TYPES.SERVER]: 'Server Error',
  [ERROR_TYPES.UNKNOWN]: 'Error',
});

// Only used as absolute last resort when backend is unreachable
const NETWORK_FALLBACK_MESSAGE = 'Check your internet connection and try again.';
const GENERIC_FALLBACK_MESSAGE = 'An unexpected error occurred. Please try again.';

/**
 * Parses any error into a consistent shape.
 * Message priority: backend ErrorResponse.message > interceptor userMessage > fallback
 */
export const parseError = (error) => {
  if (!error) {
    return buildParsedError({ type: ERROR_TYPES.UNKNOWN, message: GENERIC_FALLBACK_MESSAGE });
  }

  // Network error (no response from server at all)
  if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK' || !error.response) {
    return buildParsedError({
      type: ERROR_TYPES.NETWORK,
      message: error.userMessage || NETWORK_FALLBACK_MESSAGE,
      originalError: error,
    });
  }

  const { response } = error;
  const status = response?.status;
  const data = response?.data;

  // Backend ErrorResponse fields
  const backendMessage = data?.message;
  const errorCode = data?.errorCode || data?.error;
  const validationErrors = data?.validationErrors || null;

  // Determine type from status
  let type = ERROR_TYPES.UNKNOWN;
  if (status >= 400 && status < 500) {
    type = STATUS_TO_TYPE[status] || ERROR_TYPES.VALIDATION;
  } else if (status >= 500) {
    type = ERROR_TYPES.SERVER;
  }

  // Message priority: backend message → enriched userMessage → generic fallback
  const message = backendMessage || error.userMessage || GENERIC_FALLBACK_MESSAGE;

  return buildParsedError({
    type,
    message,
    statusCode: status,
    errorCode,
    validationErrors,
    path: data?.path,
    timestamp: data?.timestamp,
    originalError: error,
  });
};

function buildParsedError({
  type = ERROR_TYPES.UNKNOWN,
  message = GENERIC_FALLBACK_MESSAGE,
  statusCode = null,
  errorCode = null,
  validationErrors = null,
  path = null,
  timestamp = null,
  originalError = null,
}) {
  return Object.freeze({
    type,
    message,
    statusCode,
    errorCode,
    validationErrors,
    path,
    timestamp: timestamp || new Date().toISOString(),
    title: ERROR_TITLES[type] || ERROR_TITLES[ERROR_TYPES.UNKNOWN],
    originalError,
  });
}

/**
 * Handle error and show notification.
 * Uses backend-provided message by default.
 */
export const handleError = (error, showError, options = {}) => {
  const parsedError = parseError(error);

  const {
    customTitle = null,
    customMessage = null,
    useModal = false,
  } = options;

  const messageToShow = customMessage || parsedError.message;
  const titleToShow = customTitle || parsedError.title;

  logger.error('🚨 Error:', parsedError);

  if (useModal && typeof showError === 'function') {
    try {
      if (showError.showDetailedError) {
        showError.showDetailedError(parsedError, {
          customTitle: titleToShow,
          customMessage: messageToShow,
        });
      } else {
        showError(titleToShow, messageToShow);
      }
    } catch (e) {
      logger.error('Error notification failed:', e);
    }
  } else if (typeof showError === 'function') {
    showError(messageToShow);
  }

  return parsedError;
};

/**
 * Handle error with modal notification context.
 */
export const handleErrorWithModal = (error, notificationContext, options = {}) => {
  const parsedError = parseError(error);

  const {
    customTitle = null,
    customMessage = null,
    showDetails = true,
    actions = [],
  } = options;

  const title = customTitle || parsedError.title;
  const message = customMessage || parsedError.message;

  logger.error('🚨 Error:', parsedError);

  if (notificationContext?.showDetailedError) {
    notificationContext.showDetailedError(parsedError, {
      customTitle: title,
      customMessage: message,
      showDetails,
      actions,
    });
  } else if (notificationContext?.showError) {
    notificationContext.showError(title, message);
  }

  return parsedError;
};

/**
 * Determines if a parsed error should trigger a logout.
 * Only token-related 401 errors (not login failures).
 */
export const shouldTriggerLogout = (parsedError) => {
  if (parsedError.type !== ERROR_TYPES.AUTHENTICATION) return false;

  const code = (parsedError.errorCode || '').toLowerCase();
  const msg = (parsedError.message || '').toLowerCase();

  // Login failure → don't logout
  if (msg.includes('invalid email or password') || msg.includes('bad credentials')) {
    return false;
  }

  // Token/session expiry → logout
  return (
    code.includes('token_expired') ||
    code.includes('invalid_token') ||
    msg.includes('token expired') ||
    msg.includes('invalid token') ||
    msg.includes('session expired')
  );
};

export default {
  parseError,
  handleError,
  handleErrorWithModal,
  shouldTriggerLogout,
  ERROR_TYPES,
};