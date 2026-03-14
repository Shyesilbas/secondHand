import { post, del } from '../../common/services/api/request.js';

export const aiChatService = {
  chat: async ({ message, context }) => {
    const body = context ? { message, context } : { message };
    return post('/ai/chat', body, { timeout: 10000 });
  },
  agentQuery: async ({ message, context, uiContext, agentMode = true }) => {
    return post('/ai/agent/query', { message, context, uiContext, agentMode }, { timeout: 10000 });
  },
  newChat: async () => {
    return post('/ai/chat/new', {}, { timeout: 10000 });
  },
  deleteHistory: async () => {
    return del('/ai/chat/history', { timeout: 10000 });
  },
  deleteMemory: async () => {
    return del('/ai/memory', { timeout: 10000 });
  },
};

