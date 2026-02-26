import { useState, useEffect, useMemo } from 'react';
import { auditLogService } from '../services/auditLogService.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import logger from '../../common/utils/logger.js';

export const useAuditLogsPagination = (userEmail, initialPageSize = 10) => {
    const { enums } = useEnums();
    
    // State management
    const [auditLogs, setAuditLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    // Filter states
    const [filters, setFilters] = useState({
        eventType: '',
        eventStatus: '',
        dateFrom: '',
        dateTo: '',
        ipAddress: '',
        userAgent: ''
    });

    // Fetch audit logs from API
    const fetchAuditLogs = async (page, size) => {
        if (!userEmail) return;
        
        try {
            setIsLoading(true);
            setError(null);
            
            const data = await auditLogService.getUserAuditLogsByEmail(userEmail, page, size);
            
            setAuditLogs(data.content || []);
            setTotalElements(data.totalElements || 0);
            setTotalPages(data.totalPages || 0);
            
        } catch (err) {
            logger.error('API ERROR:', err);
            setError(err.response?.data?.message || 'An error occurred while loading security logs');
            setAuditLogs([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data when dependencies change
    useEffect(() => {
        if (userEmail) {
            fetchAuditLogs(currentPage, pageSize);
        }
    }, [userEmail, currentPage, pageSize]);

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
                return 'text-green-600 bg-green-100';
            case 'FAILURE':
                return 'text-red-600 bg-red-100';
            case 'ATTEMPT':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
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
        // Data
        auditLogs: filteredAuditLogs,
        totalElements,
        totalPages,
        currentPage,
        pageSize,
        
        // Loading & Error
        isLoading,
        error,
        
        // Filters
        filters,
        hasActiveFilters,
        
        // Controls
        goToPage,
        goToNextPage,
        goToPreviousPage,
        changePageSize,
        updateFilter,
        clearFilters,
        
        // Pagination Info
        shouldShowPagination,
        startIndex,
        endIndex,
        
        // Helper Functions
        getEventTypeDisplay,
        getEventStatusColor,
        getEventTypeIcon,
        getBrowserInfo,
        getLocationFromIP,
        
        // Enums
        auditEnums: {
            eventTypes: enums?.auditEventTypes || [],
            eventStatuses: enums?.auditEventStatuses || []
        }
    };
};