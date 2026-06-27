# Root Cause Analysis
The issue occurs because the `usePayListingFee` hook invokes `refetchListings` (which is React Query's `refetch` function for the specific `useDraftListings` observer) rather than properly invalidating the React Query cache using `queryClient.invalidateQueries`.
While `refetch()` triggers a background fetch for the active observer, it does not mark the query as stale across the query client. If there are component state desynchronizations or if the `refetch` uses a stale closure of the query key (e.g., from before `user.id` was available), the local observer might fail to correctly update its data or re-render.
Additionally, since `staleTime` is set to 30 seconds (`30 * 1000`), any manual SPA navigation within 30 seconds (first refresh) will hit the stale React Query cache without refetching. A second refresh later (or hard refresh) finally bypasses the `staleTime` and fetches the correct data from the backend.

# Fix
Use React Query's `queryClient.invalidateQueries` to definitively mark the `PAYMENT_QUERY_KEYS.draftListings` cache as stale and trigger a global refetch.

# Files Modified
- `secondhand-frontend/src/payments/hooks/useListingPaymentFlow.js`: Added `useQueryClient` and `queryClient.invalidateQueries`.
- `secondhand-frontend/src/payments/pages/PayListingFeePage.jsx`: Removed `onSuccess: refetchListings`.
