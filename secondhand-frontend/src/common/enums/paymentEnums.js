import { enumService } from '../services/enumService.js';

export const paymentEnums = {
  paymentTypes: [],
  shippingStatuses: [],
  emailTypes: [],
};

export const fetchPaymentEnums = async () => {
  try {
    const [
      paymentTypes,
      shippingStatuses,
      emailTypes,
    ] = await Promise.all([
      enumService.getPaymentTypes(),
      enumService.getShippingStatuses(),
      enumService.getEmailTypes(),
    ]);

    return {
      paymentTypes,
      shippingStatuses,
      emailTypes,
    };
  } catch (error) {
    console.error('Error fetching payment enums:', error);
    return paymentEnums;
  }
};

export const getPaymentTypeLabel = (value, paymentTypes) => {
  const type = paymentTypes.find(t => t.value === value);
  return type?.label || value;
};

export const getShippingStatusLabel = (value, shippingStatuses) => {
  const status = shippingStatuses.find(s => s.value === value);
  return status?.label || value;
};

export const getEmailTypeLabel = (value, emailTypes) => {
  const type = emailTypes.find(t => t.value === value);
  return type?.label || value;
};
