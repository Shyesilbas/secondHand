import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { NOTIFICATION_PAGE_SIZE, NOTIFICATION_VIEWS } from '../notificationConstants.js';

/**
 * Paged inbox feed. Filtering by read state happens on the server so "Okunmamış" covers every
 * notification, not only the pages already loaded. Keys live under ['notifications'] so the
 * mark-as-read mutations in useInAppNotifications refresh them too.
 */
export const useNotificationFeed = (view = NOTIFICATION_VIEWS.ALL) => {
 const { user } = useAuthState();
 const unreadOnly = view === NOTIFICATION_VIEWS.UNREAD;

 const query = useInfiniteQuery({
 queryKey: ['notifications', 'feed', user?.id, view],
 queryFn: ({ pageParam }) => notificationService.getNotifications(pageParam, NOTIFICATION_PAGE_SIZE, { unreadOnly }),
 initialPageParam: 0,
 getNextPageParam: (lastPage) => {
 const number = lastPage?.number ?? 0;
 const totalPages = lastPage?.totalPages ?? 0;
 return number + 1 < totalPages ? number + 1 : undefined;
 },
 enabled: Boolean(user?.id),
 staleTime: 60 * 1000,
 });

 const notifications = useMemo(
 () => (query.data?.pages ?? []).flatMap((page) => page?.content ?? []),
 [query.data]
 );

 return {
 notifications,
 totalElements: query.data?.pages?.[0]?.totalElements ?? 0,
 isLoading: query.isLoading,
 isError: query.isError,
 refetch: query.refetch,
 fetchNextPage: query.fetchNextPage,
 hasNextPage: Boolean(query.hasNextPage),
 isFetchingNextPage: query.isFetchingNextPage,
 };
};
