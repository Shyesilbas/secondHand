export const getAuraChatStorageKey = (userId) =>
  userId != null ? `aura.chat.started.${userId}` : 'aura.chat.started.anonymous';

/** Oturum mesajları — sadece bu tarayıcıda; çoklu “sohbet listesi” için sunucu tarafı gerekir. */
export const getAuraChatMessagesStorageKey = (userId, surface) =>
  userId != null ? `aura.chat.messages.${surface}.${userId}` : `aura.chat.messages.${surface}.anonymous`;

export const clearAuraPersistedMessages = (userId, surface) => {
  try {
    localStorage.removeItem(getAuraChatMessagesStorageKey(userId, surface));
  } catch {
    /* ignore */
  }
};

export const createAuraChatId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const createChatMessage = ({ role, content, typing = false, meta = undefined }) => ({
  id: createAuraChatId(role === 'user' ? 'user' : 'aura'),
  role,
  content,
  typing,
  meta,
  createdAt: Date.now(),
});
