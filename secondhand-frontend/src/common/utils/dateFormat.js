import i18n from '../../i18n';

const getLocale = (overrideLocale) => {
  if (overrideLocale) return overrideLocale;
  const currentLng = i18n?.language || 'tr';
  return currentLng.startsWith('tr') ? 'tr-TR' : 'en-US';
};

const toDate = (value) => {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Örn. 08 May 2025 */
export const formatShortDate = (value, locale) => {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleDateString(getLocale(locale), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/** Kısa tarih + saat */
export const formatShortDateTime = (value, locale) => {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleString(getLocale(locale), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Uzun tarih (yorumlar) */
export const formatLongDate = (value, locale) => {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleDateString(getLocale(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/** Otomatik GG/AA/YYYY slash formatlama (Girdi alanları için) */
export const formatBirthdateInput = (value, prevValue = '') => {
  if (!value) return '';
  const isDeleting = value.length < prevValue.length;

  if (isDeleting) {
    if (prevValue.endsWith('/') && value.length === prevValue.length - 1) {
      return value.slice(0, -1);
    }
    return value;
  }

  const clean = value.replace(/\D/g, '').substring(0, 8);
  const day = clean.substring(0, 2);
  const month = clean.substring(2, 4);
  const year = clean.substring(4, 8);

  if (clean.length > 4) {
    return `${day}/${month}/${year}`;
  } else if (clean.length > 2) {
    return `${day}/${month}`;
  }
  return clean;
};
