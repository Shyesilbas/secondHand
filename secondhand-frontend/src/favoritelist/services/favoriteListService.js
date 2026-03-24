import { get, post, put, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { FAVORITE_LIST_PAGING } from '../favoriteListConstants.js';

const buildPagedUrl = (basePath, page, size) => `${basePath}?page=${page}&size=${size}`;

export const favoriteListService = {
    createList: (data) => post(API_ENDPOINTS.FAVORITE_LISTS.CREATE, data),
    
    getMyLists: (page = FAVORITE_LIST_PAGING.PAGE, size = FAVORITE_LIST_PAGING.MY_SIZE) => 
        get(buildPagedUrl(API_ENDPOINTS.FAVORITE_LISTS.MY_LISTS, page, size)),
    
    getUserLists: (userId, page = FAVORITE_LIST_PAGING.PAGE, size = FAVORITE_LIST_PAGING.USER_SIZE) => 
        get(buildPagedUrl(API_ENDPOINTS.FAVORITE_LISTS.USER_LISTS(userId), page, size)),
    
    getPopularLists: (page = FAVORITE_LIST_PAGING.PAGE, size = FAVORITE_LIST_PAGING.POPULAR_SIZE) => 
        get(buildPagedUrl(API_ENDPOINTS.FAVORITE_LISTS.POPULAR, page, size)),
    
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

