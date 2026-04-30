import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showcaseService } from '../services/showcaseService.js';

export const useMyShowcases = (userId) => {
  const queryClient = useQueryClient();

  const {
    data: showcases = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['myShowcases', userId],
    queryFn: showcaseService.getUserShowcases,
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['myShowcases', userId] });
    queryClient.invalidateQueries({ queryKey: ['showcases'] });
  };

  const extendMutation = useMutation({
    mutationFn: ({ showcaseId, request }) => showcaseService.extendShowcase(showcaseId, request),
    onSuccess: refresh,
  });

  const cancelMutation = useMutation({
    mutationFn: (showcaseId) => showcaseService.cancelShowcase(showcaseId),
    onSuccess: refresh,
  });

  return {
    showcases,
    isLoading,
    error: error?.response?.data?.message || error?.message || null,
    extendShowcase: (showcaseId, request) => extendMutation.mutateAsync({ showcaseId, request }),
    cancelShowcase: (showcaseId) => cancelMutation.mutateAsync(showcaseId),
    isMutating: extendMutation.isPending || cancelMutation.isPending,
    extendError: extendMutation.error?.response?.data?.message || extendMutation.error?.message || null,
    cancelError: cancelMutation.error?.response?.data?.message || cancelMutation.error?.message || null,
  };
};

