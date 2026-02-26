import {API_ENDPOINTS} from '../../common/constants/apiEndpoints.js';
import {get} from '../../common/services/api/request.js';
import logger from '../../common/utils/logger.js';


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
        logger.error('Error searching users:', error);
        return [];
    }
};

export const userSearchService = {
    searchUsers
};
