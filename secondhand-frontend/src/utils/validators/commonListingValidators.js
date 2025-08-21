export const validateBasicListingStep1 = (formData) => {
    const errors = {};
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    const numericPrice = Number(formData.price);
    if (!numericPrice || numericPrice <= 0) errors.price = 'Valid price is required';
    if (!formData.currency) errors.currency = 'Currency is required';
    return errors;
};

export const validateBasicListingStep3 = (formData) => {
    const errors = {};
    if (!formData.city || !String(formData.city).trim()) errors.city = 'City is required';
    if (!formData.district || !String(formData.district).trim()) errors.district = 'District is required';
    return errors;
};
