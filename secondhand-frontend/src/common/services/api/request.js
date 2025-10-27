import apiClient from './config.js';

export const request = async (method, url, data, config = {}) => {
  const start = performance.now();
  
  // Sanitize data for logging (remove sensitive information)
  const sanitizedData = data ? sanitizeLogData(data) : data;
  console.log(`API Request: ${method.toUpperCase()} ${url}`, { data: sanitizedData, config });
  
  try {
    const response = await apiClient({ method, url, data, ...config });
    console.log(`API Response: ${method.toUpperCase()} ${url}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API Error: ${method.toUpperCase()} ${url}`, error);
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
export const del = (url, config) => request('delete', url, undefined, config);

export const requestWithParams = async (method, url, params = {}, data, config = {}) => {
  const mergedConfig = { ...config, params };
  return request(method, url, data, mergedConfig);
};

