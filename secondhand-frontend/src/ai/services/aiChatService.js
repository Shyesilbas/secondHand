import { requestWithParams } from '../../common/services/api/request.js';

export const aiChatService = {
  chat: async ({ userId, message }) => {
    if (userId == null) {
      throw new Error('userId is required');
    }
    return requestWithParams('post', '/ai/chat', { userId }, { message }, { timeout: 10000 });
  },
  newChat: async ({ userId }) => {
    if (userId == null) {
      throw new Error('userId is required');
    }
    return requestWithParams('post', '/ai/chat/new', { userId }, {}, { timeout: 10000 });
  },
  deleteHistory: async ({ userId }) => {
    if (userId == null) {
      throw new Error('userId is required');
    }
    return requestWithParams('delete', '/ai/chat/history', { userId }, undefined, { timeout: 10000 });
  },
  deleteMemory: async ({ userId }) => {
    if (userId == null) {
      throw new Error('userId is required');
    }
    return requestWithParams('delete', '/ai/memory', { userId }, undefined, { timeout: 10000 });
  },
};

