import { API_BASE_URL, API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export async function fetchExchangeRate(from, to) {
    const url = `${API_BASE_URL}${API_ENDPOINTS.EXCHANGE.RATE(from, to)}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch exchange rate');
    return await res.json();
}


