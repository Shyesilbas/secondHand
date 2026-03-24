import { get, post, put, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { CHAT_DEFAULTS } from '../chatConstants.js';

export const chatService = {

    getUserChatRooms: async () => {
        return get(API_ENDPOINTS.CHAT.USER_ROOMS);
    },

    createOrGetDirectChat: async (otherUserId) => {
        return post(API_ENDPOINTS.CHAT.DIRECT_ROOM, null, { params: { userId2: otherUserId } });
    },

    createOrGetListingChat: async (listingId, listingTitle) => {
        return post(API_ENDPOINTS.CHAT.CREATE_LISTING_ROOM(listingId), null, { params: { listingTitle } });
    },

    sendMessage: async (messageData) => {
        return post(API_ENDPOINTS.CHAT.SEND_MESSAGE, messageData);
    },

    getChatMessages: async (chatRoomId, page = CHAT_DEFAULTS.MESSAGE_PAGE, size = CHAT_DEFAULTS.MESSAGE_PAGE_SIZE) => {
        return get(API_ENDPOINTS.CHAT.ROOM_MESSAGES(chatRoomId), { params: { page, size } });
    },

    markMessagesAsRead: async (chatRoomId) => {
        return put(API_ENDPOINTS.CHAT.MARK_READ(chatRoomId));
    },

    getAllUserMessages: async (page = CHAT_DEFAULTS.MESSAGE_PAGE, size = CHAT_DEFAULTS.MESSAGE_PAGE_SIZE) => {
        return get(API_ENDPOINTS.CHAT.ALL_USER_MESSAGES, { params: { page, size } });
    },

    getTotalUnreadMessageCount: async () => {
        return get(API_ENDPOINTS.CHAT.TOTAL_UNREAD_COUNT);
    },

    deleteConversation: async (chatRoomId) => {
        return del(API_ENDPOINTS.CHAT.DELETE_CONVERSATION(chatRoomId));
    },

    deleteMessage: async (messageId) => {
        return del(API_ENDPOINTS.CHAT.DELETE_MESSAGE(messageId));
    }

};
