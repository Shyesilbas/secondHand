import { getErrorMessage } from '../../common/utils/errorUtils.js';

export const getOfferErrorMessage = (error, fallback = 'Teklif işlemi gerçekleştirilemedi.') => {
  return getErrorMessage(error, fallback);
};
