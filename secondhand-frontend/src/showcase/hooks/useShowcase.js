import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showcaseService } from '../services/showcaseService.js';
import { SHOWCASE_QUERY_KEYS, useShowcaseQueries } from './queries.js';

export const useShowcase = () => {
 const [error, setError] = useState(null);
 const queryClient = useQueryClient();

 const {
 showcases,
 loading,
 error: queryError,
 refetch: fetchShowcases
 } = useShowcaseQueries({ page: 0, size: 12 });

 const createShowcaseMutation = useMutation({
 mutationFn: ({ listingId, days, paymentType }) =>
 showcaseService.createShowcase(listingId, days, paymentType),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: SHOWCASE_QUERY_KEYS.active() });
 queryClient.invalidateQueries({ queryKey: SHOWCASE_QUERY_KEYS.all });
 },
 onError: (err) => setError(err.message)
 });

 const extendShowcaseMutation = useMutation({
 mutationFn: ({ showcaseId, request }) =>
 showcaseService.extendShowcase(showcaseId, request),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: SHOWCASE_QUERY_KEYS.active() });
 queryClient.invalidateQueries({ queryKey: SHOWCASE_QUERY_KEYS.all });
 },
 onError: (err) => setError(err.message)
 });

 const cancelShowcaseMutation = useMutation({
 mutationFn: (showcaseId) => showcaseService.cancelShowcase(showcaseId),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: SHOWCASE_QUERY_KEYS.active() });
 queryClient.invalidateQueries({ queryKey: SHOWCASE_QUERY_KEYS.all });
 },
 onError: (err) => setError(err.message)
 });

 const createShowcase = (listingId, days, paymentType) =>
 createShowcaseMutation.mutateAsync({ listingId, days, paymentType });

 const extendShowcase = (showcaseId, request) =>
 extendShowcaseMutation.mutateAsync({ showcaseId, request });

 const cancelShowcase = (showcaseId) =>
 cancelShowcaseMutation.mutateAsync(showcaseId);

 return {
 showcases,
 loading: loading || createShowcaseMutation.isPending ||
 extendShowcaseMutation.isPending || cancelShowcaseMutation.isPending,
 error: error || queryError,
 fetchShowcases,
 createShowcase,
 extendShowcase,
 cancelShowcase
 };
};
