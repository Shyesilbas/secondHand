import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listingService } from '../../listing/services/listingService.js';
import { normalizeArrayResponse } from '../../common/utils/normalizeArrayResponse.js';

export const useUserListings = (userId, options = {}) => {
 const enabled = options.enabled ?? true;
 const [page, setPage] = useState(options.page ?? 0);
 const [size, setSize] = useState(options.size ?? 10);

 const query = useQuery({
 queryKey: ['listings', 'byUser', userId, page, size],
 queryFn: () => listingService.getListingByUserId(userId, page, size),
 enabled: enabled && !!userId,
 placeholderData: keepPreviousData,
 });

 const data = query.data?.data || query.data;
 const listings = useMemo(() => normalizeArrayResponse(data), [data]);
 const isPlainArray = Array.isArray(data);
 const pagination = {
 number: data?.pageable?.pageNumber ?? data?.number ?? page,
 size: data?.pageable?.pageSize ?? data?.size ?? size,
 totalPages: data?.totalPages ?? (isPlainArray ? 1 : 0),
 totalElements: data?.totalElements ?? (isPlainArray ? data.length : 0),
 first: data?.first ?? page === 0,
 last: data?.last ?? isPlainArray,
 };

 return {
 listings,
 isLoading: query.isLoading,
 error: query.error ? query.error.response?.data?.message || query.error.message || 'Failed to fetch listings' : null,
 pagination,
 refetch: query.refetch,
 loadPage: setPage,
 handlePageSizeChange: (nextSize) => {
 setPage(0);
 setSize(nextSize);
 },
 };
};
