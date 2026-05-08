/** Merkezi tarih formatı — tr-TR; forum / yorum vb. tek kaynak */

const DEFAULT_LOCALE = 'tr-TR';

const toDate = (value) => {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Örn. 08 May 2025 */
export const formatShortDate = (value) => {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleDateString(DEFAULT_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/** Kısa tarih + saat */
export const formatShortDateTime = (value) => {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleString(DEFAULT_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Uzun tarih (yorumlar) */
export const formatLongDate = (value) => {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleDateString(DEFAULT_LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
