import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get, post } from '../../common/services/api/request.js';

export const reviewService = {
    // Create a new review
    createReview: async (reviewData) => {
        return post(API_ENDPOINTS.REVIEWS.CREATE, reviewData);
    },

    // Get reviews for a specific user (reviews received by the user)
    getReviewsForUser: async (userId, page = 0, size = 10) => {
        return get(`${API_ENDPOINTS.REVIEWS.GET_FOR_USER(userId)}?page=${page}&size=${size}`);
    },

    // Get reviews written by a specific user
    getReviewsByUser: async (userId, page = 0, size = 10) => {
        return get(`${API_ENDPOINTS.REVIEWS.GET_BY_USER(userId)}?page=${page}&size=${size}`);
    },

    // Get review statistics for a user
    getUserReviewStats: async (userId) => {
        return get(API_ENDPOINTS.REVIEWS.GET_USER_STATS(userId));
    },

    // Get reviews for multiple order items
    getReviewsForOrderItems: async (orderItemIds) => {
        const ids = Array.isArray(orderItemIds) ? orderItemIds.join(',') : orderItemIds;
        return get(`${API_ENDPOINTS.REVIEWS.GET_FOR_ORDER_ITEMS}?orderItemIds=${ids}`);
    },

    // Get review for a specific order item by current user
    getReviewByOrderItem: async (orderItemId) => {
        return get(API_ENDPOINTS.REVIEWS.GET_BY_ORDER_ITEM(orderItemId));
    },

    // Get reviews for a specific listing (reviews about the seller)
    getReviewsForListing: async (listingId, page = 0, size = 10) => {
        return get(`${API_ENDPOINTS.REVIEWS.GET_FOR_LISTING(listingId)}?page=${page}&size=${size}`);
    },

    // Get review stats for a specific listing
    getListingReviewStats: async (listingId) => {
        return get(API_ENDPOINTS.REVIEWS.GET_LISTING_REVIEW_STATS(listingId));
    },
};
