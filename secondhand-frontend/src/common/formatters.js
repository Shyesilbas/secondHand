/** Parses "35.000,00" or "35000" to number. */
export const parsePrice = (str) => {
 if (str == null || str === '') return null;
 const s = String(str).trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
 const n = parseFloat(s);
 return Number.isFinite(n) ? n : null;
};

/** Formats number as 35.000,00 (tr-TR). Use everywhere for price display. */
export const formatPrice = (value, options = {}) => {
 const num = typeof value === 'string' ? parsePrice(value) : value;
 if (num == null || !Number.isFinite(num)) return '';
 return num.toLocaleString('tr-TR', {
 minimumFractionDigits: options.decimals ?? 2,
 maximumFractionDigits: options.decimals ?? 2,
 });
};

export const formatCurrency = (value, currency = 'TRY', options = {}) => {
 const numValue = typeof value === 'string' ? parsePrice(value) : value;
 if (numValue == null || !Number.isFinite(numValue)) return currency === 'TRY' ? '₺0,00' : '0,00';
 const formatted = formatPrice(numValue, { decimals: options.minimumFractionDigits ?? options.maximumFractionDigits ?? 2 });
 const symbols = { TRY: '₺', USD: '$', EUR: '€' };
 const sym = symbols[currency] || symbols.TRY;
 return `${sym}${formatted}`;
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

export const formatDateTime = (dateString, locale = 'tr-TR') => {
 if (!dateString) return '';
 const date = new Date(dateString);
 return date.toLocaleDateString(locale, {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 hour12: false,
 timeZone: 'Europe/Istanbul'
 });
};

export const formatDate = (dateString) => {
 if (!dateString) return '';
 
 if (typeof dateString === 'string' && dateString.includes('/')) {
 const [day, month, year] = dateString.split('/');
 const date = new Date(year, month - 1, day); return date.toLocaleDateString('tr-TR');
 }
 
 const date = new Date(dateString);
 return date.toLocaleDateString('tr-TR');
};

export const cleanObject = (obj) => {
 return Object.entries(obj || {}).reduce((acc, [key, value]) => {
 if (value === '' || value === null || value === undefined) {
 return acc;
 }
 // Boş array'leri temizleme - filtreler için gerekli olabilir
 // if (Array.isArray(value) && value.length === 0) {
 // return acc;
 // }
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

