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
        staleTime: 30 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    });
};

export const usePaymentStatisticsQuery = (providerName, options = {}) => {
    const { enabled = true } = options;
    const { user, isAuthenticated } = useAuthState();

    return useQuery({
        queryKey: [...PAYMENT_QUERY_KEYS.paymentStatistics, user?.id, providerName],
        queryFn: () => paymentService.getStatistics(providerName),
        enabled: enabled && !!(isAuthenticated && user?.id),
        staleTime: 30 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        retry: 1,
    });
};

/** Listing fee and eWallet coverage, both decided by the backend (`GET /v1/listings/fee-quote`). */
export const useListingFeeQuoteQuery = (options = {}) => {
    const { enabled = true } = options;
    const { user, isAuthenticated } = useAuthState();

    return useQuery({
        queryKey: [...PAYMENT_QUERY_KEYS.listingFeeQuote, user?.id],
        queryFn: () => paymentService.getListingFeeQuote(),
        enabled: enabled && !!(isAuthenticated && user?.id),
        staleTime: 15 * 1000,
        refetchOnWindowFocus: true,
    });
};
