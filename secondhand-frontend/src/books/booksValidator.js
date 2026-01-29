import { validateBasicListingStep1, validateBasicListingStep3 } from "../listing/commonListingValidators.js";

const validateBooksStep2 = (formData) => {
    const errors = {};
    if (!formData.author?.trim()) errors.author = 'Author is required';
    if (!formData.bookTypeId) errors.bookTypeId = 'Book type is required';
    if (!formData.genreId) errors.genreId = 'Genre is required';
    if (!formData.languageId) errors.languageId = 'Language is required';
    if (!formData.publicationYear) errors.publicationYear = 'Publication year is required';
    if (!formData.pageCount) errors.pageCount = 'Page count is required';
    if (!formData.formatId) errors.formatId = 'Format is required';
    if (!formData.conditionId) errors.conditionId = 'Condition is required';
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
