import { request } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const auditLogService = {
    // Get audit logs for current user by email
    getUserAuditLogsByEmail: async (userEmail) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.USER_BY_EMAIL(userEmail));
    },

    // Get audit logs for current user by ID
    getUserAuditLogsById: async (userId) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.USER_BY_ID(userId));
    },

    // Get audit logs by event type
    getAuditLogsByEventType: async (eventType, page = 0, size = 20) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.BY_EVENT_TYPE(eventType), {
            page,
            size
        });
    },

    // Get audit logs by date range
    getAuditLogsByDateRange: async (startDate, endDate, page = 0, size = 20) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.BY_DATE_RANGE, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            page,
            size
        });
    },

    // Count failed login attempts by user
    countFailedLoginAttemptsByUser: async (userEmail, since) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.FAILED_ATTEMPTS_BY_USER(userEmail), {
            since: since.toISOString()
        });
    },

    // Count failed login attempts by IP
    countFailedLoginAttemptsByIp: async (ipAddress, since) => {
        return request('GET', API_ENDPOINTS.AUDIT_LOGS.FAILED_ATTEMPTS_BY_IP(ipAddress), {
            since: since.toISOString()
        });
    },

    // Get audit event types
    getEventTypes: async () => {
        return request('GET', API_ENDPOINTS.AUDIT_ENUMS.EVENT_TYPES);
    },

    // Get audit event statuses
    getEventStatuses: async () => {
        return request('GET', API_ENDPOINTS.AUDIT_ENUMS.EVENT_STATUSES);
    },

    // Get all audit enums
    getAllEnums: async () => {
        return request('GET', API_ENDPOINTS.AUDIT_ENUMS.ALL);
    }
};
