import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogService } from '../services/auditLogService.js';
import { useAuth } from '../../auth/AuthContext.jsx';

export const useAuditLogs = (filters = {}) => {
    const { user } = useAuth();
    const [filteredLogs, setFilteredLogs] = useState([]);

    const {
        data: auditLogs = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['auditLogs', user?.email],
        queryFn: () => auditLogService.getUserAuditLogsByEmail(user?.email),
        enabled: !!user?.email,
        staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        refetchOnWindowFocus: false, // Don't refetch when window gains focus
        refetchOnMount: true, // Only refetch when component mounts
        // Removed refetchInterval to stop automatic polling
    });

    // Get audit enums
    const {
        data: auditEnums = { eventTypes: [], eventStatuses: [] },
        isLoading: isLoadingEnums
    } = useQuery({
        queryKey: ['auditEnums'],
        queryFn: () => auditLogService.getAllEnums(),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    // Filter logs based on filters
    useEffect(() => {
        if (auditLogs && auditLogs.length > 0) {
            let filtered = auditLogs;

            // Filter by event type
            if (filters.eventType && filters.eventType !== 'ALL') {
                filtered = filtered.filter(log => log.eventType === filters.eventType);
            }

            // Filter by event status
            if (filters.eventStatus && filters.eventStatus !== 'ALL') {
                filtered = filtered.filter(log => log.eventStatus === filters.eventStatus);
            }

            // Filter by date range
            if (filters.startDate && filters.endDate) {
                filtered = filtered.filter(log => {
                    const logDate = new Date(log.createdAt);
                    return logDate >= filters.startDate && logDate <= filters.endDate;
                });
            }

            setFilteredLogs(filtered);
        }
    }, [auditLogs, filters]);

    const getEventTypeDisplay = (eventType) => {
        const eventTypeEnum = auditEnums.eventTypes.find(et => et.value === eventType);
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

    const getLastPasswordChangeDate = () => {
        if (!auditLogs || auditLogs.length === 0) return null;
        
        const passwordChangeLogs = auditLogs.filter(log => 
            log.eventType === 'PASSWORD_CHANGE_SUCCESS'
        );
        
        if (passwordChangeLogs.length === 0) return null;
        
        // Sort by date and get the most recent one
        const sortedLogs = passwordChangeLogs.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        return sortedLogs[0].createdAt;
    };

    const getPasswordAge = () => {
        const lastChangeDate = getLastPasswordChangeDate();
        if (!lastChangeDate) return null;
        
        const now = new Date();
        const changeDate = new Date(lastChangeDate);
        const diffTime = Math.abs(now - changeDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    };

    const getPasswordAgeStatus = () => {
        const age = getPasswordAge();
        if (!age) return { status: 'unknown', color: 'gray', message: 'Never changed' };
        
        if (age <= 30) {
            return { status: 'recent', color: 'green', message: `${age} days ago` };
        } else if (age <= 90) {
            return { status: 'moderate', color: 'yellow', message: `${age} days ago` };
        } else if (age <= 180) {
            return { status: 'old', color: 'orange', message: `${age} days ago` };
        } else {
            return { status: 'very-old', color: 'red', message: `${age} days ago` };
        }
    };

    return {
        auditLogs: filteredLogs,
        auditEnums,
        isLoading: isLoading || isLoadingEnums,
        error,
        refetch,
        getEventTypeDisplay,
        getEventStatusColor,
        getEventTypeIcon,
        getLastPasswordChangeDate,
        getPasswordAge,
        getPasswordAgeStatus
    };
};
