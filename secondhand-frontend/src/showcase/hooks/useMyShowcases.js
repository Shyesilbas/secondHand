import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showcaseService } from '../services/showcaseService.js';
import { getErrorMessage } from '../../common/utils/errorUtils.js';

export const useMyShowcases = (userId, options = {}) => {
 const queryClient = useQueryClient();
 const enabled = options.enabled ?? true;

 const {
 data: showcases = [],
 isLoading,
 error,
 } = useQuery({
 queryKey: ['myShowcases', userId],
 queryFn: showcaseService.getUserShowcases,
 enabled: Boolean(userId) && enabled,
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
 error: error ? getErrorMessage(error, 'Vitrinler yüklenemedi.') : null,
 extendShowcase: (showcaseId, request) => extendMutation.mutateAsync({ showcaseId, request }),
 cancelShowcase: (showcaseId) => cancelMutation.mutateAsync(showcaseId),
 isMutating: extendMutation.isPending || cancelMutation.isPending,
 extendError: extendMutation.error ? getErrorMessage(extendMutation.error, 'Vitrin uzatılamadı.') : null,
 cancelError: cancelMutation.error ? getErrorMessage(cancelMutation.error, 'Vitrin iptal edilemedi.') : null,
 refresh,
 };
};

