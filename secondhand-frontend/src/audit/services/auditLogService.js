import { request } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const auditLogService = {
        getUserAuditLogsByEmail: async (userEmail) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.USER_BY_EMAIL(userEmail));
    },

        getUserAuditLogsById: async (userId) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.USER_BY_ID(userId));
    },

        getAuditLogsByEventType: async (eventType, page = 0, size = 20) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.BY_EVENT_TYPE(eventType), {
            page,
            size
        });
    },

        getAuditLogsByDateRange: async (startDate, endDate, page = 0, size = 20) => {
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
    },

        getEventTypes: async () => {
        return request('GET', API_ENDPOINTS.AUDIT_ENUMS.EVENT_TYPES);
    },

        getEventStatuses: async () => {
        return request('GET', API_ENDPOINTS.AUDIT_ENUMS.EVENT_STATUSES);
    },

        getAllEnums: async () => {
        return request('GET', API_ENDPOINTS.AUDIT_ENUMS.ALL);
    }
};
