import { validateBasicListingStep1, validateBasicListingStep3 } from "../listing/commonListingValidators.js";

const validateSportsStep2 = (formData) => {
    const errors = {};
    if (!formData.disciplineId) errors.disciplineId = 'Sport discipline is required';
    if (!formData.equipmentTypeId) errors.equipmentTypeId = 'Sport equipment type is required';
    if (!formData.conditionId) errors.conditionId = 'Sport condition is required';
    return errors;
};

const validateStep = (step, formData) => {
    if (step === 1) return validateBasicListingStep1(formData);
    if (step === 2) return validateSportsStep2(formData);
    if (step === 3) return validateBasicListingStep3(formData);
    return {};
};

const validateAll = (formData) => ({
    ...validateBasicListingStep1(formData),
    ...validateSportsStep2(formData),
    ...validateBasicListingStep3(formData),
});

export default {
    validateStep,
    validateAll,
};
