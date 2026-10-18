import { useQuery } from '@tanstack/react-query';
import { priceHistoryService } from '../services/listingAddonService.js';

const NO_HISTORY = [];

const usePriceHistory = (listingId, { enabled = true } = {}) => {
 const query = useQuery({
 queryKey: ['listings', 'priceHistory', listingId],
 queryFn: () => priceHistoryService.getPriceHistory(listingId),
 enabled: enabled && !!listingId,
 staleTime: 60 * 1000,
 gcTime: 30 * 60 * 1000,
 });

 return {
 priceHistory: query.data || NO_HISTORY,
 loading: query.isLoading,
 error: query.error ?? null,
 };
};

export default usePriceHistory;
