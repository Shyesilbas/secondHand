/**
 * Resolves an enum id/value to its display label using the enums map.
 */
export const resolveEnumLabel = (enums, enumKey, idOrValue) => {
  const list = enums?.[enumKey] || [];
  const target = String(idOrValue ?? '');
  if (!target) return '';
  const found = list.find((x) => String(x?.id ?? x?.value ?? '') === target);
  return String(found?.name || found?.label || '').trim();
};

/**
 * Converts any listing field value to a human-readable string.
 * Used by both the form summary step and the details view.
 */
export const toDisplayText = (value, enums, enumKey) => {
  if (value === null || value === undefined) return null;

  if (Array.isArray(value)) {
    const parts = value
      .map((v) => toDisplayText(v, enums, enumKey))
      .filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
    return parts.length ? parts.join(', ') : null;
  }

  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  if (typeof value === 'object') {
    if (value.label) return String(value.label);
    if (value.name) return String(value.name);
    if (value.value) return String(value.value);
    if (value.id != null && enumKey) {
      const list = enums?.[enumKey] || [];
      const found = list.find((o) => (o.id || o.value) === value.id);
      return found?.label || found?.name || String(value.id);
    }
    return null;
  }

  if (enumKey) {
    const list = enums?.[enumKey] || [];
    const found = list.find((o) => (o.id || o.value) === value);
    if (found) return found.label || found.name || String(value);
  }

  return String(value);
};
