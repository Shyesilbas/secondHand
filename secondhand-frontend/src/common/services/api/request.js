import apiClient from './interceptors.js';

export const request = async (method, url, data, config = {}) => {
  const start = performance.now();
  
  // Sanitize data for logging (remove sensitive information)
  const sanitizedData = data ? sanitizeLogData(data) : data;
  
  try {
    const response = await apiClient({ method, url, data, ...config });
    
    // Handle Result pattern from backend
    const responseData = response.data;
    
    // Check if response follows Result pattern (has 'error' field for errors, or 'data' field for success)
    if (responseData && typeof responseData === 'object') {
      // If it's an error response (has 'error' field)
      if ('error' in responseData && responseData.error) {
        const error = new Error(responseData.message || 'An error occurred');
        error.response = {
          ...response,
          data: {
            message: responseData.message || 'An error occurred',
            error: responseData.error,
            errorCode: responseData.error
          },
          status: response.status || 400
        };
        throw error;
      }
      
      // If it's a success response with Result pattern (has 'data' field)
      if ('data' in responseData && responseData.data !== undefined) {
        const resultData = responseData.data;
        if (responseData.message) {
          try {
            Object.defineProperty(resultData, '__message', {
              value: responseData.message,
              writable: false,
              enumerable: false,
              configurable: true
            });
          } catch {
            resultData.__message = responseData.message;
          }
        }
        if (responseData.errorCode) {
          try {
            Object.defineProperty(resultData, '__errorCode', {
              value: responseData.errorCode,
              writable: false,
              enumerable: false,
              configurable: true
            });
          } catch {
            resultData.__errorCode = responseData.errorCode;
          }
        }
        return resultData;
      }
      
      // If it's a success response without Result pattern (direct data)
      // This handles endpoints that haven't been migrated yet
      return responseData;
    }
    
    return responseData;
  } catch (error) {
    console.error(`API Error: ${method.toUpperCase()} ${url}`, error);
    
    // If error already has response data with Result pattern, preserve it
    if (error.response && error.response.data && error.response.data.error) {
      // Already formatted, just throw
      throw error;
    }
    
    // If it's a 400 error with Result pattern in response body
    if (error.response && error.response.status === 400 && error.response.data) {
      const errorData = error.response.data;
      if (errorData.error || errorData.errorCode) {
        // Format as Result pattern error
        error.response.data = {
          message: errorData.message || 'An error occurred',
          error: errorData.error || errorData.errorCode,
          errorCode: errorData.error || errorData.errorCode
        };
      }
    }
    
    throw error;
  }
};

// Helper function to sanitize sensitive data for logging
const sanitizeLogData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'confirmPassword', 'token', 'accessToken', 'refreshToken'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  // Recursively sanitize nested objects
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  });
  
  return sanitized;
};

export const get = (url, config) => request('get', url, undefined, config);
export const post = (url, data, config) => request('post', url, data, config);
export const put = (url, data, config) => request('put', url, data, config);
export const patch = (url, data, config) => request('patch', url, data, config);
export const del = (url, config) => request('delete', url, undefined, config);

export const requestWithParams = async (method, url, params = {}, data, config = {}) => {
  const mergedConfig = { ...config, params };
  return request(method, url, data, mergedConfig);
};

