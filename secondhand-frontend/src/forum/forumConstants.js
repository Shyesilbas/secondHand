export const FORUM_CATEGORIES = Object.freeze({
  SUGGESTIONS: 'SUGGESTIONS',
  COMPLAINTS: 'COMPLAINTS',
});

export const FORUM_SORTS = Object.freeze({
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
  CATEGORY: FORUM_CATEGORIES.SUGGESTIONS,
  SORT: FORUM_SORTS.NEW,
  LIST_TAB: FORUM_LIST_TABS.ALL,
});

export const FORUM_CATEGORY_OPTIONS = Object.freeze([
  { id: FORUM_CATEGORIES.SUGGESTIONS, label: 'Suggestions' },
  { id: FORUM_CATEGORIES.COMPLAINTS, label: 'Complaints' },
]);

export const FORUM_SORT_OPTIONS = Object.freeze([
  { id: FORUM_SORTS.NEW, label: 'Newest' },
  { id: FORUM_SORTS.TOP, label: 'Top Voted' },
]);

export const FORUM_THREAD_STATUS_OPTIONS = Object.freeze([
  { id: FORUM_THREAD_STATUSES.OPEN, label: 'Open' },
  { id: FORUM_THREAD_STATUSES.IN_PROGRESS, label: 'In progress' },
  { id: FORUM_THREAD_STATUSES.RESOLVED, label: 'Resolved' },
]);

export const FORUM_MESSAGES = Object.freeze({
  LOAD_THREADS_FAILED: 'Unable to load threads',
  LOAD_THREAD_FAILED: 'Unable to load thread',
  LOAD_COMMENTS_FAILED: 'Unable to load comments',
  ADD_COMMENT_FAILED: 'Unable to add comment',
  PUBLISH_THREAD_FAILED: 'Unable to publish thread',
  CHANGE_STATUS_FAILED: 'Unable to change status',
  DELETE_THREAD_FAILED: 'Unable to delete thread',
  DELETE_THREAD_CONFIRM: 'Delete this thread?',
  NO_THREADS_FOUND: 'No threads found',
  NO_LIKED_THREADS: 'No liked threads',
  NO_COMMENTS_YET: 'No comments yet',
  BE_FIRST_TO_COMMENT: 'Be the first to comment.',
  SELECT_THREAD_TITLE: 'Select a thread',
  SELECT_THREAD_DESCRIPTION: 'Choose a thread from the list to view details.',
  NEW_THREAD: 'New thread',
  FORUM_SETTINGS: 'Forum settings',
  WRITE_COMMENT: 'Write a comment',
  CLOSE: 'Close',
  PUBLISH: 'Publish',
  PUBLISHING: 'Publishing...',
  LOAD_MORE: 'Load more',
});
