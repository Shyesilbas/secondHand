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

export const getBookTypeLabel = (value, bookTypes = []) => resolveEnumLabel(value, bookTypes);
export const getBookGenreLabel = (value, bookGenres = []) => resolveEnumLabel(value, bookGenres);
export const getBookLanguageLabel = (value, bookLanguages = []) => resolveEnumLabel(value, bookLanguages);
export const getBookFormatLabel = (value, bookFormats = []) => resolveEnumLabel(value, bookFormats);
export const getBookConditionLabel = (value, bookConditions = []) => resolveEnumLabel(value, bookConditions);
