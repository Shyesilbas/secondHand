import { del, get, patch, post } from '../../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../../common/constants/apiEndpoints.js';

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    const str = String(v).trim();
    if (!str) return;
    query.set(k, str);
  });
  const s = query.toString();
  return s ? `?${s}` : '';
};

export const forumService = {
  listThreads: async ({ category, status, q, sort, page = 0, size = 20 } = {}) => {
    const query = buildQuery({ category, status, q, sort, page, size });
    return await get(`${API_ENDPOINTS.FORUM.THREADS}${query}`);
  },
  getThreadById: async (threadId) => {
    return await get(API_ENDPOINTS.FORUM.THREAD_BY_ID(threadId));
  },
  publishThread: async (payload) => {
    return await post(API_ENDPOINTS.FORUM.THREADS, payload);
  },
  modifyThreadContent: async (threadId, payload) => {
    return await patch(API_ENDPOINTS.FORUM.THREAD_BY_ID(threadId), payload);
  },
  changeThreadStatus: async (threadId, payload) => {
    return await patch(API_ENDPOINTS.FORUM.THREAD_STATUS(threadId), payload);
  },
  reactToThread: async (threadId, payload) => {
    return await post(API_ENDPOINTS.FORUM.THREAD_REACTION(threadId), payload);
  },
  listComments: async (threadId, { page = 0, size = 20 } = {}) => {
    const query = buildQuery({ page, size });
    return await get(`${API_ENDPOINTS.FORUM.THREAD_COMMENTS(threadId)}${query}`);
  },
  addComment: async (threadId, payload) => {
    return await post(API_ENDPOINTS.FORUM.THREAD_COMMENTS(threadId), payload);
  },
  reactToComment: async (threadId, commentId, payload) => {
    return await post(API_ENDPOINTS.FORUM.COMMENT_REACTION(threadId, commentId), payload);
  },
  deleteThread: async (threadId) => {
    return await del(API_ENDPOINTS.FORUM.THREAD_BY_ID(threadId));
  },
  deleteComment: async (threadId, commentId) => {
    return await del(API_ENDPOINTS.FORUM.COMMENT_BY_ID(threadId, commentId));
  }
};

