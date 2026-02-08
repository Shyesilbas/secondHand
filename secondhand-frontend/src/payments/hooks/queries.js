import { useQuery } from '@tanstack/react-query';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { paymentService } from '../services/paymentService.js';
import { PAYMENT_QUERY_KEYS } from '../paymentSchema.js';

export const usePaymentsQuery = ({ userId, currentPage, pageSize, filters }) => {
  return useQuery({
    queryKey: [...PAYMENT_QUERY_KEYS.payments, 'my', 'list', userId || 'anonymous', currentPage, pageSize, filters],
    queryFn: async () => {
      const paymentsData = await paymentService.getMyPayments(currentPage, pageSize, filters);
      const payments = paymentsData.content || [];

      return {
        payments,
        pagination: {
          totalElements: paymentsData.totalElements || 0,
          totalPages: paymentsData.totalPages || 0,
          number: paymentsData.number || currentPage,
          size: paymentsData.size || pageSize,
        },
      };
    },
    enabled: !!userId,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  });
};

export const useBankAccountsQuery = (options = {}) => {
  const { enabled = true } = options;
  const { user, isAuthenticated } = useAuthState();

  return useQuery({
    queryKey: [...PAYMENT_QUERY_KEYS.bankAccounts, user?.id],
    queryFn: async () => {
      const data = await paymentService.getBankAccounts();
      return Array.isArray(data) ? data : [];
    },
    enabled: enabled && !!(isAuthenticated && user?.id),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
  });
};

export const usePaymentStatisticsQuery = (paymentType, options = {}) => {
  const { enabled = true } = options;
  const { user, isAuthenticated } = useAuthState();

  return useQuery({
    queryKey: [...PAYMENT_QUERY_KEYS.paymentStatistics, user?.id, paymentType],
    queryFn: () => paymentService.getStatistics(paymentType),
    enabled: enabled && !!paymentType && !!(isAuthenticated && user?.id),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
};

