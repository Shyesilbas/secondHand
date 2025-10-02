import { API_BASE_URL, API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function buildCacheKey(from, to, listingId) {
    const scope = listingId ? `listing:${listingId}` : 'global';
    return `exchange:v1:${scope}:${from}:${to}`;
}

export async function fetchExchangeRate(from, to, listingId) {
    const cacheKey = buildCacheKey(from, to, listingId);
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.data) {
                return parsed.data;
            }
        }
    } catch (_) {}

    const url = `${API_BASE_URL}${API_ENDPOINTS.EXCHANGE.RATE(from, to)}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch exchange rate');
    const data = await res.json();

    try {
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
    } catch (_) {}

    return data;
}


