export const validateElectronicStep1 = (formData) => {
  const errors = {};
  if (!formData.title || !String(formData.title).trim()) errors.title = 'Title is required';
  if (!formData.description || !String(formData.description).trim()) errors.description = 'Description is required';
  if (!formData.price || Number(formData.price) <= 0) errors.price = 'Price must be greater than 0';
  return errors;
};

export const validateElectronicStep2 = (formData) => {
  const errors = {};
  if (!formData.electronicType) errors.electronicType = 'Electronic type is required';
  if (!formData.electronicBrand) errors.electronicBrand = 'Brand is required';
  if (!formData.model || !String(formData.model).trim()) errors.model = 'Model is required';
  if (!formData.year || Number(formData.year) <= 0) errors.year = 'Year is required';
  if (!formData.color) errors.color = 'Color is required';
  return errors;
};

export const validateElectronicStep3 = (formData) => {
  const errors = {};
  if (!formData.city || !String(formData.city).trim()) errors.city = 'City is required';
  if (!formData.district || !String(formData.district).trim()) errors.district = 'District is required';
  return errors;
};

export const validateElectronicAll = (formData) => {
  return {
    ...validateElectronicStep1(formData),
    ...validateElectronicStep2(formData),
    ...validateElectronicStep3(formData),
  };
};


