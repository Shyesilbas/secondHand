import { validateBasicListingStep1, validateBasicListingStep3 } from "../listing/commonListingValidators.js";

const validateClothingStep2 = (formData) => {
    const errors = {};
    if (!formData.brand) errors.brand = 'Brand is required';
    if (!formData.clothingType) errors.clothingType = 'Type is required';
    if (!formData.color) errors.color = 'Color is required';
    if (!formData.condition) errors.condition = 'Condition is required';
    if (!formData.purchaseDate) errors.purchaseDate = 'Purchase date is required';
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
