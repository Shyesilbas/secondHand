const THREAD_KEY = 'forum.threadAuthorVisibility';
const COMMENT_KEY = 'forum.commentAuthorVisibility';

const normalizeVisibility = (value) => {
  if (value === 'DISPLAY_NAME') return 'DISPLAY_NAME';
  return 'ANONYMOUS';
};

const safeGet = (key) => {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const safeSet = (key, value) => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage?.setItem(key, String(value));
  } catch {
    return;
  }
};

export const getForumVisibilitySettings = () => {
  const threadRaw = safeGet(THREAD_KEY);
  const commentRaw = safeGet(COMMENT_KEY);
  return {
    threadAuthorVisibility: normalizeVisibility(threadRaw),
    commentAuthorVisibility: normalizeVisibility(commentRaw),
  };
};

export const setForumThreadAuthorVisibility = (visibility) => {
  safeSet(THREAD_KEY, normalizeVisibility(visibility));
};

export const setForumCommentAuthorVisibility = (visibility) => {
  safeSet(COMMENT_KEY, normalizeVisibility(visibility));
};

