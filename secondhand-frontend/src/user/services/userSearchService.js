import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get } from '../../common/services/api/request.js';


export const searchUsers = async (query, limit = 10) => {
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        
                const response = await get(API_ENDPOINTS.USER.SEARCH, {
            params: {
                query: query.trim(),
                limit: limit
            }
        });

        return response || [];

    } catch (error) {
        console.error('❌ Error searching users:', error);
        console.error('❌ Error response:', error.response?.data);
        
                return [];
    }
};

export const userSearchService = {
    searchUsers
};
