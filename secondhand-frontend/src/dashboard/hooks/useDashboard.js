import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService.js';
import { useAuthState } from '../../auth/AuthContext.jsx';

const toKeyDate = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d.toISOString().slice(0, 10);
    return String(d).slice(0, 10);
};

const DASHBOARD_KEYS = {
    all: ['dashboard'],
    seller: (userId, startDate, endDate) => [...DASHBOARD_KEYS.all, 'seller', userId, toKeyDate(startDate), toKeyDate(endDate)],
    buyer: (userId, startDate, endDate) => [...DASHBOARD_KEYS.all, 'buyer', userId, toKeyDate(startDate), toKeyDate(endDate)],
};

export const useSellerDashboard = (startDate, endDate, options = {}) => {
    const { user, isAuthenticated } = useAuthState();
    return useQuery({
        queryKey: DASHBOARD_KEYS.seller(user?.id, startDate, endDate),
        queryFn: () => dashboardService.getSellerDashboard(startDate, endDate),
        enabled: options.enabled !== false && !!(isAuthenticated && user?.id),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

export const useBuyerDashboard = (startDate, endDate, options = {}) => {
    const { user, isAuthenticated } = useAuthState();
    return useQuery({
        queryKey: DASHBOARD_KEYS.buyer(user?.id, startDate, endDate),
        queryFn: () => dashboardService.getBuyerDashboard(startDate, endDate),
        enabled: options.enabled !== false && !!(isAuthenticated && user?.id),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

