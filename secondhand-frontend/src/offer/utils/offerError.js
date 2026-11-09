import i18n from '../../i18n.js';
import { getErrorMessage } from '../../common/utils/errorUtils.js';

export const getOfferErrorMessage = (error, fallback) => {
  const isEn = i18n?.language?.startsWith('en');
  const defaultFallback = isEn ? 'Failed to process offer.' : 'Teklif işlemi gerçekleştirilemedi.';
  return getErrorMessage(error, fallback || defaultFallback);
};
