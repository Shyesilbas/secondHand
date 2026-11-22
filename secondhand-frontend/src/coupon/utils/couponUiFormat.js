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
 return 'Sepette yüzde indirim';
 case 'ORDER_FIXED':
 return 'Sepette sabit indirim';
 case 'TYPE_PERCENT':
 return 'Kategoriye yüzde indirim';
 case 'TYPE_FIXED':
 return 'Kategoriye sabit indirim';
 case 'THRESHOLD_FIXED':
 return 'Tutar üstü sabit indirim';
 case 'THRESHOLD_PERCENT':
 return 'Tutar üstü yüzde indirim';
 default:
 return kind || 'İndirim';
 }
};
