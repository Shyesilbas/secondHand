import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const auditLogService = {
        getUserAuditLogsByEmail: async (userEmail, page = 0, size = 10, filters = {}) => {
        const params = { page, size, ...filters };
        return get(API_ENDPOINTS.USER.AUDIT_LOGS, { params });
    },

        getUserAuditLogsById: async (userId, page = 0, size = 10) => {
        return get(API_ENDPOINTS.AUDIT_LOGS.USER_BY_ID(userId), { params: { page, size } });
    },

        getAuditLogsByEventType: async (eventType, page = 0, size = 10) => {
        return get(API_ENDPOINTS.AUDIT_LOGS.BY_EVENT_TYPE(eventType), { params: { page, size } });
    },

        getAuditLogsByDateRange: async (startDate, endDate, page = 0, size = 10) => {
        return get(API_ENDPOINTS.AUDIT_LOGS.BY_DATE_RANGE, {
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString(), page, size }
        });
    },

        countFailedLoginAttemptsByUser: async (userEmail, since) => {
        return get(API_ENDPOINTS.AUDIT_LOGS.FAILED_ATTEMPTS_BY_USER(userEmail), {
            params: { since: since.toISOString() }
        });
    },

        countFailedLoginAttemptsByIp: async (ipAddress, since) => {
        return get(API_ENDPOINTS.AUDIT_LOGS.FAILED_ATTEMPTS_BY_IP(ipAddress), {
            params: { since: since.toISOString() }
        });
    }
};
