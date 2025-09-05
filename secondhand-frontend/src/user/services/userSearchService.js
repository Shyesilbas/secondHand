import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get } from '../../common/services/api/request.js';

/**
 * Kullanıcı arama servisi
 * Profil arama işlemleri için API çağrıları
 */

/**
 * Kullanıcıları isme göre ara
 * @param {string} query - Arama sorgusu
 * @param {number} limit - Sonuç sayısı limiti (varsayılan: 10)
 * @returns {Promise<Array>} Arama sonuçları
 */
export const searchUsers = async (query, limit = 10) => {
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        console.log('🔍 Searching users with query:', query);
        console.log('🔗 API endpoint:', API_ENDPOINTS.USER.SEARCH);
        
        // Gerçek API çağrısı
        const response = await get(API_ENDPOINTS.USER.SEARCH, {
            params: {
                query: query.trim(),
                limit: limit
            }
        });

        console.log('✅ User search results:', response);
        return response || [];

    } catch (error) {
        console.error('❌ Error searching users:', error);
        console.error('❌ Error response:', error.response?.data);
        
        // Hata durumunda boş array döndür
        return [];
    }
};

/**
 * Kullanıcı arama servisi
 */
export const userSearchService = {
    searchUsers
};
