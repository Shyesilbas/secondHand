import { formatCurrency } from '../../common/formatters.js';
import { DEFAULT_CURRENCY } from '../paymentSchema.js';

export const formatPaymentAmount = (amount, currency = DEFAULT_CURRENCY, options = {}) =>
  formatCurrency(amount, currency, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });

