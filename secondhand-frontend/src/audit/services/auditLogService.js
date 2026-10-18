import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const auditLogService = {
 getUserAuditLogsByEmail: async (userEmail, page = 0, size = 10, filters = {}) => {
 const params = { page, size, ...filters };
 return get(API_ENDPOINTS.USER.AUDIT_LOGS, { params });
 }
};
