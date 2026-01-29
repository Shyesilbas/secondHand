import { requestWithParams } from '../../common/services/api/request.js';

export const aiChatService = {
  chat: async ({ userId, message }) => {
    if (userId == null) {
      throw new Error('userId is required');
    }
    return requestWithParams('post', '/ai/chat', { userId }, { message });
  },
};

