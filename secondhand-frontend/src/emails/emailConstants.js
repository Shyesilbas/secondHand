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

export const getEmailFolderLabel = (filterType) => {
  switch (filterType) {
    case EMAIL_FILTERS.ALL:
      return 'Tüm E-Postalar';
    case EMAIL_FILTERS.ORDERS:
      return 'Siparişler & Satışlar';
    case EMAIL_FILTERS.PAYMENTS:
      return 'Ödemeler & Makbuzlar';
    case EMAIL_FILTERS.OFFERS:
      return 'Pazarlık & Teklifler';
    case EMAIL_FILTERS.ACCOUNT_SECURITY:
      return 'Hesap & Güvenlik';
    case EMAIL_FILTERS.SYSTEM_NOTIFICATIONS:
      return 'Sistem & Bildirimler';
    case EMAIL_FILTERS.LEGAL:
      return 'Sözleşmeler';
    default:
      return 'Gelen Kutusu';
  }
};

