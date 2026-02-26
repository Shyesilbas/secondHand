import { post, del } from '../../common/services/api/request.js';

export const aiChatService = {
  chat: async ({ userId, message, context }) => {
    if (userId == null) {
      throw new Error('userId is required');
    }
    const body = context ? { message, context } : { message };
    return post('/ai/chat', body, { params: { userId }, timeout: 10000 });
  },
  newChat: async ({ userId }) => {
    if (userId == null) {
      throw new Error('userId is required');
    }
    return post('/ai/chat/new', {}, { params: { userId }, timeout: 10000 });
  },
  deleteHistory: async ({ userId }) => {
    if (userId == null) {
      throw new Error('userId is required');
    }
    return del('/ai/chat/history', { params: { userId }, timeout: 10000 });
  },
  deleteMemory: async ({ userId }) => {
    if (userId == null) {
      throw new Error('userId is required');
    }
    return del('/ai/memory', { params: { userId }, timeout: 10000 });
  },
};

