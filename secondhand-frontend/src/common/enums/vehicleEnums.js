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

export const getCarBrandLabel = (value, carBrands = []) => resolveEnumLabel(value, carBrands);
export const getFuelTypeLabel = (value, fuelTypes = []) => resolveEnumLabel(value, fuelTypes);
export const getColorLabel = (value, colors = []) => resolveEnumLabel(value, colors);
export const getGearTypeLabel = (value, gearTypes = []) => resolveEnumLabel(value, gearTypes);
export const getBodyTypeLabel = (value, bodyTypes = []) => resolveEnumLabel(value, bodyTypes);
export const getDrivetrainLabel = (value, drivetrains = []) => resolveEnumLabel(value, drivetrains);
export const getDoorsLabel = (value, doors = []) => resolveEnumLabel(value, doors);
export const getSeatCountLabel = (value, seatCounts = []) => resolveEnumLabel(value, seatCounts);
