export const validateBasicListingStep1 = (formData) => {
    const errors = {};
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    const numericPrice = Number(formData.price);
    if (!numericPrice || numericPrice <= 0) errors.price = 'Valid price is required';
    if (!formData.currency) errors.currency = 'Currency is required';
    return errors;
};
