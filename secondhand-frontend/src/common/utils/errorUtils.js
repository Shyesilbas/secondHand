export const getErrorMessage = (error, fallback = 'Bir hata oluştu.') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error.userMessage) return error.userMessage;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.detail) return error.response.data.detail;
  if (error.response?.data?.error && typeof error.response.data.error === 'string') return error.response.data.error;
  if (error.message && !error.message.startsWith('Request failed with status code')) {
    return error.message;
  }
  return fallback;
};
