import { post, get } from '../../common/services/api/request.js';
import { API_BASE_URL, API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

/**
 * Track a listing view
 * @param {string} listingId - The listing ID
 * @param {string} sessionId - The session ID (optional, will be generated if not provided)
 * @param {string} userAgent - The user agent (optional)
 * @returns {Promise<void>}
 */
export const trackView = async (listingId, sessionId = null, userAgent = null) => {
  try {
    const payload = {};
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    if (userAgent) {
      payload.userAgent = userAgent;
    }

    await post(`${API_BASE_URL}${API_ENDPOINTS.LISTINGS.TRACK_VIEW(listingId)}`, payload);
  } catch (error) {
    // Silently fail - view tracking should not break the application
    console.debug('Failed to track view:', error);
  }
};

/**
 * Get view statistics for a listing
 * @param {string} listingId - The listing ID
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @returns {Promise<Object>} View statistics
 */
export const getViewStats = async (listingId, startDate = null, endDate = null) => {
  try {
    let url = `${API_BASE_URL}${API_ENDPOINTS.LISTINGS.VIEW_STATS(listingId)}`;
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return await get(url);
  } catch (error) {
    console.error('Failed to fetch view stats:', error);
    throw error;
  }
};

/**
 * Get aggregated view statistics for all seller's listings
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @returns {Promise<Object>} Aggregated view statistics
 */
export const getMyListingsViewStats = async (startDate = null, endDate = null) => {
  try {
    let url = `${API_BASE_URL}${API_ENDPOINTS.LISTINGS.MY_LISTINGS_VIEW_STATS}`;
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return await get(url);
  } catch (error) {
    console.error('Failed to fetch my listings view stats:', error);
    throw error;
  }
};

