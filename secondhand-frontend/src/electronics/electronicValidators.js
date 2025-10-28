import { validateBasicListingStep1, validateBasicListingStep3 } from "../listing/commonListingValidators.js";

const validateElectronicStep2 = (formData) => {
  const errors = {};
  if (!formData.electronicType) errors.electronicType = "Electronic type is required";
  if (!formData.electronicBrand) errors.electronicBrand = "Brand is required";
  if (!formData.model || !String(formData.model).trim()) errors.model = "Model is required";
  if (!formData.year || Number(formData.year) <= 0) errors.year = "Year is required";
  if (!formData.color) errors.color = "Color is required";
  if (formData.electronicType === 'LAPTOP') {
    if (!formData.ram || Number(formData.ram) <= 0) errors.ram = "RAM is required for laptops";
    if (!formData.storage || Number(formData.storage) <= 0) errors.storage = "Storage is required for laptops";
    if (!formData.screenSize || Number(formData.screenSize) <= 0) errors.screenSize = "Screen Size is required for laptops";
  }
  return errors;
};

const validateStep = (step, formData) => {
  if (step === 1) return validateBasicListingStep1(formData);
  if (step === 2) return validateElectronicStep2(formData);
  if (step === 3) return validateBasicListingStep3(formData);
  return {};
};

const validateAll = (formData) => ({
  ...validateBasicListingStep1(formData),
  ...validateElectronicStep2(formData),
  ...validateBasicListingStep3(formData),
});

export default {
  validateStep,
  validateAll,
};
