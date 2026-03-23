import { useQuery } from '@tanstack/react-query';
import { priceHistoryService } from '../services/listingAddonService.js';
import logger from '../../common/utils/logger.js';

const usePriceHistory = (listingId) => {
  const query = useQuery({
    queryKey: ['listings', 'priceHistory', listingId],
    enabled: false, // manual trigger from modal
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    retryDelay: 1000,
    queryFn: async () => {
      if (!listingId) return { priceHistory: [], latestChange: null, hasHistory: false };

      try {
        const [history, latest, exists] = await Promise.all([
          priceHistoryService.getPriceHistory(listingId).catch(() => []),
          priceHistoryService.getLatestPriceChange(listingId).catch(() => null),
          priceHistoryService.hasPriceHistory(listingId).catch(() => false),
        ]);

        return { priceHistory: history || [], latestChange: latest, hasHistory: exists || false };
      } catch (err) {
        logger.error('Failed to fetch price history:', err);
        throw err;
      }
    },
  });

  const isError = query.isError;

  return {
    priceHistory: isError ? [] : query.data?.priceHistory ?? [],
    latestChange: isError ? null : query.data?.latestChange ?? null,
    hasHistory: isError ? false : query.data?.hasHistory ?? false,
    loading: query.isFetching,
    error: query.error ?? null,
    fetchPriceHistory: query.refetch,
  };
};

export default usePriceHistory;
