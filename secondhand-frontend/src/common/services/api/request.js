import apiClient from './config.js';

export const request = async (method, url, data, config = {}) => {
  const start = performance.now();
  try {
    const response = await apiClient({ method, url, data, ...config });
    if (import.meta.env.DEV) {
    }
    return response.data;
  } catch (error) {
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

