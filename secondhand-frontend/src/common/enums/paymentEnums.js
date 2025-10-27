import { enumService } from '../services/enumService.js';

export const paymentEnums = {
  paymentTypes: [],
  shippingStatuses: [],
  emailTypes: [],
  agreementGroups: [],
  agreementTypes: [],
};

export const fetchPaymentEnums = async () => {
  try {
    const [
      paymentTypes,
      shippingStatuses,
      emailTypes,
      agreementGroups,
      agreementTypes,
    ] = await Promise.all([
      enumService.getPaymentTypes(),
      enumService.getShippingStatuses(),
      enumService.getEmailTypes(),
      enumService.getAgreementGroups(),
      enumService.getAgreementTypes(),
    ]);

    return {
      paymentTypes,
      shippingStatuses,
      emailTypes,
      agreementGroups,
      agreementTypes,
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

export const getAgreementGroupLabel = (value, agreementGroups) => {
  const group = agreementGroups.find(g => g.value === value);
  return group?.label || value;
};

export const getAgreementTypeLabel = (value, agreementTypes) => {
  const type = agreementTypes.find(t => t.value === value);
  return type?.label || value;
};
