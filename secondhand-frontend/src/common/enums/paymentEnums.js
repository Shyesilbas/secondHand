
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
