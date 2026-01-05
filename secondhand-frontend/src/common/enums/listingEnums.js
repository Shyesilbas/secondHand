
export const getListingTypeLabel = (value, listingTypes) => {
  const type = listingTypes.find(t => t.value === value);
  return type?.label || value;
};

export const getListingTypeIcon = (value, listingTypes) => {
  const type = listingTypes.find(t => t.value === value);
  return type?.icon || '📦';
};

export const getCurrencyLabel = (value, currencies) => {
  const currency = currencies.find(c => c.value === value);
  return currency?.label || value;
};

export const getCurrencySymbol = (value, currencies) => {
  const currency = currencies.find(c => c.value === value);
  return currency?.symbol || value;
};
