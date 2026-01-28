export const extractSuccessMessage = (result) => {
  if (!result || typeof result !== 'object') return null;
  if (typeof result.__message === 'string' && result.__message.trim().length > 0) {
    return result.__message;
  }
  if (typeof result.message === 'string' && result.message.trim().length > 0) {
    return result.message;
  }
  return null;
};

