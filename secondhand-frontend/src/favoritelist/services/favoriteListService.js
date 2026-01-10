import { get, post, put, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const favoriteListService = {
    createList: (data) => post(API_ENDPOINTS.FAVORITE_LISTS.CREATE, data),
    
    getMyLists: () => get(API_ENDPOINTS.FAVORITE_LISTS.MY_LISTS),
    
    getUserLists: (userId) => get(API_ENDPOINTS.FAVORITE_LISTS.USER_LISTS(userId)),
    
    getPopularLists: (page = 0, size = 10) => 
        get(`${API_ENDPOINTS.FAVORITE_LISTS.POPULAR}?page=${page}&size=${size}`),
    
    getListById: (listId) => get(API_ENDPOINTS.FAVORITE_LISTS.BY_ID(listId)),
    
    updateList: (listId, data) => put(API_ENDPOINTS.FAVORITE_LISTS.UPDATE(listId), data),
    
    deleteList: (listId) => del(API_ENDPOINTS.FAVORITE_LISTS.DELETE(listId)),
    
    addItemToList: (listId, listingId, note = null) => 
        post(API_ENDPOINTS.FAVORITE_LISTS.ADD_ITEM(listId), { listingId, note }),
    
    removeItemFromList: (listId, listingId) => 
        del(API_ENDPOINTS.FAVORITE_LISTS.REMOVE_ITEM(listId, listingId)),
    
    likeList: (listId) => post(API_ENDPOINTS.FAVORITE_LISTS.LIKE(listId)),
    
    unlikeList: (listId) => del(API_ENDPOINTS.FAVORITE_LISTS.UNLIKE(listId)),
    
    getListsContainingListing: (listingId) => 
        get(API_ENDPOINTS.FAVORITE_LISTS.LISTING_LISTS(listingId)),
};

export default favoriteListService;

