import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { cacheService } from '../../common/services/cacheService.js';

const EXCHANGE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const buildExchangeCacheKey = (from, to, listingId) => {
  const scope = listingId ? `listing:${listingId}` : 'global';
  return `exchange:v1:${scope}:${from}:${to}`;
};

export const fetchExchangeRate = async (from, to, listingId) => {
  const cacheKey = buildExchangeCacheKey(from, to, listingId);
  const cached = cacheService.get(cacheKey, { ttlMs: EXCHANGE_CACHE_TTL_MS });
  if (cached) return cached;
  const data = await get(API_ENDPOINTS.EXCHANGE.RATE(from, to));
  cacheService.set(cacheKey, data);
  return data;
};

export const priceHistoryService = {
  getPriceHistory: (listingId) => get(API_ENDPOINTS.PRICE_HISTORY.BY_LISTING(listingId)),
  getLatestPriceChange: (listingId) => get(API_ENDPOINTS.PRICE_HISTORY.LATEST(listingId)),
  hasPriceHistory: (listingId) => get(API_ENDPOINTS.PRICE_HISTORY.EXISTS(listingId)),
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
