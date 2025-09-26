export const formatCurrency = (value, currency = 'TRY', options = {}) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (numValue === null || numValue === undefined || isNaN(numValue)) {
    console.warn('Invalid value for currency formatting:', value);
    return '₺0,00';
  }

  const currencyConfig = {
    'TRY': {
      symbol: '₺',
      locale: 'tr-TR',
      position: 'before'
    },
    'USD': {
      symbol: '$',
      locale: 'en-US',
      position: 'before'
    },
    'EUR': {
      symbol: '€',
      locale: 'de-DE',
      position: 'after'
    }
  };

  const config = currencyConfig[currency] || currencyConfig['TRY'];
  
  const formatted = numValue.toLocaleString(config.locale, {
    minimumFractionDigits: options.minimumFractionDigits || 2,
    maximumFractionDigits: options.maximumFractionDigits || 2,
    style: 'decimal'
  });

  if (config.position === 'before') {
    return `${config.symbol}${formatted}`;
  } else {
    return `${formatted} ${config.symbol}`;
  }
};

export const formatCurrencyCompact = (value, currency = 'TRY') => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (numValue === null || numValue === undefined || isNaN(numValue)) {
    return '₺0';
  }

  const currencyConfig = {
    'TRY': { symbol: '₺', locale: 'tr-TR' },
    'USD': { symbol: '$', locale: 'en-US' },
    'EUR': { symbol: '€', locale: 'de-DE' }
  };

  const config = currencyConfig[currency] || currencyConfig['TRY'];
  
  if (numValue >= 1000000) {
    const formatted = (numValue / 1000000).toLocaleString(config.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    });
    return `${config.symbol}${formatted}M`;
  } else if (numValue >= 1000) {
    const formatted = (numValue / 1000).toLocaleString(config.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    });
    return `${config.symbol}${formatted}K`;
  } else {
    const formatted = numValue.toLocaleString(config.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return `${config.symbol}${formatted}`;
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

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
    if (typeof dateString === 'string' && dateString.includes('/')) {
    const [day, month, year] = dateString.split('/');
    const date = new Date(year, month - 1, day);     return date.toLocaleDateString('tr-TR');
  }
  
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR');
};

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

export const resolveEnumLabel = (enums, enumKey, value, fallback = null) => {
  if (!value) return fallback ?? '';
  const list = enums?.[enumKey] || [];
  const found = list.find((o) => o?.value === value);
  return found?.label || fallback || value;
};

export const titleCaseEnumCode = (code) => {
  if (!code) return '';
  const lower = String(code).replaceAll('_', ' ').toLowerCase();
  return lower.replace(/\b\w/g, (m) => m.toUpperCase());
};

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
  result = result.replace(/\b[A-Z]+(?:_[A-Z]+)*\b/g, (m) => titleCaseEnumCode(m));
  return result;
};

export const formatPricesInHtml = (html, currency = 'TRY') => {
  if (!html) return '';
  let result = String(html);
  
  const pricePatterns = [
    // Pattern for explicit prices with currency: "15000.00 TRY", "15000 TRY", "15000.00 USD", etc.
    /(\d+(?:\.\d{2})?)\s*(TRY|USD|EUR)\b/g,
    // Pattern for prices in parentheses with currency: "(15000.00 TRY)", "(15000 USD)", etc.
    /\((\d+(?:\.\d{2})?)\s*(TRY|USD|EUR)\)/g,
    // Pattern for prices with currency symbols: "₺15000.00", "$15000", "€15000.00"
    /([₺$€])\s*(\d+(?:\.\d{2})?)/g,
    // Pattern for prices with "price", "cost", "amount" keywords nearby
    /(?:price|cost|amount|total|fee|charge|payment):\s*(\d+(?:\.\d{2})?)/gi,
    // Pattern for prices with "TL", "lira" keywords
    /(\d+(?:\.\d{2})?)\s*(?:TL|lira)\b/gi
  ];
  
  pricePatterns.forEach((pattern, index) => {
    result = result.replace(pattern, (match, amount, curr) => {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) return match;
      
      let actualCurrency = currency;
      let formattedPrice;
      
      if (index === 0 || index === 1) {
        // Explicit currency patterns
        actualCurrency = curr || currency;
        formattedPrice = formatCurrency(numericAmount, actualCurrency);
        if (index === 1) {
          return `(${formattedPrice})`;
        }
      } else if (index === 2) {
        // Currency symbol patterns
        const symbolMap = { '₺': 'TRY', '$': 'USD', '€': 'EUR' };
        actualCurrency = symbolMap[amount] || currency;
        formattedPrice = formatCurrency(numericAmount, actualCurrency);
      } else {
        // Keyword patterns - use default currency
        formattedPrice = formatCurrency(numericAmount, currency);
      }
      
      return formattedPrice;
    });
  });
  
  return result;
};

