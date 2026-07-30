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

export const getRealEstateTypeLabel = (value, realEstateTypes = []) => resolveEnumLabel(value, realEstateTypes);
export const getRealEstateAdTypeLabel = (value, realEstateAdTypes = []) => resolveEnumLabel(value, realEstateAdTypes);
export const getHeatingTypeLabel = (value, heatingTypes = []) => resolveEnumLabel(value, heatingTypes);
export const getOwnerTypeLabel = (value, ownerTypes = []) => resolveEnumLabel(value, ownerTypes);
