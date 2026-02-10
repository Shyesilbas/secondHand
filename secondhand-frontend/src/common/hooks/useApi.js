import { useState, useCallback } from 'react';
import { parseError } from '../errorHandler.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

const useApi = (defaultData = null) => {
  const [data, setData] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const notification = useNotification();

  const callApi = useCallback(async (apiFunctionToExecute, ...args) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiFunctionToExecute(...args);
      setData(result);
      return result;
    } catch (err) {
      const parsedError = parseError(err);
      setError(parsedError);
      
      // Backend'den gelen user-friendly mesajı göster
      notification.showError(
        'Error',
        parsedError.message,
        {
          errorCode: parsedError.errorCode,
          validationErrors: parsedError.validationErrors
        }
      );
      
      throw parsedError; // Parsed error'u fırlat
    } finally {
      setIsLoading(false);
    }
  }, [notification]);

  const reset = useCallback(() => {
    setData(defaultData);
    setIsLoading(false);
    setError(null);
  }, [defaultData]);

  return { data, isLoading, error, callApi, setData, setError, reset };
};

export default useApi;
