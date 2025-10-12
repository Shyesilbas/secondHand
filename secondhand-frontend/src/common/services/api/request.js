import apiClient from './config.js';

export const request = async (method, url, data, config = {}) => {
  const start = performance.now();
  console.log(`API Request: ${method.toUpperCase()} ${url}`, { data, config }); // Debug log
  try {
    const response = await apiClient({ method, url, data, ...config });
    console.log(`API Response: ${method.toUpperCase()} ${url}`, response.data); // Debug log
    if (import.meta.env.DEV) {
    }
    return response.data;
  } catch (error) {
    console.error(`API Error: ${method.toUpperCase()} ${url}`, error); // Debug log
    if (import.meta.env.DEV) {
    }
    throw error;
  }
};

export const get = (url, config) => request('get', url, undefined, config);
export const post = (url, data, config) => request('post', url, data, config);
export const put = (url, data, config) => request('put', url, data, config);
export const del = (url, config) => request('delete', url, undefined, config);

export const requestWithParams = async (method, url, params = {}, data, config = {}) => {
  const mergedConfig = { ...config, params };
  return request(method, url, data, mergedConfig);
};

