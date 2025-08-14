export const validateVehicleStep1 = (formData) => {
  const errors = {};
  if (!formData.title || !String(formData.title).trim()) errors.title = 'Title is required';
  if (!formData.description || !String(formData.description).trim()) errors.description = 'Description is required';
  if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Please enter a valid price';
  return errors;
};

export const validateVehicleStep2 = (formData, { isCreate = false } = {}) => {
  const errors = {};
  if (isCreate) {
    if (!formData.brand) errors.brand = 'Please select a brand';
    if (!formData.fuelType) errors.fuelType = 'Please select fuel type';
  }
  if (!formData.model || !String(formData.model).trim()) errors.model = 'Please enter model';
  if (formData.year && parseInt(formData.year) < 1950) errors.year = 'Please enter a valid year';
  return errors;
};

export const validateVehicleStep3 = (formData) => {
  const errors = {};
  if (!formData.city || !String(formData.city).trim()) errors.city = 'City is required';
  if (!formData.district || !String(formData.district).trim()) errors.district = 'District is required';
  return errors;
};

export const validateVehicleAll = (formData) => {
  return {
    ...validateVehicleStep1(formData),
    ...validateVehicleStep2(formData, { isCreate: true }),
    ...validateVehicleStep3(formData),
  };
};