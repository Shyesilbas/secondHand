import {validateBasicListingStep1,validateBasicListingStep3} from "./commonListingValidators.js";

export const validateRealEstateStep2 = (formData, { isCreate = false } = {}) => {
  const errors = {};
  if (isCreate) {
    if (!formData.adType) errors.adType = 'Please select ad type';
    if (!formData.realEstateType) errors.realEstateType = 'Please select property type';
    if (!formData.heatingType) errors.heatingType = 'Please select heating type';
    if (!formData.ownerType) errors.ownerType = 'Please select owner type';
  }
  if (!formData.squareMeters || parseInt(formData.squareMeters) <= 0) errors.squareMeters = 'Please enter valid square meters';
  if (!formData.roomCount || parseInt(formData.roomCount) <= 0) errors.roomCount = 'Please enter valid room count';
  if (formData.bathroomCount && parseInt(formData.bathroomCount) < 0) errors.bathroomCount = 'Please enter valid bathroom count';
  if (formData.floor && parseInt(formData.floor) < 0) errors.floor = 'Please enter valid floor number';
  if (formData.buildingAge && parseInt(formData.buildingAge) < 0) errors.buildingAge = 'Please enter valid building age';
  return errors;
};


const validateStep = (step, formData) => {
  if (step === 1) return validateBasicListingStep1(formData);
  if (step === 2) return validateRealEstateStep2(formData);
  if (step === 3) return validateBasicListingStep3(formData);
  return {};
};

const validateAll = (formData) => ({
  ...validateBasicListingStep1(formData),
  ...validateRealEstateStep2(formData),
  ...validateBasicListingStep3(formData),
})

export default {
  validateStep,
  validateAll,
};


