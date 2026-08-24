export const EMAIL_FILTERS = Object.freeze({
  ALL: 'ALL',
  ORDERS: 'ORDERS',
  PAYMENTS: 'PAYMENTS',
  OFFERS: 'OFFERS',
  ACCOUNT_SECURITY: 'ACCOUNT_SECURITY',
  SYSTEM_NOTIFICATIONS: 'SYSTEM_NOTIFICATIONS',
  LEGAL: 'LEGAL',
  PROMOTIONS: 'PROMOTIONS'
});

export const EMAIL_DEFAULTS = Object.freeze({
  PAGE: 0,
  PAGE_SIZE: 20,
});

/** React Query: posta kutusu listesi için stale süre */
export const EMAIL_QUERY_STALE_MS = 2 * 60 * 1000;

export const EMAIL_MESSAGES = Object.freeze({
  LOAD_ERROR_TITLE: 'E-postalar yüklenemedi',
  NO_EMAILS_TITLE: 'E-posta Bulunamadı',
  NO_EMAILS_ALL: 'Henüz gelen bir e-postanız bulunmuyor.',
  EMAIL_ID_MISSING: 'E-posta ID eksik.',
});
