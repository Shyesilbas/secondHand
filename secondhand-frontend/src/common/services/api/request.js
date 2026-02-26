import apiClient from './interceptors.js';
import logger from '../../utils/logger.js';

/**
 * Central API request function.
 *
 * Handles two backend response patterns:
 * 1. Result pattern (from ResultResponses): { data, message, error }
 *    - Success: unwraps `data` field, attaches `message` as hidden prop
 *    - Error: converts to standard error format
 * 2. Direct response (from GlobalExceptionHandler ErrorResponse):
 *    { timestamp, status, error, message, path, validationErrors }
 *    - Already handled by axios interceptor, just re-throw
 */
export const request = async (method, url, data, config = {}) => {
  try {
    const response = await apiClient({ method, url, data, ...config });
    const responseData = response.data;

    // Non-object responses (strings, nulls, etc.) — return as-is
    if (!responseData || typeof responseData !== 'object') {
      return responseData;
    }

    // Result pattern error: { error: "SOME_CODE", message: "..." }
    if (responseData.error) {
      const error = new Error(responseData.message || 'An error occurred');
      error.response = {
        ...response,
        data: {
          message: responseData.message,
          error: responseData.error,
          errorCode: responseData.error,
        },
        status: response.status || 400,
      };
      throw error;
    }

    // Result pattern success: { data: ..., message: "..." }
    if ('data' in responseData && responseData.data !== undefined) {
      const resultData = responseData.data;
      // Attach backend success message as hidden property (used by successHandler)
      if (responseData.message && resultData && typeof resultData === 'object') {
        try {
          Object.defineProperty(resultData, '__message', {
            value: responseData.message,
            writable: false,
            enumerable: false,
            configurable: true,
          });
        } catch {
          // Primitive or frozen object — skip message attachment
        }
      }
      return resultData;
    }

    // Non-Result response (legacy endpoints) — return as-is
    return responseData;
  } catch (error) {
    logger.error(`API Error: ${method.toUpperCase()} ${url}`, error);
    // Error is already enriched by interceptors — just re-throw
    throw error;
  }
};

export const get = (url, config) => request('get', url, undefined, config);
export const post = (url, data, config) => request('post', url, data, config);
export const put = (url, data, config) => request('put', url, data, config);
export const patch = (url, data, config) => request('patch', url, data, config);
export const del = (url, config) => request('delete', url, undefined, config);

