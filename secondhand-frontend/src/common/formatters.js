export const formatCurrency = (value, currency = 'TRY', options = {}) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (numValue === null || numValue === undefined || isNaN(numValue)) {
    console.warn('Invalid value for currency formatting:', value);
    return '0.00 ₺';
  }

  const symbols = {
    'TRY': '₺',
    'USD': '$',
    'EUR': '€'
  };

  const symbol = symbols[currency] || currency;

  const formatted = numValue.toLocaleString('tr-TR', {
    minimumFractionDigits: options.minimumFractionDigits || 2,
    maximumFractionDigits: options.maximumFractionDigits || 2
  });

  return `${formatted} ${symbol}`;
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

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // Handle dd/MM/yyyy format from backend
  if (typeof dateString === 'string' && dateString.includes('/')) {
    const [day, month, year] = dateString.split('/');
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('tr-TR');
  }
  
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR');
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

