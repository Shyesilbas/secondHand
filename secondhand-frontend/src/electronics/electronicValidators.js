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
    if (!formData.storageType) errors.storageType = "Storage type is required for laptops";
    if (!formData.screenSize || Number(formData.screenSize) <= 0) errors.screenSize = "Screen Size is required for laptops";
  }
  return errors;
};

const validateElectronicByType = (formData, flags) => {
  const errors = {};
  if (flags.isLaptop) {
    if (!formData.ram || Number(formData.ram) <= 0) errors.ram = "RAM is required for laptops";
    if (!formData.storage || Number(formData.storage) <= 0) errors.storage = "Storage is required for laptops";
    if (!formData.storageType) errors.storageType = "Storage type is required for laptops";
    if (!formData.screenSize || Number(formData.screenSize) <= 0) errors.screenSize = "Screen Size is required for laptops";
  }
  if (flags.isMobilePhone) {
    if (!formData.storage || Number(formData.storage) <= 0) errors.storage = "Storage is required for mobile phones";
    if (!formData.screenSize || Number(formData.screenSize) <= 0) errors.screenSize = "Screen size is required for mobile phones";
    if (!formData.batteryCapacityMah || Number(formData.batteryCapacityMah) <= 0) errors.batteryCapacityMah = "Battery capacity is required for mobile phones";
  }
  if (flags.isHeadphones) {
    if (!formData.connectionType) errors.connectionType = "Connection type is required for headphones";
    const wireless = Boolean(formData.wireless);
    if (wireless && (!formData.batteryLifeHours || Number(formData.batteryLifeHours) <= 0)) {
      errors.batteryLifeHours = "Battery life hours is required for wireless headphones";
    }
  }
  return errors;
};

const validateStep = (step, formData, setErrors, flags = { isLaptop: false, isMobilePhone: false, isHeadphones: false }) => {
  let errors = {};
  if (step === 1) errors = validateBasicListingStep1(formData);
  else if (step === 2) errors = { ...validateElectronicStep2(formData, flags.isLaptop), ...validateElectronicByType(formData, flags) };
  else if (step === 3) errors = validateBasicListingStep3(formData);
  else errors = validateAll(formData, flags);

  if (typeof setErrors === "function") {
    setErrors(errors);
  }
  return Object.keys(errors).length === 0;
};

const validateAll = (formData, flags) => ({
  ...validateBasicListingStep1(formData),
  ...validateElectronicStep2(formData, flags.isLaptop),
  ...validateElectronicByType(formData, flags),
  ...validateBasicListingStep3(formData),
});

export default {
  validateStep,
  validateAll,
};
