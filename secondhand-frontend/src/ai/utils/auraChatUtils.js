export const getAuraChatStorageKey = (userId) =>
  userId != null ? `aura.chat.started.${userId}` : 'aura.chat.started.anonymous';

export const createAuraChatId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const createChatMessage = ({ role, content, typing = false }) => ({
  id: createAuraChatId(role === 'user' ? 'user' : 'aura'),
  role,
  content,
  typing,
  createdAt: Date.now(),
});
