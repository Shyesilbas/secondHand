import { useQuery } from '@tanstack/react-query';
import apiClient from '../../common/services/api/interceptors.js';

export const useActiveReservationCount = (listingId) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['cart', 'reservations', 'count', listingId],
        queryFn: async () => {
            const response = await apiClient.get(`/cart/reservations/count/${listingId}`);
            return response.data.count || 0;
        },
        enabled: Boolean(listingId),
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    return {
        count: data || 0,
        isLoading,
        error
    };
};
