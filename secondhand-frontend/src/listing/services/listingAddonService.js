import { get, post } from '../../common/services/api/request.js';
import { API_BASE_URL, API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { cacheService } from '../../common/services/cacheService.js';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const buildExchangeCacheKey = (from, to, listingId) => {
  const scope = listingId ? `listing:${listingId}` : 'global';
  return `exchange:v1:${scope}:${from}:${to}`;
};

export const fetchExchangeRate = async (from, to, listingId) => {
  const cacheKey = buildExchangeCacheKey(from, to, listingId);
  const cached = cacheService.get(cacheKey, { ttlMs: CACHE_TTL_MS });
  if (cached) return cached;

  const url = `${API_BASE_URL}${API_ENDPOINTS.EXCHANGE.RATE(from, to)}`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch exchange rate');
  const data = await res.json();
  cacheService.set(cacheKey, data);
  return data;
};

export const priceHistoryService = {
  getPriceHistory: async (listingId) => {
    return get(API_ENDPOINTS.PRICE_HISTORY.BY_LISTING(listingId));
  },
  getLatestPriceChange: async (listingId) => {
    return get(API_ENDPOINTS.PRICE_HISTORY.LATEST(listingId));
  },
  hasPriceHistory: async (listingId) => {
    return get(API_ENDPOINTS.PRICE_HISTORY.EXISTS(listingId));
  },
};

export const trackView = async (listingId, sessionId = null, userAgent = null) => {
  try {
    const payload = {};
    if (sessionId) payload.sessionId = sessionId;
    if (userAgent) payload.userAgent = userAgent;
    await post(`${API_BASE_URL}${API_ENDPOINTS.LISTINGS.TRACK_VIEW(listingId)}`, payload);
  } catch (error) {
    console.debug('Failed to track view:', error);
  }
};

export const getViewStats = async (listingId, startDate = null, endDate = null) => {
  let url = `${API_BASE_URL}${API_ENDPOINTS.LISTINGS.VIEW_STATS(listingId)}`;
  const params = new URLSearchParams();

  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());

  if (params.toString()) url += `?${params.toString()}`;
  return get(url);
};

export const getMyListingsViewStats = async (startDate = null, endDate = null) => {
  let url = `${API_BASE_URL}${API_ENDPOINTS.LISTINGS.MY_LISTINGS_VIEW_STATS}`;
  const params = new URLSearchParams();

  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());

  if (params.toString()) url += `?${params.toString()}`;
  return get(url);
};

export const listingAddonService = {
  exchange: { fetchExchangeRate },
  priceHistory: priceHistoryService,
  viewTracking: { trackView, getViewStats, getMyListingsViewStats },
};

