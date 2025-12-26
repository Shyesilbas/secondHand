import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService.js';

const DASHBOARD_KEYS = {
  all: ['dashboard'],
  seller: (startDate, endDate) => [...DASHBOARD_KEYS.all, 'seller', startDate, endDate],
  buyer: (startDate, endDate) => [...DASHBOARD_KEYS.all, 'buyer', startDate, endDate],
};

export const useSellerDashboard = (startDate, endDate, options = {}) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.seller(startDate, endDate),
    queryFn: () => dashboardService.getSellerDashboard(startDate, endDate),
    enabled: options.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useBuyerDashboard = (startDate, endDate, options = {}) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.buyer(startDate, endDate),
    queryFn: () => dashboardService.getBuyerDashboard(startDate, endDate),
    enabled: options.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

