import { request, requestWithParams } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const chatService = {
    // ==================== CHAT ROOM İŞLEMLERİ ====================
    
    /**
     * Kullanıcının tüm chat room'larını getir
     */
    getUserChatRooms: async (userId) => {
        return request('GET', API_ENDPOINTS.CHAT.USER_ROOMS(userId));
    },
    
    /**
     * İki kullanıcı arasında direct chat oluştur veya mevcut olanı getir
     */
    createOrGetDirectChat: async (userId1, userId2) => {
        return requestWithParams('POST', API_ENDPOINTS.CHAT.DIRECT_ROOM, { userId1, userId2 });
    },
    
    /**
     * Listing ile ilgili chat oluştur veya mevcut olanı getir
     */
    createOrGetListingChat: async (userId, listingId, listingTitle) => {
        return requestWithParams('POST', API_ENDPOINTS.CHAT.CREATE_LISTING_ROOM(listingId), { userId, listingTitle });
    },
    
    // ==================== MESAJ İŞLEMLERİ ====================
    
    /**
     * Mesaj gönder
     */
    sendMessage: async (messageData) => {
        return request('POST', API_ENDPOINTS.CHAT.SEND_MESSAGE, messageData);
    },
    
    /**
     * Chat room'daki mesajları getir
     */
    getChatMessages: async (chatRoomId, page = 0, size = 20) => {
        return requestWithParams('GET', API_ENDPOINTS.CHAT.ROOM_MESSAGES(chatRoomId), { page, size });
    },
    
    /**
     * Mesajları okundu olarak işaretle
     */
    markMessagesAsRead: async (chatRoomId, userId) => {
        return requestWithParams('PUT', API_ENDPOINTS.CHAT.MARK_READ(chatRoomId), { userId });
    },
    
    /**
     * Chat room'daki okunmamış mesaj sayısını getir
     */
    getUnreadMessageCount: async (chatRoomId, userId) => {
        return requestWithParams('GET', API_ENDPOINTS.CHAT.UNREAD_COUNT(chatRoomId), { userId });
    },
    
    /**
     * Kullanıcının tüm mesajlarını getir (tüm chat room'lardan)
     */
    getAllUserMessages: async (userId, page = 0, size = 20) => {
        return requestWithParams('GET', API_ENDPOINTS.CHAT.ALL_USER_MESSAGES(userId), { page, size });
    },
    
    /**
     * Kullanıcının toplam okunmamış mesaj sayısını getir
     */
    getTotalUnreadMessageCount: async (userId) => {
        return request('GET', API_ENDPOINTS.CHAT.TOTAL_UNREAD_COUNT(userId));
    }
};
