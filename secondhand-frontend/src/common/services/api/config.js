import axios from 'axios';
import { API_BASE_URL } from '../../constants/apiEndpoints.js';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
});

export default apiClient;
export { API_BASE_URL };