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

export const EMAIL_FOLDER_ITEMS = Object.freeze([
  { id: EMAIL_FILTERS.ALL, label: 'Tümü' },
  { id: EMAIL_FILTERS.ORDERS, label: 'Siparişler' },
  { id: EMAIL_FILTERS.PAYMENTS, label: 'Ödemeler' },
  { id: EMAIL_FILTERS.OFFERS, label: 'Teklifler' },
  { id: EMAIL_FILTERS.ACCOUNT_SECURITY, label: 'Güvenlik' },
  { id: EMAIL_FILTERS.SYSTEM_NOTIFICATIONS, label: 'Bildirimler' },
  { id: EMAIL_FILTERS.LEGAL, label: 'Sözleşmeler' }
]);

export const EMAIL_DEFAULTS = Object.freeze({
  PAGE: 0,
  PAGE_SIZE: 20,
});

/** React Query: posta kutusu listesi için stale süre */
export const EMAIL_QUERY_STALE_MS = 2 * 60 * 1000;

export const EMAIL_MESSAGES = Object.freeze({
  LOAD_ERROR_TITLE: 'E-postalar yüklenemedi',
  NO_EMAILS_TITLE: 'E-posta bulunamadı',
  NO_EMAILS_ALL: 'Henüz gelen bir e-postanız bulunmuyor.',
  EMAIL_ID_MISSING: 'E-posta ID eksik.',
});

export const getEmailFolderLabel = (filterType) => {
  const match = EMAIL_FOLDER_ITEMS.find((item) => item.id === filterType);
  return match ? match.label : 'Gelen kutusu';
};
