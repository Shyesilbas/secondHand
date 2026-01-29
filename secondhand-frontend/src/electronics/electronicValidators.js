import { validateBasicListingStep1, validateBasicListingStep3 } from "../listing/commonListingValidators.js";

const validateElectronicStep2 = (formData, isLaptop) => {
  const errors = {};
  if (!formData.electronicTypeId) errors.electronicTypeId = "Electronic type is required";
  if (!formData.electronicBrandId) errors.electronicBrandId = "Brand is required";
  if (!formData.electronicModelId) errors.electronicModelId = "Model is required";
  if (!formData.year || Number(formData.year) <= 0) errors.year = "Year is required";
  if (!formData.color) errors.color = "Color is required";
  if (isLaptop) {
    if (!formData.ram || Number(formData.ram) <= 0) errors.ram = "RAM is required for laptops";
    if (!formData.storage || Number(formData.storage) <= 0) errors.storage = "Storage is required for laptops";
    if (!formData.screenSize || Number(formData.screenSize) <= 0) errors.screenSize = "Screen Size is required for laptops";
  }
  return errors;
};

const validateStep = (step, formData, setErrors, isLaptop = false) => {
  let errors = {};
  if (step === 1) errors = validateBasicListingStep1(formData);
  else if (step === 2) errors = validateElectronicStep2(formData, isLaptop);
  else if (step === 3) errors = validateBasicListingStep3(formData);
  else errors = validateAll(formData, isLaptop);

  if (typeof setErrors === "function") {
    setErrors(errors);
  }
  return Object.keys(errors).length === 0;
};

const validateAll = (formData, isLaptop) => ({
  ...validateBasicListingStep1(formData),
  ...validateElectronicStep2(formData, isLaptop),
  ...validateBasicListingStep3(formData),
});

export default {
  validateStep,
  validateAll,
};
