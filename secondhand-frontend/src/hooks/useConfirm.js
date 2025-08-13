import { useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';

export const useConfirm = () => {
  const notification = useNotification();

  const confirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      notification.showConfirmation(title, message, () => resolve(true), () => resolve(false));
    });
  }, [notification]);

  return { confirm };
};

export default useConfirm;

