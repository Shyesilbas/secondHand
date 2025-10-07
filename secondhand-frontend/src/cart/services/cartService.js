import { get, post, put, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const cartService = {
        getCartItems: async () => {
        return get(API_ENDPOINTS.CART.GET_ITEMS);
    },

        addToCart: async (listingId, quantity = 1, notes = '') => {
        return post(API_ENDPOINTS.CART.ADD_ITEM, {
            listingId,
            quantity,
            notes
        });
    },

        updateCartItem: async (listingId, quantity, notes = '') => {
        return put(API_ENDPOINTS.CART.UPDATE_ITEM(listingId), {
            quantity,
            notes
        });
    },

        removeFromCart: async (listingId) => {
        return del(API_ENDPOINTS.CART.REMOVE_ITEM(listingId));
    },

        clearCart: async () => {
        return del(API_ENDPOINTS.CART.CLEAR_CART);
    },

        // getCartItemCount: Removed - count is now calculated from cart items in frontend
    // Backend endpoint still exists for backward compatibility

        isInCart: async (listingId) => {
        return get(API_ENDPOINTS.CART.CHECK_ITEM(listingId));
    }
};
