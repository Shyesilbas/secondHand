/** Merkezi tarih formatı — tr-TR; forum / yorum / sipariş vb. tek kaynak */

const DEFAULT_LOCALE = 'tr-TR';

const toDate = (value) => {
 if (value == null || value === '') return null;
 if (value instanceof Date) {
 return Number.isNaN(value.getTime()) ? null : value;
 }
 if (typeof value === 'string' && value.includes('/')) {
 const [day, month, year] = value.split('/');
 const parsed = new Date(year, month - 1, day);
 if (!Number.isNaN(parsed.getTime())) return parsed;
 }
 const d = new Date(value);
 return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value, locale = DEFAULT_LOCALE) => {
 const d = toDate(value);
 if (!d) return '';
 return d.toLocaleDateString(locale);
};

export const formatDateTime = (value, locale = DEFAULT_LOCALE) => {
 const d = toDate(value);
 if (!d) return '';
 return d.toLocaleDateString(locale, {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 hour12: false,
 timeZone: 'Europe/Istanbul',
 });
};

/** Örn. 08 May 2025 */
export const formatShortDate = (value, locale = DEFAULT_LOCALE) => {
 const d = toDate(value);
 if (!d) return '';
 return d.toLocaleDateString(locale, {
 day: '2-digit',
 month: 'short',
 year: 'numeric',
 });
};

/** Kısa tarih + saat */
export const formatShortDateTime = (value, locale = DEFAULT_LOCALE) => {
 const d = toDate(value);
 if (!d) return '';
 return d.toLocaleString(locale, {
 day: '2-digit',
 month: 'short',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 });
};

/** Uzun tarih (yorumlar / siparişler) */
export const formatLongDate = (value, locale = DEFAULT_LOCALE) => {
 const d = toDate(value);
 if (!d) return '';
 return d.toLocaleDateString(locale, {
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 });
};

/** Ay + Yıl (örn. Mayıs 2025) */
export const formatMonthYear = (value, locale = DEFAULT_LOCALE) => {
 const d = toDate(value);
 if (!d) return '';
 return d.toLocaleDateString(locale, {
 month: 'long',
 year: 'numeric',
 });
};

/** Aynı gün ise saat, aynı yıl ise gün+ay, aksi halde gün+ay+yıl */
export const formatSmartEmailDate = (value, locale = DEFAULT_LOCALE) => {
 const d = toDate(value);
 if (!d) return '';
 const now = new Date();
 const sameDay =
 d.getFullYear() === now.getFullYear() &&
 d.getMonth() === now.getMonth() &&
 d.getDate() === now.getDate();
 if (sameDay) {
 return d.toLocaleTimeString(locale, {
 hour: '2-digit',
 minute: '2-digit',
 });
 }
 const sameYear = d.getFullYear() === now.getFullYear();
 return d.toLocaleDateString(locale, {
 day: 'numeric',
 month: 'short',
 ...(sameYear ? {} : { year: 'numeric' }),
 });
};

export const formatBirthdateInput = (value) => {
 if (!value) return '';
 const cleaned = String(value).replace(/\D/g, '');
 if (cleaned.length <= 2) return cleaned;
 if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
 return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}.${cleaned.slice(4, 8)}`;
};

export const formatRelativeTime = (value, locale = 'en') => {
 const d = toDate(value);
 if (!d) return '';
 const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
 const absSec = Math.abs(diffSec);
 const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
 if (absSec < 60) return rtf.format(diffSec, 'second');
 const diffMin = Math.round(diffSec / 60);
 if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
 const diffHour = Math.round(diffMin / 60);
 if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
 const diffDay = Math.round(diffHour / 24);
 if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day');
 const diffMonth = Math.round(diffDay / 30);
 if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, 'month');
 return rtf.format(Math.round(diffDay / 365), 'year');
};
