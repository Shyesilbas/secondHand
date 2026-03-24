const FORUM_LOCALE = 'tr-TR';

export const formatForumDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(FORUM_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatForumDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(FORUM_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
