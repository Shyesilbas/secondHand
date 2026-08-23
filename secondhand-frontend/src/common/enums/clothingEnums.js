export const resolveEnumLabel = (value, enumArray) => {
 if (!value) return '';
 if (typeof value === 'object') {
 return value.label || value.name || value.value || value.id || '';
 }
 if (!Array.isArray(enumArray) || enumArray.length === 0) return String(value);

 const strVal = String(value);
 const found = enumArray.find(
 (item) =>
 String(item?.value ?? '') === strVal ||
 String(item?.id ?? '') === strVal ||
 String(item?.name ?? '') === strVal ||
 String(item?.key ?? '') === strVal
 );

 return found?.label || found?.name || found?.value || strVal;
};

export const getClothingBrandLabel = (value, clothingBrands = []) => resolveEnumLabel(value, clothingBrands);
export const getClothingTypeLabel = (value, clothingTypes = []) => resolveEnumLabel(value, clothingTypes);
export const getClothingSizeLabel = (value, clothingSizes = []) => resolveEnumLabel(value, clothingSizes);
export const getClothingConditionLabel = (value, clothingConditions = []) => resolveEnumLabel(value, clothingConditions);
export const getClothingGenderLabel = (value, clothingGenders = []) => resolveEnumLabel(value, clothingGenders);
export const getClothingCategoryLabel = (value, clothingCategories = []) => resolveEnumLabel(value, clothingCategories);
