import {validateBasicListingStep1,validateBasicListingStep3} from "../listing/commonListingValidators.js";

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


const validateStep = (step, formData) => {
  if (step === 1) return validateBasicListingStep1(formData);
  if (step === 2) return validateVehicleStep2(formData, { isCreate: true });
  if (step === 3) return validateBasicListingStep3(formData);
  return {};
};

 const validateAll = (formData) => {
  return {
    ...validateBasicListingStep1(formData),
    ...validateVehicleStep2(formData, { isCreate: true }),
    ...validateBasicListingStep3(formData),
  };
};

 export default {
   validateStep,
     validateAll,
 }