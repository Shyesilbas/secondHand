import { get, post, del, patch } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const followService = {
    follow: async (userId) => {
        return post(API_ENDPOINTS.FOLLOW.FOLLOW(userId));
    },

    unfollow: async (userId) => {
        return del(API_ENDPOINTS.FOLLOW.UNFOLLOW(userId));
    },

    toggleNotifications: async (userId) => {
        return patch(API_ENDPOINTS.FOLLOW.TOGGLE_NOTIFICATIONS(userId));
    },

    getFollowing: async (params = {}) => {
        const query = new URLSearchParams({
            page: params.page ?? 0,
            size: params.size ?? 20,
        }).toString();
        return get(`${API_ENDPOINTS.FOLLOW.FOLLOWING}?${query}`);
    },

    getFollowers: async (params = {}) => {
        const query = new URLSearchParams({
            page: params.page ?? 0,
            size: params.size ?? 20,
        }).toString();
        return get(`${API_ENDPOINTS.FOLLOW.FOLLOWERS}?${query}`);
    },

    getFollowStats: async (userId) => {
        return get(API_ENDPOINTS.FOLLOW.STATS(userId));
    },

    checkFollowing: async (userId) => {
        return get(API_ENDPOINTS.FOLLOW.CHECK(userId));
    },

    getUserFollowers: async (userId, params = {}) => {
        const query = new URLSearchParams({
            page: params.page ?? 0,
            size: params.size ?? 20,
        }).toString();
        return get(`${API_ENDPOINTS.FOLLOW.USER_FOLLOWERS(userId)}?${query}`);
    },

    getUserFollowing: async (userId, params = {}) => {
        const query = new URLSearchParams({
            page: params.page ?? 0,
            size: params.size ?? 20,
        }).toString();
        return get(`${API_ENDPOINTS.FOLLOW.USER_FOLLOWING(userId)}?${query}`);
    },
};

