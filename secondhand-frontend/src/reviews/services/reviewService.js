import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get, post } from '../../common/services/api/request.js';

export const reviewService = {
 createReview: async (reviewData) => {
 return post(API_ENDPOINTS.REVIEWS.CREATE_REVIEW, reviewData);
 },

 getReviewsReceivedByUser: async (userId, page = 0, size = 10) => {
 return get(`${API_ENDPOINTS.REVIEWS.GET_REVIEWS_RECEIVED_BY(userId)}?page=${page}&size=${size}`);
 },

 getReviewsByUser: async (userId, page = 0, size = 10) => {
 return get(`${API_ENDPOINTS.REVIEWS.GET_REVIEWS_WRITTEN_BY(userId)}?page=${page}&size=${size}`);
 },

 getUserReviewStats: async (userId) => {
 return get(API_ENDPOINTS.REVIEWS.GET_USER_REVIEW_STATS(userId));
 },

 getReviewsForOrderItems: async (orderItemIds) => {
 const ids = Array.isArray(orderItemIds) ? orderItemIds.join(',') : orderItemIds;
 return get(`${API_ENDPOINTS.REVIEWS.GET_REVIEWS_BY_ORDER_ITEMS}?orderItemIds=${ids}`);
 }
};
