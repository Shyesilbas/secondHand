import apiClient from './config.js';

// Simple request wrapper for consistent error/logging handling
export const request = async (method, url, data, config = {}) => {
  const start = performance.now();
  try {
    const response = await apiClient({ method, url, data, ...config });
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[request] ${method.toUpperCase()} ${url} → ${response.status} in ${(performance.now() - start).toFixed(0)}ms`);
    }
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(`[request] ${method.toUpperCase()} ${url} failed`, error.response?.status, error.response?.data);
    }
    throw error;
  }
};

export const get = (url, config) => request('get', url, undefined, config);
export const post = (url, data, config) => request('post', url, data, config);
export const put = (url, data, config) => request('put', url, data, config);
export const del = (url, config) => request('delete', url, undefined, config);

// Helper for requests with query params to avoid manual URL string building
export const requestWithParams = async (method, url, params = {}, data, config = {}) => {
  const mergedConfig = { ...config, params };
  return request(method, url, data, mergedConfig);
};

