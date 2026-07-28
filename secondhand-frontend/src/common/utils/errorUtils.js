/**
 * Universal Error Message Extractor
 * Extracts the real human-readable backend error message from:
 * 1. RFC 7807 ProblemDetail `detail`
 * 2. Interceptor `userMessage`
 * 3. Legacy `message` or `error` strings
 * 4. Clean error object message
 */
export const getErrorMessage = (error, fallback = 'Bir hata oluştu. Lütfen tekrar deneyin.') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;

  // 1. Explicit userMessage from interceptors
  if (error.userMessage) return error.userMessage;

  // 2. RFC 7807 ProblemDetail 'detail' or legacy 'message'
  const data = error.response?.data;
  if (data) {
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.error && typeof data.error === 'string') return data.error;
    if (data.title && typeof data.title === 'string' && data.title !== 'Forbidden' && data.title !== 'Bad Request' && data.title !== 'Internal Server Error') {
      return data.title;
    }
  }

  // 3. Clean error.message if it's not a generic HTTP status code string
  if (error.message && !error.message.includes('status code') && !error.message.includes('Network Error')) {
    return error.message;
  }

  return fallback;
};

export default getErrorMessage;
