import {validateBasicListingStep1} from "./commonListingValidators.js";

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
    ...validateBasicListingStep1(formData),
    ...validateElectronicStep2(formData),
    ...validateElectronicStep3(formData),
  };
};


