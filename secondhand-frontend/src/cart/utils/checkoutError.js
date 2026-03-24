export const getCheckoutErrorMessage = (error, fallback) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data) {
    return typeof error.response.data === 'string'
      ? error.response.data
      : JSON.stringify(error.response.data);
  }
  if (error?.message) return error.message;
  return fallback;
};
