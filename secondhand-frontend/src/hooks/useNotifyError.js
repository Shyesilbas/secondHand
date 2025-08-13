import { useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';

export const useNotifyError = () => {
  const notification = useNotification();

  const notifyError = useCallback((title, message) => {
    notification.showError(title, message);
  }, [notification]);

  return { notifyError };
};

export default useNotifyError;

