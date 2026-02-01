import { useEffect, useState, useCallback } from 'react';
import { priceHistoryService } from '../services/listingAddonService.js';

const usePriceHistory = (listingId) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [latestChange, setLatestChange] = useState(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPriceHistory = useCallback(async () => {
    if (!listingId) return;
    
    setLoading(true);
    setError(null);
    try {
      const [history, latest, exists] = await Promise.all([
        priceHistoryService.getPriceHistory(listingId).catch(() => []),
        priceHistoryService.getLatestPriceChange(listingId).catch(() => null),
        priceHistoryService.hasPriceHistory(listingId).catch(() => false)
      ]);
      
      setPriceHistory(history || []);
      setLatestChange(latest);
      setHasHistory(exists || false);
    } catch (err) {
      setError(err);
      setPriceHistory([]);
      setLatestChange(null);
      setHasHistory(false);
      console.error('Failed to fetch price history:', err);
    } finally {
      setLoading(false);
    }
  }, [listingId]);


  return {
    priceHistory,
    latestChange,
    hasHistory,
    loading,
    error,
    fetchPriceHistory,   };
};

export default usePriceHistory;
