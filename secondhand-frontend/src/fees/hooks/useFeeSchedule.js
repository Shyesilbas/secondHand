import { useQuery } from '@tanstack/react-query';
import { feeService } from '../services/feeService.js';

export const FEE_KEYS = {
  schedule: ['fees', 'schedule'],
};

// Fee rules change by configuration only, so a long stale time is enough.
export const useFeeSchedule = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: FEE_KEYS.schedule,
    queryFn: feeService.getFeeSchedule,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  return { schedule: data ?? null, isLoading, error, refetch };
};
