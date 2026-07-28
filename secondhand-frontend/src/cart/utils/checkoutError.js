import { getErrorMessage } from '../../common/utils/errorUtils.js';

export const getCheckoutErrorMessage = (error, fallback = 'Sipariş işlemi tamamlanamadı.') => {
  return getErrorMessage(error, fallback);
};
