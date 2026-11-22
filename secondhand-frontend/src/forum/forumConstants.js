export const FORUM_CATEGORIES = Object.freeze({
  ALL: '',
  SUGGESTIONS: 'SUGGESTIONS',
  COMPLAINTS: 'COMPLAINTS',
});

const FORUM_SORTS = Object.freeze({
  NEW: 'NEW',
  TOP: 'TOP',
});

export const FORUM_LIST_TABS = Object.freeze({
  ALL: 'ALL',
  LIKED: 'LIKED',
});

export const FORUM_THREAD_STATUSES = Object.freeze({
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
});

export const FORUM_REACTIONS = Object.freeze({
  LIKE: 'LIKE',
  DISLIKE: 'DISLIKE',
  CLEAR: 'CLEAR',
});

export const FORUM_AUTHOR_VISIBILITY = Object.freeze({
  ANONYMOUS: 'ANONYMOUS',
  DISPLAY_NAME: 'DISPLAY_NAME',
});

export const FORUM_DEFAULTS = Object.freeze({
  PAGE: 0,
  PAGE_SIZE: 20,
  CATEGORY: FORUM_CATEGORIES.ALL,
  SORT: FORUM_SORTS.NEW,
  LIST_TAB: FORUM_LIST_TABS.ALL,
});

export const FORUM_CATEGORY_OPTIONS = Object.freeze([
  { id: FORUM_CATEGORIES.ALL, labelKey: 'forum_cat_all', label: 'Tümü' },
  { id: FORUM_CATEGORIES.SUGGESTIONS, labelKey: 'forum_cat_suggestions', label: 'Öneriler' },
  { id: FORUM_CATEGORIES.COMPLAINTS, labelKey: 'forum_cat_complaints', label: 'Şikayetler' },
]);

export const FORUM_SORT_OPTIONS = Object.freeze([
  { id: FORUM_SORTS.NEW, labelKey: 'forum_sort_new', label: 'En yeni' },
  { id: FORUM_SORTS.TOP, labelKey: 'forum_sort_top', label: 'En çok beğenilen' },
]);

export const FORUM_THREAD_STATUS_OPTIONS = Object.freeze([
  { id: FORUM_THREAD_STATUSES.OPEN, labelKey: 'forum_status_open', label: 'Açık' },
  { id: FORUM_THREAD_STATUSES.IN_PROGRESS, labelKey: 'forum_status_in_progress', label: 'İnceleniyor' },
  { id: FORUM_THREAD_STATUSES.RESOLVED, labelKey: 'forum_status_resolved', label: 'Çözüldü' },
]);

export const formatForumAuthor = (t, rawAuthor) => {
  const value = String(rawAuthor || '').trim();
  if (!value || value.toLowerCase() === 'anonymous') {
    return t('anonymous', 'Anonim');
  }
  return value;
};

export const FORUM_MESSAGES = Object.freeze({
  LOAD_THREADS_FAILED: 'Konular yüklenemedi.',
  LOAD_THREAD_FAILED: 'Konu yüklenemedi.',
  LOAD_COMMENTS_FAILED: 'Yorumlar yüklenemedi.',
  ADD_COMMENT_FAILED: 'Yorum eklenemedi.',
  PUBLISH_THREAD_FAILED: 'Konu yayınlanamadı.',
  CHANGE_STATUS_FAILED: 'Konu durumu güncellenemedi.',
  DELETE_THREAD_FAILED: 'Konu silinemedi.',
  REACTION_FAILED: 'Tepki kaydedilemedi.',
});
