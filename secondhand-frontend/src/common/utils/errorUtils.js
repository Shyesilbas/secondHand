export const getErrorMessage = (error, fallback = 'Bir hata oluştu.') => {
 if (!error) return fallback;
 if (typeof error === 'string') return error;
 if (error.response?.data?.message) return error.response.data.message;
 if (error.response?.data?.error) return error.response.data.error;
 if (error.message) return error.message;
 return fallback;
};
