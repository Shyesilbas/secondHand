import { validateBasicListingStep1, validateBasicListingStep3 } from "./commonListingValidators.js";

const validateBooksStep2 = (formData) => {
    const errors = {};
    if (!formData.author?.trim()) errors.author = 'Author is required';
    if (!formData.genre) errors.genre = 'Genre is required';
    if (!formData.language) errors.language = 'Language is required';
    if (!formData.publicationYear) errors.publicationYear = 'Publication year is required';
    if (!formData.pageCount) errors.pageCount = 'Page count is required';
    if (!formData.format) errors.format = 'Format is required';
    if (!formData.condition) errors.condition = 'Condition is required';
    return errors;
};

const validateStep = (step, formData) => {
    if (step === 1) return validateBasicListingStep1(formData);
    if (step === 2) return validateBooksStep2(formData);
    if (step === 3) return validateBasicListingStep3(formData);
    return {};
};

const validateAll = (formData) => ({
    ...validateBasicListingStep1(formData),
    ...validateBooksStep2(formData),
    ...validateBasicListingStep3(formData),
});

export default {
    validateStep,
    validateAll,
};
