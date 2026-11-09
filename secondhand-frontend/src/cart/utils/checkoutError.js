import i18n from '../../i18n.js';
import { getErrorMessage } from '../../common/utils/errorUtils.js';

export const getCheckoutErrorMessage = (error, fallback) => {
  const isEn = i18n?.language?.startsWith('en');
  const defaultFallback = isEn ? 'Checkout could not be completed.' : 'Sipariş işlemi tamamlanamadı.';
  return getErrorMessage(error, fallback || defaultFallback);
};
