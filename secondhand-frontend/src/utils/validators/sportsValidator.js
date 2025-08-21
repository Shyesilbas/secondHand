import { validateBasicListingStep1, validateBasicListingStep3 } from "./commonListingValidators.js";

const validateSportsStep2 = (formData) => {
    const errors = {};
    if (!formData.discipline) errors.discipline = 'Discipline is required';
    if (!formData.equipmentType) errors.equipmentType = 'Equipment type is required';
    if (!formData.condition) errors.condition = 'Condition is required';
    return errors;
};

const validateStep = (step, formData) => {
    if (step === 1) return validateBasicListingStep1(formData);
    if (step === 2) return validateSportsStep2(formData);
    if (step === 3) return validateBasicListingStep3(formData);
    return {};
};

const validateSportsAll = (formData) => ({
    ...validateBasicListingStep1(formData),
    ...validateSportsStep2(formData),
    ...validateBasicListingStep3(formData),
});

export default {
    validateStep,
    validateSportsAll,
};
