import { get, post, put, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const cartService = {
    // Get all cart items
    getCartItems: async () => {
        return get(API_ENDPOINTS.CART.GET_ITEMS);
    },

    // Add item to cart
    addToCart: async (listingId, quantity = 1, notes = '') => {
        return post(API_ENDPOINTS.CART.ADD_ITEM, {
            listingId,
            quantity,
            notes
        });
    },

    // Update cart item
    updateCartItem: async (listingId, quantity, notes = '') => {
        return put(API_ENDPOINTS.CART.UPDATE_ITEM(listingId), {
            quantity,
            notes
        });
    },

    // Remove item from cart
    removeFromCart: async (listingId) => {
        return del(API_ENDPOINTS.CART.REMOVE_ITEM(listingId));
    },

    // Clear entire cart
    clearCart: async () => {
        return del(API_ENDPOINTS.CART.CLEAR_CART);
    },

    // Get cart item count
    getCartItemCount: async () => {
        return get(API_ENDPOINTS.CART.GET_COUNT);
    },

    // Check if item is in cart
    isInCart: async (listingId) => {
        return get(API_ENDPOINTS.CART.CHECK_ITEM(listingId));
    }
};
