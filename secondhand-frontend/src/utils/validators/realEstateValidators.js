export const validateRealEstateStep1 = (formData) => {
  const errors = {};
  if (!formData.title || !String(formData.title).trim()) errors.title = 'Title is required';
  if (!formData.description || !String(formData.description).trim()) errors.description = 'Description is required';
  if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Please enter a valid price';
  return errors;
};

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

export const validateRealEstateStep3 = (formData) => {
  const errors = {};
  if (!formData.city || !String(formData.city).trim()) errors.city = 'City is required';
  if (!formData.district || !String(formData.district).trim()) errors.district = 'District is required';
  return errors;
};

export const validateRealEstateAll = (formData) => {
  return {
    ...validateRealEstateStep1(formData),
    ...validateRealEstateStep2(formData, { isCreate: true }),
    ...validateRealEstateStep3(formData),
  };
};
