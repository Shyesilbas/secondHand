
export const getCarBrandLabel = (value, carBrands) => {
  if (!value) return value;
  if (typeof value === 'object') {
    return value.label || value.name || value.value || value.id || '';
  }
  const brand = carBrands.find(b => (b.id || b.value) === value);
  return brand?.label || brand?.name || value;
};

export const getFuelTypeLabel = (value, fuelTypes) => {
  const fuel = fuelTypes.find(f => f.value === value);
  return fuel?.label || value;
};

export const getColorLabel = (value, colors) => {
  const color = colors.find(c => c.value === value);
  return color?.label || value;
};
