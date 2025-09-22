import { request, requestWithParams } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const chatService = {

    getUserChatRooms: async (userId) => {
        return request('GET', API_ENDPOINTS.CHAT.USER_ROOMS(userId));
    },
    

    createOrGetDirectChat: async (userId1, userId2) => {
        return requestWithParams('POST', API_ENDPOINTS.CHAT.DIRECT_ROOM, { userId1, userId2 });
    },

    createOrGetListingChat: async (userId, listingId, listingTitle) => {
        return requestWithParams('POST', API_ENDPOINTS.CHAT.CREATE_LISTING_ROOM(listingId), { userId, listingTitle });
    },

    sendMessage: async (messageData) => {
        return request('POST', API_ENDPOINTS.CHAT.SEND_MESSAGE, messageData);
    },

    getChatMessages: async (chatRoomId, page = 0, size = 20) => {
        return requestWithParams('GET', API_ENDPOINTS.CHAT.ROOM_MESSAGES(chatRoomId), { page, size });
    },

    markMessagesAsRead: async (chatRoomId, userId) => {
        return requestWithParams('PUT', API_ENDPOINTS.CHAT.MARK_READ(chatRoomId), { userId });
    },

    getAllUserMessages: async (userId, page = 0, size = 20) => {
        return requestWithParams('GET', API_ENDPOINTS.CHAT.ALL_USER_MESSAGES(userId), { page, size });
    },

    getTotalUnreadMessageCount: async (userId) => {
        return request('GET', API_ENDPOINTS.CHAT.TOTAL_UNREAD_COUNT(userId));
    },

    getChatRoomUnreadCount: async (chatRoomId, userId) => {
        return request('GET', API_ENDPOINTS.CHAT.UNREAD_COUNT(chatRoomId, userId));
    },

    deleteConversation: async (chatRoomId, userId) => {
        return requestWithParams('DELETE', API_ENDPOINTS.CHAT.DELETE_CONVERSATION(chatRoomId), { userId });
    },

    deleteMessage: async (messageId, userId) => {
        return requestWithParams('DELETE', API_ENDPOINTS.CHAT.DELETE_MESSAGE(messageId), { userId });
    }

};
