import { post, del, get, put } from '../../common/services/api/request.js';

const AI_REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_AI_TIMEOUT_MS) || 45000;

export const aiChatService = {
  chat: async ({ message, context }) => {
    const body = context ? { message, context } : { message };
    return post('/v1/ai/chats', body, { timeout: AI_REQUEST_TIMEOUT_MS });
  },
  agentQuery: async ({ message, context, uiContext, agentMode = true }) => {
    return post('/v1/ai/agents/query', { message, context, uiContext, agentMode }, { timeout: AI_REQUEST_TIMEOUT_MS });
  },
  newChat: async () => {
    return post('/v1/ai/chats/new', {}, { timeout: 10000 });
  },
  deleteHistory: async () => {
    return del('/v1/ai/chats/history', { timeout: 10000 });
  },
  deleteMemory: async () => {
    return del('/v1/ai/memories', { timeout: 10000 });
  },
  getMemory: async () => {
    return get('/v1/ai/memories', { timeout: 10000 });
  },
  updateMemory: async (dto) => {
    return put('/v1/ai/memories', dto, { timeout: 10000 });
  },
  deleteInterest: async (interest) => {
    return del(`/v1/ai/memories/interests?interest=${encodeURIComponent(interest)}`, { timeout: 10000 });
  }
};