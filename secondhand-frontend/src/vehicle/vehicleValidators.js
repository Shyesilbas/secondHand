import {validateBasicListingStep1,validateBasicListingStep3} from "../listing/commonListingValidators.js";

export const validateVehicleStep2 = (formData, { isCreate = false } = {}) => {
  const errors = {};
  if (isCreate) {
    if (!formData.vehicleTypeId) errors.vehicleTypeId = 'Please select vehicle type';
    if (!formData.brandId) errors.brandId = 'Please select a brand';
    if (!formData.fuelType) errors.fuelType = 'Please select fuel type';
  }
  if (!formData.vehicleModelId) errors.vehicleModelId = 'Please select a model';
  if (formData.vehicleModelId && formData.vehicleTypeId && formData._modelTypeId && String(formData._modelTypeId) !== String(formData.vehicleTypeId)) {
    errors.vehicleModelId = 'Selected model does not belong to selected vehicle type';
  }
  if (formData.vehicleModelId && formData.brandId && formData._modelBrandId && String(formData._modelBrandId) !== String(formData.brandId)) {
    errors.vehicleModelId = 'Selected model does not belong to selected brand';
  }
  if (formData.year && parseInt(formData.year) < 1950) errors.year = 'Please enter a valid year';

  const effectiveType = String(formData._vehicleTypeName || '').toUpperCase();

  if (isCreate) {
    if (effectiveType === 'CAR') {
      if (!formData.gearbox) errors.gearbox = 'Please select gear type';
      if (!formData.bodyType) errors.bodyType = 'Please select body type';
    }
    if (effectiveType === 'MOTORCYCLE' || effectiveType === 'SCOOTER') {
      if (!formData.engineCapacity || Number(formData.engineCapacity) <= 0) errors.engineCapacity = 'Engine capacity is required';
    }
  }

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