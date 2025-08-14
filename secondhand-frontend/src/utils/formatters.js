export const formatCurrency = (amount, currency = 'TRY', options = {}) => {
  if (amount === null || amount === undefined || amount === '') return '';
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...options,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Remove empty or nullish fields from an object. Useful before sending filters/requests
export const cleanObject = (obj) => {
  return Object.entries(obj || {}).reduce((acc, [key, value]) => {
    if (value === '' || value === null || value === undefined) {
      return acc;
    }
    if (Array.isArray(value) && value.length === 0) {
      return acc;
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      const cleaned = cleanObject(value);
      if (Object.keys(cleaned).length === 0) {
        return acc;
      }
      acc[key] = cleaned;
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});
};

