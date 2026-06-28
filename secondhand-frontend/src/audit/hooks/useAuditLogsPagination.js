import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogService } from '../services/auditLogService.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import logger from '../../common/utils/logger.js';

export const useAuditLogsPagination = (userEmail, initialPageSize = 10) => {
    const { enums } = useEnums();
    
    // State management
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(initialPageSize);
    
    // Filter states
    const [filters, setFilters] = useState({
        eventType: '',
        eventStatus: '',
        dateFrom: '',
        dateTo: '',
        ipAddress: '',
        userAgent: ''
    });

    const queryKey = useMemo(() => ['auditLogs', userEmail, currentPage, pageSize], [userEmail, currentPage, pageSize]);

    const { data, isLoading, error } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!userEmail) return { content: [], totalElements: 0, totalPages: 0 };
            try {
                return await auditLogService.getUserAuditLogsByEmail(userEmail, currentPage, pageSize);
            } catch (err) {
                logger.error('API ERROR:', err);
                throw err;
            }
        },
        enabled: !!userEmail,
        staleTime: 2 * 60 * 1000,
    });

    const auditLogs = useMemo(() => data?.content || [], [data?.content]);
    const totalElements = data?.totalElements || 0;
    const totalPages = data?.totalPages || 0;

    // Client-side filtering
    const filteredAuditLogs = useMemo(() => {
        if (!auditLogs.length) return [];
        
        return auditLogs.filter(log => {
            if (filters.eventType && log.eventType !== filters.eventType) return false;
            if (filters.eventStatus && log.eventStatus !== filters.eventStatus) return false;
            
            if (filters.dateFrom || filters.dateTo) {
                const logDate = new Date(log.createdAt);
                if (filters.dateFrom && logDate < new Date(filters.dateFrom)) return false;
                if (filters.dateTo && logDate > new Date(filters.dateTo + 'T23:59:59')) return false;
            }
            
            if (filters.ipAddress && log.ipAddress) {
                if (!log.ipAddress.toLowerCase().includes(filters.ipAddress.toLowerCase())) return false;
            }
            
            if (filters.userAgent && log.userAgent) {
                if (!log.userAgent.toLowerCase().includes(filters.userAgent.toLowerCase())) return false;
            }
            
            return true;
        });
    }, [auditLogs, filters]);

    // Pagination controls
    const goToPage = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const changePageSize = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(0);
    };

    // Filter controls
    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(0);
    };

    const clearFilters = () => {
        setFilters({
            eventType: '',
            eventStatus: '',
            dateFrom: '',
            dateTo: '',
            ipAddress: '',
            userAgent: ''
        });
        setCurrentPage(0);
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    // Pagination info
    const shouldShowPagination = totalPages > 1;
    const startIndex = currentPage * pageSize + 1;
    const endIndex = Math.min((currentPage + 1) * pageSize, totalElements);

    // Helper functions
    const getEventTypeDisplay = (eventType) => {
        const eventTypeEnum = enums?.auditEventTypes?.find(et => et.value === eventType);
        return eventTypeEnum ? eventTypeEnum.displayName : eventType;
    };

    const getEventStatusColor = (eventStatus) => {
        switch (eventStatus) {
            case 'SUCCESS':
                return 'text-status-success bg-status-success-bg';
            case 'FAILURE':
                return 'text-status-error bg-status-error-bg';
            case 'ATTEMPT':
                return 'text-status-warning bg-status-warning-bg';
            default:
                return 'text-text-secondary bg-tertiary';
        }
    };

    const getEventTypeIcon = (eventType) => {
        switch (eventType) {
            case 'LOGIN_SUCCESS':
                return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
            case 'LOGIN_FAILURE':
                return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
            case 'LOGOUT':
                return 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1';
            case 'PASSWORD_CHANGE_SUCCESS':
                return 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z';
            case 'PASSWORD_CHANGE_FAILURE':
                return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
            default:
                return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
        }
    };

    const getBrowserInfo = (userAgent) => {
        if (!userAgent) return 'Unknown Browser';
        
        let browser = 'Unknown';
        let browserVersion = '';
        let device = 'Unknown';
        let os = 'Unknown';
        
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            browser = 'Chrome';
            const match = userAgent.match(/Chrome\/([\d.]+)/);
            if (match) browserVersion = match[1];
        } else if (userAgent.includes('Firefox')) {
            browser = 'Firefox';
            const match = userAgent.match(/Firefox\/([\d.]+)/);
            if (match) browserVersion = match[1];
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browser = 'Safari';
            const match = userAgent.match(/Version\/([\d.]+)/);
            if (match) browserVersion = match[1];
        } else if (userAgent.includes('Edg')) {
            browser = 'Edge';
            const match = userAgent.match(/Edg\/([\d.]+)/);
            if (match) browserVersion = match[1];
        }
        
        if (userAgent.includes('Macintosh')) {
            device = 'Mac';
            const match = userAgent.match(/Mac OS X ([\d_]+)/);
            if (match) os = `macOS ${match[1].replace(/_/g, '.')}`;
        } else if (userAgent.includes('Windows')) {
            device = 'Windows';
            if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10/11';
            else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
            else if (userAgent.includes('Windows NT 6.2')) os = 'Windows 8';
            else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
            else os = 'Windows';
        } else if (userAgent.includes('Linux')) {
            device = 'Linux';
            os = 'Linux';
        } else if (userAgent.includes('iPhone')) {
            device = 'iPhone';
            const match = userAgent.match(/OS ([\d_]+)/);
            if (match) os = `iOS ${match[1].replace(/_/g, '.')}`;
        } else if (userAgent.includes('iPad')) {
            device = 'iPad';
            const match = userAgent.match(/OS ([\d_]+)/);
            if (match) os = `iPadOS ${match[1].replace(/_/g, '.')}`;
        } else if (userAgent.includes('Android')) {
            device = 'Android';
            const match = userAgent.match(/Android ([\d.]+)/);
            if (match) os = `Android ${match[1]}`;
        }
        
        const browserText = browserVersion ? `${browser} ${browserVersion}` : browser;
        return os ? `${device} • ${browserText} • ${os}` : `${device} • ${browserText}`;
    };

    const getLocationFromIP = (ipAddress) => {
        return ipAddress || 'Unknown Location';
    };

    return {
        auditLogs: filteredAuditLogs,
        totalElements,
        totalPages,
        currentPage,
        pageSize,
        isLoading,
        error: error ? (error.response?.data?.message || error.message) : null,
        filters,
        hasActiveFilters,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        changePageSize,
        updateFilter,
        clearFilters,
        shouldShowPagination,
        startIndex,
        endIndex,
        getEventTypeDisplay,
        getEventStatusColor,
        getEventTypeIcon,
        getBrowserInfo,
        getLocationFromIP,
        auditEnums: {
            eventTypes: enums?.auditEventTypes || [],
            eventStatuses: enums?.auditEventStatuses || []
        }
    };
};