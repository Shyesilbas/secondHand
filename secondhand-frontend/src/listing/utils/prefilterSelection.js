/** Enum/id seçiminde 0 geçerli olabilir; Boolean(0) === false yüzünden wizard kilitlenmesin */
export function isPrefilterValueFilled(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return !Number.isNaN(value);
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}
