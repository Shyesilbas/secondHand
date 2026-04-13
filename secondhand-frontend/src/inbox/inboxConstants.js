export const INBOX_TABS = Object.freeze({
  EMAILS: 'emails',
  NOTIFICATIONS: 'notifications',
  CHAT: 'chat',
});

const ALLOWED = new Set(Object.values(INBOX_TABS));

export const normalizeInboxTab = (raw) => {
  const t = raw ? String(raw).toLowerCase().trim() : '';
  return ALLOWED.has(t) ? t : INBOX_TABS.EMAILS;
};
