import { useState, useCallback } from 'react';
import { handleError } from '../utils/errorHandler';
import { useNotification } from '../notification/NotificationContext.jsx';

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
      setError(err);
      handleError(err, notification.showError);
      throw err; 
    } finally {
      setIsLoading(false);
    }
  }, [notification.showError]);

  const reset = useCallback(() => {
    setData(defaultData);
    setIsLoading(false);
    setError(null);
  }, [defaultData]);

  return { data, isLoading, error, callApi, setData, setError, reset };
};

export default useApi;
