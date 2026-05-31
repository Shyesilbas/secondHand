export const EMAIL_FILTERS = Object.freeze({
  ALL: 'ALL',
  ACCOUNT_SECURITY: 'ACCOUNT_SECURITY',
  LEGAL: 'LEGAL',
  OFFERS: 'OFFERS',
  PAYMENTS: 'PAYMENTS',
  SYSTEM_NOTIFICATIONS: 'SYSTEM_NOTIFICATIONS',
  PROMOTIONS: 'PROMOTIONS'
});

export const EMAIL_DEFAULTS = Object.freeze({
  PAGE: 0,
  PAGE_SIZE: 20,
});

/** React Query: posta kutusu listesi için stale süre */
export const EMAIL_QUERY_STALE_MS = 2 * 60 * 1000;

export const EMAIL_MESSAGES = Object.freeze({
  LOAD_ERROR_TITLE: 'Error loading emails',
  NO_EMAILS_TITLE: 'No Emails Found',
  NO_EMAILS_ALL: "You haven't received any emails yet.",
  EMAIL_ID_MISSING: 'Email ID missing.',
});
