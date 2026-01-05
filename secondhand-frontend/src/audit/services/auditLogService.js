import { request } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const auditLogService = {
        getUserAuditLogsByEmail: async (userEmail, page = 0, size = 10, filters = {}) => {
        const params = {
            page,
            size,
            ...filters
        };
        
        return request('GET', API_ENDPOINTS.USER.AUDIT_LOGS, undefined, { params });
    },

        getUserAuditLogsById: async (userId, page = 0, size = 10) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.USER_BY_ID(userId), {
            page,
            size
        });
    },

        getAuditLogsByEventType: async (eventType, page = 0, size = 10) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.BY_EVENT_TYPE(eventType), {
            page,
            size
        });
    },

        getAuditLogsByDateRange: async (startDate, endDate, page = 0, size = 10) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.BY_DATE_RANGE, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            page,
            size
        });
    },

        countFailedLoginAttemptsByUser: async (userEmail, since) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.FAILED_ATTEMPTS_BY_USER(userEmail), {
            since: since.toISOString()
        });
    },

        countFailedLoginAttemptsByIp: async (ipAddress, since) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.FAILED_ATTEMPTS_BY_IP(ipAddress), {
            since: since.toISOString()
        });
    }
};
