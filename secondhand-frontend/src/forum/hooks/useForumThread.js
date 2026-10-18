import { useCallback, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { forumService } from '../services/forumService.js';
import { getForumVisibilitySettings } from '../utils/forumVisibilitySettings.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { FORUM_DEFAULTS, FORUM_MESSAGES } from '../forumConstants.js';
import { clampReaction, flattenPages, nextPageParam, reactionToRequest } from './forumQueryUtils.js';

const EMPTY_DRAFT = { threadId: null, content: '', parentCommentId: null };

const buildCommentTree = (comments) => {
 const byId = new Map(comments.filter((c) => c?.id).map((c) => [c.id, c]));
 const childrenMap = new Map();
 const roots = [];
 byId.forEach((c) => {
 const parentId = c.parentCommentId || null;
 if (!parentId || !byId.has(parentId)) {
 roots.push(c);
 return;
 }
 if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
 childrenMap.get(parentId).push(c);
 });
 const byCreatedAsc = (a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime();
 roots.sort(byCreatedAsc);
 childrenMap.forEach((arr) => arr.sort(byCreatedAsc));
 return { roots, childrenMap };
};

/** Selected thread detail, its comments, the reply draft and comment reactions. */
export const useForumThread = (threadId) => {
 const queryClient = useQueryClient();
 const { showError } = useNotification();
 // The draft remembers its thread, so switching threads shows an empty draft without an effect.
 const [draftState, setDraftState] = useState(EMPTY_DRAFT);
 const draftComment = draftState.threadId === threadId ? draftState : { ...EMPTY_DRAFT, threadId };
 const pendingKeysRef = useRef(new Set());

 const { data: thread, isLoading: threadLoading } = useQuery({
 queryKey: ['forum', 'thread', threadId],
 queryFn: () => forumService.getThreadById(threadId),
 enabled: !!threadId,
 });

 const { data, isLoading, isFetchingNextPage, error, fetchNextPage, hasNextPage } = useInfiniteQuery({
 queryKey: ['forum', 'comments', threadId],
 queryFn: ({ pageParam = 0 }) => forumService.listComments(threadId, { page: pageParam, size: FORUM_DEFAULTS.PAGE_SIZE }),
 getNextPageParam: nextPageParam,
 enabled: !!threadId,
 staleTime: 30 * 1000,
 });
 const comments = useMemo(() => flattenPages(data), [data]);
 const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

 const setReplyTarget = useCallback((parentCommentId) => {
 setDraftState((d) => ({ ...(d.threadId === threadId ? d : { ...EMPTY_DRAFT, threadId }), parentCommentId: parentCommentId || null }));
 }, [threadId]);

 const updateDraftContent = useCallback((content) => {
 setDraftState((d) => ({ ...(d.threadId === threadId ? d : { ...EMPTY_DRAFT, threadId }), content }));
 }, [threadId]);

 const submitComment = useCallback(async () => {
 const content = String(draftComment.content || '').trim();
 if (!threadId || !content) return;
 const payload = { content, authorVisibility: getForumVisibilitySettings().commentAuthorVisibility };
 if (draftComment.parentCommentId) payload.parentCommentId = draftComment.parentCommentId;
 try {
 await forumService.addComment(threadId, payload);
 setDraftState(EMPTY_DRAFT);
 queryClient.invalidateQueries({ queryKey: ['forum', 'comments', threadId] });
 } catch (e) {
 // Keep the draft so the user can retry.
 showError('Forum', e?.response?.data?.message || FORUM_MESSAGES.ADD_COMMENT_FAILED);
 }
 }, [draftComment.content, draftComment.parentCommentId, queryClient, showError, threadId]);

 const reactToComment = useCallback(async (commentThreadId, commentId, nextReactionRaw) => {
 const key = `comment:${commentId}`;
 if (!commentThreadId || !commentId || pendingKeysRef.current.has(key)) return;
 pendingKeysRef.current.add(key);
 const prev = clampReaction(comments.find((c) => c?.id === commentId)?.viewerReaction);
 const wanted = clampReaction(nextReactionRaw);
 const next = wanted && wanted === prev ? null : wanted;
 try {
 await forumService.reactToComment(commentThreadId, commentId, { reaction: reactionToRequest(next) });
 queryClient.invalidateQueries({ queryKey: ['forum', 'comments', commentThreadId] });
 } catch (e) {
 showError('Forum', e?.response?.data?.message || 'Unable to save your reaction');
 } finally {
 pendingKeysRef.current.delete(key);
 }
 }, [comments, queryClient, showError]);

 return {
 thread,
 threadLoading: !!threadId && threadLoading,
 commentTree,
 commentsLoading: isLoading || isFetchingNextPage,
 commentsError: error?.message || null,
 commentsHasMore: hasNextPage,
 loadMoreComments: fetchNextPage,
 draftComment,
 setReplyTarget,
 updateDraftContent,
 submitComment,
 reactToComment,
 };
};
