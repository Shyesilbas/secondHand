import { validateBasicListingStep1, validateBasicListingStep3 } from "../listing/commonListingValidators.js";

const validateClothingStep2 = (formData) => {
    const errors = {};
    if (!formData.brandId) errors.brandId = 'Brand is required';
    if (!formData.clothingTypeId) errors.clothingTypeId = 'Type is required';
    if (!formData.color) errors.color = 'Color is required';
    if (!formData.condition) errors.condition = 'Condition is required';
    if (!formData.clothingGender) errors.clothingGender = 'Clothing gender is required';
    if (!formData.clothingCategory) errors.clothingCategory = 'Clothing category is required';
    if (!formData.purchaseYear) errors.purchaseYear = 'Purchase year is required';
    return errors;
};

const validateStep = (step, formData) => {
    if (step === 1) return validateBasicListingStep1(formData);
    if (step === 2) return validateClothingStep2(formData);
    if (step === 3) return validateBasicListingStep3(formData);
    return {};
};

const validateAll = (formData) => ({
    ...validateBasicListingStep1(formData),
    ...validateClothingStep2(formData),
    ...validateBasicListingStep3(formData),
});

export default {
    validateStep,
    validateAll,
};
