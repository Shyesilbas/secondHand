import { SHOWCASE_QUERY_KEYS } from '../showcase/hooks/queries.js';

/**
 * After a campaign is created, changed or deleted: listing prices shown anywhere may have changed.
 * Detail entries are dropped (they are kept fresh for a long time and would not refetch on their own);
 * lists, the home grid, similar listings and showcases are refetched.
 */
export const refreshCampaignAffectedQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  queryClient.removeQueries({ queryKey: ['listings', 'detail'] });
  queryClient.invalidateQueries({ queryKey: ['listings'] });
  queryClient.invalidateQueries({ queryKey: ['similarListings'] });
  queryClient.invalidateQueries({ queryKey: ['myListings'] });
  queryClient.invalidateQueries({ queryKey: SHOWCASE_QUERY_KEYS.all });
};
