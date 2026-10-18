import { useCallback, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { forumService } from '../services/forumService.js';
import { getForumVisibilitySettings } from '../utils/forumVisibilitySettings.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { FORUM_AUTHOR_VISIBILITY, FORUM_DEFAULTS, FORUM_MESSAGES } from '../forumConstants.js';
import { clampReaction, flattenPages, nextPageParam, reactionToRequest } from './forumQueryUtils.js';

/** Thread list with filters, publishing, moderation and optimistic thread reactions. */
export const useForumThreads = () => {
 const queryClient = useQueryClient();
 const { showError } = useNotification();
 const [category, setCategory] = useState(FORUM_DEFAULTS.CATEGORY);
 const [sort, setSort] = useState(FORUM_DEFAULTS.SORT);
 const [search, setSearch] = useState('');
 const [reactionOverrides, setReactionOverrides] = useState({});
 const pendingKeysRef = useRef(new Set());

 const { data, isLoading, isFetchingNextPage, error, fetchNextPage, hasNextPage } = useInfiniteQuery({
 queryKey: ['forum', 'threads', category, sort, search],
 queryFn: ({ pageParam = 0 }) => forumService.listThreads({ category, q: search, sort, page: pageParam, size: FORUM_DEFAULTS.PAGE_SIZE }),
 getNextPageParam: nextPageParam,
 staleTime: 30 * 1000,
 });
 const threads = useMemo(() => flattenPages(data), [data]);

 const getEffectiveThreadReaction = useCallback((thread) => {
 if (!thread?.id) return null;
 return clampReaction(thread.id in reactionOverrides ? reactionOverrides[thread.id] : thread.viewerReaction);
 }, [reactionOverrides]);

 // Guards against double submits while a request for the same key is in flight.
 const runExclusive = useCallback(async (key, task) => {
 if (pendingKeysRef.current.has(key)) return { ok: false };
 pendingKeysRef.current.add(key);
 try {
 return await task();
 } finally {
 pendingKeysRef.current.delete(key);
 }
 }, []);

 const publishThread = useCallback(async ({ category: threadCategory, title, description, authorVisibility }) => {
 try {
 const created = await forumService.publishThread({
 category: String(threadCategory || '').trim(),
 title: String(title || '').trim(),
 description: String(description || '').trim(),
 authorVisibility: String(authorVisibility || '').trim() || getForumVisibilitySettings().threadAuthorVisibility || FORUM_AUTHOR_VISIBILITY.ANONYMOUS,
 });
 if (!created?.id) return { ok: false, error: FORUM_MESSAGES.PUBLISH_THREAD_FAILED };
 queryClient.invalidateQueries({ queryKey: ['forum', 'threads'] });
 return { ok: true, data: created };
 } catch (e) {
 return { ok: false, error: e?.response?.data?.message || FORUM_MESSAGES.PUBLISH_THREAD_FAILED };
 }
 }, [queryClient]);

 const changeThreadStatus = useCallback((threadId, nextStatus) => runExclusive(`thread-status:${threadId}`, async () => {
 try {
 const updated = await forumService.changeThreadStatus(threadId, { status: nextStatus });
 queryClient.invalidateQueries({ queryKey: ['forum'] });
 return { ok: true, data: updated };
 } catch (e) {
 showError('Forum', e?.response?.data?.message || FORUM_MESSAGES.CHANGE_STATUS_FAILED);
 return { ok: false };
 }
 }), [queryClient, runExclusive, showError]);

 const deleteThread = useCallback((threadId) => runExclusive(`thread-delete:${threadId}`, async () => {
 try {
 await forumService.deleteThread(threadId);
 queryClient.invalidateQueries({ queryKey: ['forum', 'threads'] });
 return { ok: true };
 } catch (e) {
 showError('Forum', e?.response?.data?.message || FORUM_MESSAGES.DELETE_THREAD_FAILED);
 return { ok: false };
 }
 }), [queryClient, runExclusive, showError]);

 const reactToThread = useCallback((thread, nextReactionRaw) => runExclusive(`thread:${thread.id}`, async () => {
 const prev = getEffectiveThreadReaction(thread);
 const wanted = clampReaction(nextReactionRaw);
 const next = wanted && wanted === prev ? null : wanted;
 setReactionOverrides((o) => ({ ...o, [thread.id]: next }));
 try {
 await forumService.reactToThread(thread.id, { reaction: reactionToRequest(next) });
 queryClient.invalidateQueries({ queryKey: ['forum'] });
 } catch (e) {
 setReactionOverrides((o) => ({ ...o, [thread.id]: prev }));
 showError('Forum', e?.response?.data?.message || 'Unable to save your reaction');
 }
 }), [getEffectiveThreadReaction, queryClient, runExclusive, showError]);

 return {
 category,
 setCategory,
 sort,
 setSort,
 search,
 setSearch,
 threads,
 threadsLoading: isLoading || isFetchingNextPage,
 threadsError: error?.message || null,
 threadsHasMore: hasNextPage,
 loadMoreThreads: fetchNextPage,
 publishThread,
 changeThreadStatus,
 deleteThread,
 reactToThread,
 getEffectiveThreadReaction,
 };
};
