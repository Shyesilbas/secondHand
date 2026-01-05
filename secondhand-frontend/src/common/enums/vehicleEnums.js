
export const getCarBrandLabel = (value, carBrands) => {
  const brand = carBrands.find(b => b.value === value);
  return brand?.label || value;
};

export const getFuelTypeLabel = (value, fuelTypes) => {
  const fuel = fuelTypes.find(f => f.value === value);
  return fuel?.label || value;
};

export const getColorLabel = (value, colors) => {
  const color = colors.find(c => c.value === value);
  return color?.label || value;
};
