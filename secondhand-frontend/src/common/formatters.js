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

export const formatCurrencyCompact = (value, currency = 'TRY', options = {}) => {
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
    const maxDigits = options.maximumFractionDigits ?? options.decimals ?? 1;
    const minDigits = options.minimumFractionDigits ?? 0;

    if (numValue >= 1000000) {
        const formatted = (numValue / 1000000).toLocaleString(config.locale, {
            minimumFractionDigits: minDigits,
            maximumFractionDigits: maxDigits
        });
        return `${config.symbol}${formatted}M`;
    } else if (numValue >= 1000) {
        const formatted = (numValue / 1000).toLocaleString(config.locale, {
            minimumFractionDigits: minDigits,
            maximumFractionDigits: maxDigits
        });
        return `${config.symbol}${formatted}K`;
    } else {
        const formatted = numValue.toLocaleString(config.locale, {
            minimumFractionDigits: minDigits,
            maximumFractionDigits: Math.min(maxDigits, 2)
        });
        return `${config.symbol}${formatted}`;
    }
};

export {
    formatDate,
    formatDateTime,
    formatShortDate,
    formatShortDateTime,
    formatLongDate,
    formatMonthYear,
    formatSmartEmailDate,
    formatBirthdateInput,
    formatRelativeTime,
} from './utils/dateFormat.js';

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

