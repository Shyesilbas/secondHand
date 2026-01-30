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

    const typeName = String(formData._clothingTypeName || '').toUpperCase();
    const footwear = ['SHOES', 'SNEAKERS', 'BOOTS', 'SANDALS', 'HEELS', 'FLATS'].includes(typeName);
    const accessory = ['HAT', 'CAP', 'SCARF', 'GLOVES', 'BELT', 'TIE', 'BAG'].includes(typeName);
    const apparel = Boolean(typeName) && !footwear && !accessory;

    if (footwear) {
        const shoeSize = parseInt(formData.shoeSizeEu);
        if (!shoeSize || shoeSize < 20 || shoeSize > 55) errors.shoeSizeEu = 'Shoe size (EU) is required';
    }

    if (apparel) {
        if (!formData.size) errors.size = 'Size is required';
    }

    if (formData.material && String(formData.material).trim().length > 120) errors.material = 'Material is too long';

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
