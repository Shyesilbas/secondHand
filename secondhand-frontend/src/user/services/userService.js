import { get, put, post, patch, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { 
 createUpdatePhoneRequest,
} from '../users.js';

export const userService = {

 getUserById: async (userId) => {
 return get(API_ENDPOINTS.USER.BY_ID(userId));
 },

 getSettings: async () => get(API_ENDPOINTS.USER.SETTINGS),
 updateSettings: async (settings) => patch(API_ENDPOINTS.USER.SETTINGS, settings),
 getBlockedUsers: async () => get(API_ENDPOINTS.USER.BLOCKED_USERS),
 getBlockStatus: async (userId) => get(API_ENDPOINTS.USER.BLOCK_STATUS(userId)),
 blockUser: async (userId) => post(API_ENDPOINTS.USER.BLOCK(userId)),
 unblockUser: async (userId) => del(API_ENDPOINTS.USER.BLOCK(userId)),

 getGreatSellerStatus: async (userId) => {
 return get(API_ENDPOINTS.USER.GREAT_SELLER_STATUS(userId));
 },

 listGreatSellers: async (limit = 16) => {
 return get(API_ENDPOINTS.USER.GREAT_SELLERS_LIST(limit));
 },

 updatePhone: async (phoneData) => {
 const updatePhoneData = createUpdatePhoneRequest(phoneData);
 return put(API_ENDPOINTS.USER.UPDATE_PHONE, updatePhoneData);
 },

 getAddresses: async () => {
 return get(API_ENDPOINTS.ADDRESS.ALL);
 },
 addAddress: async (address) => {
 return post(API_ENDPOINTS.ADDRESS.CREATE, address);
 },
 updateAddress: async (id, address) => {
 return put(API_ENDPOINTS.ADDRESS.UPDATE(id), address);
 },
 deleteAddress: async (id) => {
 return del(API_ENDPOINTS.ADDRESS.DELETE(id));
 },
 selectMainAddress: async (id) => {
 return post(API_ENDPOINTS.ADDRESS.SELECT_MAIN(id));
 },
};