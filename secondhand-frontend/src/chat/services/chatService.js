import { request, requestWithParams } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const chatService = {

    getUserChatRooms: async () => {
        return request('GET', API_ENDPOINTS.CHAT.USER_ROOMS);
    },
    

    createOrGetDirectChat: async (otherUserId) => {
        return requestWithParams('POST', API_ENDPOINTS.CHAT.DIRECT_ROOM, { userId2: otherUserId });
    },

    createOrGetListingChat: async (listingId, listingTitle) => {
        return requestWithParams('POST', API_ENDPOINTS.CHAT.CREATE_LISTING_ROOM(listingId), { listingTitle });
    },

    sendMessage: async (messageData) => {
        return request('POST', API_ENDPOINTS.CHAT.SEND_MESSAGE, messageData);
    },

    getChatMessages: async (chatRoomId, page = 0, size = 20) => {
        return requestWithParams('GET', API_ENDPOINTS.CHAT.ROOM_MESSAGES(chatRoomId), { page, size });
    },

    markMessagesAsRead: async (chatRoomId) => {
        return request('PUT', API_ENDPOINTS.CHAT.MARK_READ(chatRoomId));
    },

    getAllUserMessages: async (page = 0, size = 20) => {
        return requestWithParams('GET', API_ENDPOINTS.CHAT.ALL_USER_MESSAGES, { page, size });
    },

    getTotalUnreadMessageCount: async () => {
        return request('GET', API_ENDPOINTS.CHAT.TOTAL_UNREAD_COUNT);
    },


    deleteConversation: async (chatRoomId) => {
        return request('DELETE', API_ENDPOINTS.CHAT.DELETE_CONVERSATION(chatRoomId));
    },

    deleteMessage: async (messageId) => {
        return request('DELETE', API_ENDPOINTS.CHAT.DELETE_MESSAGE(messageId));
    }

};
