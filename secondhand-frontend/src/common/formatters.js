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

// Generic enum label resolver — useEnums-free version for non-React contexts
export const resolveEnumLabel = (enums, enumKey, value, fallback = null) => {
  if (!value) return fallback ?? '';
  const list = enums?.[enumKey] || [];
  const found = list.find((o) => o?.value === value);
  return found?.label || fallback || value;
};

// Title-case a backend enum code like "IN_TRANSIT" -> "In Transit"
export const titleCaseEnumCode = (code) => {
  if (!code) return '';
  const lower = String(code).replaceAll('_', ' ').toLowerCase();
  return lower.replace(/\b\w/g, (m) => m.toUpperCase());
};

// Replace raw enum codes within HTML/text content using enums maps; falls back to title-casing
export const replaceEnumCodesInHtml = (html, enums = {}, keys = []) => {
  if (!html) return '';
  let result = String(html);
  const targetKeys = keys.length ? keys : ['shippingStatuses', 'paymentTypes', 'emailTypes'];
  targetKeys.forEach((key) => {
    const list = enums?.[key] || [];
    list.forEach(({ value, label }) => {
      if (!value) return;
      const pattern = new RegExp(`\\b${value}\\b`, 'g');
      result = result.replace(pattern, label || titleCaseEnumCode(value));
    });
  });
  // Generic fallback for ALL_CAPS tokens up to 3 words with underscores
  result = result.replace(/\b[A-Z]+(?:_[A-Z]+)*\b/g, (m) => titleCaseEnumCode(m));
  return result;
};

