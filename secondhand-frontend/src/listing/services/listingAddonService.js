import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

// Rates are global per currency pair; React Query caches them (see ExchangeRatesTab).
export const fetchExchangeRate = (from, to) => get(API_ENDPOINTS.EXCHANGE.RATE(from, to));

export const priceHistoryService = {
 getPriceHistory: (listingId) => get(API_ENDPOINTS.PRICE_HISTORY.BY_LISTING(listingId)),
};

export const trackView = async (listingId, sessionId = null, userAgent = null) => {
 try {
 const payload = {};
 if (sessionId) payload.sessionId = sessionId;
 if (userAgent) payload.userAgent = userAgent;
 await post(API_ENDPOINTS.LISTINGS.TRACK_VIEW(listingId), payload);
 } catch {
 // fire-and-forget; view tracking failures must not surface to the user
 }
};
