import { useCallback, useState } from 'react';
import { sportsService } from '../services/sportsService.js';

export const useSports = (id = null) => {
  const [sports, setSports] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSports = useCallback(async (sportsId) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await sportsService.getSportsDetails(sportsId);
      setSports(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Error fetching sports listing');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSports = useCallback(async (sportsId, payload) => {
    return sportsService.updateSportsListing(sportsId, payload);
  }, []);

  return {
    sports,
    isLoading,
    error,
    fetchSports,
    updateSports,
  };
};


