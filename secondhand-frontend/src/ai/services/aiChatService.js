import { post, del, get, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

const AI_REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_AI_TIMEOUT_MS) || 45000;

export const aiChatService = {
    chat: async ({ message, context }) => {
        const body = context ? { message, context } : { message };
        return post(API_ENDPOINTS.AI.CHATS, body, { timeout: AI_REQUEST_TIMEOUT_MS });
    },
    agentQuery: async ({ message, context, uiContext, agentMode = true }) => {
        return post(API_ENDPOINTS.AI.AGENT_QUERY, { message, context, uiContext, agentMode }, { timeout: AI_REQUEST_TIMEOUT_MS });
    },
    newChat: async () => {
        return post(API_ENDPOINTS.AI.NEW_CHAT, {}, { timeout: 10000 });
    },
    deleteHistory: async () => {
        return del(API_ENDPOINTS.AI.CHAT_HISTORY, { timeout: 10000 });
    },
    getMemory: async () => {
        return get(API_ENDPOINTS.AI.MEMORIES, { timeout: 10000 });
    },
    updateMemory: async (dto) => {
        return put(API_ENDPOINTS.AI.MEMORIES, dto, { timeout: 10000 });
    }
};