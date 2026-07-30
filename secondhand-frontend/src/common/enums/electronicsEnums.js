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
      String(item?.name ?? '') === strVal
  );

  return found?.label || found?.name || found?.value || strVal;
};

export const getElectronicTypeLabel = (value, electronicTypes = []) => resolveEnumLabel(value, electronicTypes);
export const getElectronicBrandLabel = (value, electronicBrands = []) => resolveEnumLabel(value, electronicBrands);
export const getProcessorLabel = (value, processors = []) => resolveEnumLabel(value, processors);
export const getStorageTypeLabel = (value, storageTypes = []) => resolveEnumLabel(value, storageTypes);
export const getElectronicConditionLabel = (value, electronicConditions = []) => resolveEnumLabel(value, electronicConditions);
export const getElectronicConnectionTypeLabel = (value, connectionTypes = []) => resolveEnumLabel(value, connectionTypes);
