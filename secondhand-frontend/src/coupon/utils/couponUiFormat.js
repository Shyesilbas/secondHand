import { formatCurrency } from '../../common/formatters.js';

export const formatCouponDiscount = (coupon) => {
  if (!coupon) return '';
  if (String(coupon.discountKind || '').includes('PERCENT')) {
    return `%${coupon.value}`;
  }
  return formatCurrency(coupon.value, 'TRY');
};

export const formatCouponKindLabel = (kind) => {
  switch (kind) {
    case 'ORDER_PERCENT':
      return 'Cart % discount';
    case 'ORDER_FIXED':
      return 'Cart fixed discount';
    case 'TYPE_PERCENT':
      return 'Type % discount';
    case 'TYPE_FIXED':
      return 'Type fixed discount';
    case 'THRESHOLD_FIXED':
      return 'Threshold fixed discount';
    case 'THRESHOLD_PERCENT':
      return 'Threshold % discount';
    default:
      return kind || 'Discount';
  }
};
