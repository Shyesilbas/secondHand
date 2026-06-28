import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forumService } from '../services/forumService.js';
import { getForumVisibilitySettings } from '../utils/forumVisibilitySettings.js';
import {
  FORUM_AUTHOR_VISIBILITY,
  FORUM_DEFAULTS,
  FORUM_MESSAGES,
  FORUM_REACTIONS,
  FORUM_THREAD_STATUSES,
} from '../forumConstants.js';

const clampReaction = (v) => {
  if (v === FORUM_REACTIONS.LIKE || v === FORUM_REACTIONS.DISLIKE) return v;
  return null;
};

const reactionToRequest = (reaction) => {
  if (reaction === FORUM_REACTIONS.LIKE || reaction === FORUM_REACTIONS.DISLIKE) return reaction;
  return FORUM_REACTIONS.CLEAR;
};


const normalizePage = (pageData, fallbackPage, fallbackSize) => {
  const content = Array.isArray(pageData?.content) ? pageData.content : Array.isArray(pageData) ? pageData : [];
  const number = Number.isFinite(Number(pageData?.number)) ? Number(pageData.number) : fallbackPage;
  const size = Number.isFinite(Number(pageData?.size)) ? Number(pageData.size) : fallbackSize;
  const totalPages = Number.isFinite(Number(pageData?.totalPages)) ? Number(pageData.totalPages) : (content.length < size ? number + 1 : number + 2);
  const totalElements = Number.isFinite(Number(pageData?.totalElements)) ? Number(pageData.totalElements) : content.length;
  return { content, number, size, totalPages, totalElements };
};

export const useForum = () => {
  const queryClient = useQueryClient();

  const [category, setCategory] = useState(FORUM_DEFAULTS.CATEGORY);
  const [sort, setSort] = useState(FORUM_DEFAULTS.SORT);
  const [search, setSearch] = useState('');

  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [draftComment, setDraftComment] = useState({ content: '', parentCommentId: null });

  const [tempThreads, setTempThreads] = useState([]);
  const [tempComments, setTempComments] = useState([]);

  const threadReactionsRef = useRef(new Map());
  const commentReactionsRef = useRef(new Map());
  const [threadReactions, setThreadReactions] = useState({});

  const pendingKeysRef = useRef(new Set());

  const listParams = useMemo(() => ({
    category,
    q: search,
    sort,
  }), [category, search, sort]);

  // 1. Threads Infinite Query
  const {
    data: threadsData,
    isLoading: isLoadingThreads,
    isFetchingNextPage: isFetchingNextPageThreads,
    error: errorThreads,
    fetchNextPage: fetchNextPageThreads,
    hasNextPage: hasNextPageThreads,
  } = useInfiniteQuery({
    queryKey: ['forum', 'threads', category, sort, search],
    queryFn: ({ pageParam = 0 }) => forumService.listThreads({ ...listParams, page: pageParam, size: FORUM_DEFAULTS.PAGE_SIZE }),
    getNextPageParam: (lastPage) => {
      const normalized = normalizePage(lastPage, 0, FORUM_DEFAULTS.PAGE_SIZE);
      return normalized.number + 1 < normalized.totalPages ? normalized.number + 1 : undefined;
    },
    staleTime: 30 * 1000,
  });

  const threads = useMemo(() => {
    const list = threadsData?.pages.flatMap(page => {
      const normalized = normalizePage(page, 0, FORUM_DEFAULTS.PAGE_SIZE);
      return normalized.content;
    }) || [];
    return [...tempThreads, ...list];
  }, [threadsData, tempThreads]);

  const threadsLoading = isLoadingThreads || isFetchingNextPageThreads;
  const threadsError = errorThreads?.message || null;
  const threadsHasMore = hasNextPageThreads;

  // 2. Thread Detail Query
  const {
    data: selectedThreadData,
    isLoading: threadLoading,
    error: threadQueryError,
  } = useQuery({
    queryKey: ['forum', 'thread', selectedThreadId],
    queryFn: () => forumService.getThreadById(selectedThreadId),
    enabled: !!selectedThreadId && !String(selectedThreadId).startsWith('temp-'),
  });

  const selectedThread = useMemo(() => {
    if (selectedThreadData) return selectedThreadData;
    return threads.find(t => t?.id === selectedThreadId) || null;
  }, [selectedThreadData, threads, selectedThreadId]);

  const threadError = threadQueryError?.message || null;

  // 3. Comments Infinite Query
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    isFetchingNextPage: isFetchingNextPageComments,
    error: errorComments,
    fetchNextPage: fetchNextPageComments,
    hasNextPage: hasNextPageComments,
  } = useInfiniteQuery({
    queryKey: ['forum', 'comments', selectedThreadId],
    queryFn: ({ pageParam = 0 }) => forumService.listComments(selectedThreadId, { page: pageParam, size: FORUM_DEFAULTS.PAGE_SIZE }),
    getNextPageParam: (lastPage) => {
      const normalized = normalizePage(lastPage, 0, FORUM_DEFAULTS.PAGE_SIZE);
      return normalized.number + 1 < normalized.totalPages ? normalized.number + 1 : undefined;
    },
    enabled: !!selectedThreadId && !String(selectedThreadId).startsWith('temp-'),
    staleTime: 30 * 1000,
  });

  const comments = useMemo(() => {
    const list = commentsData?.pages.flatMap(page => {
      const normalized = normalizePage(page, 0, FORUM_DEFAULTS.PAGE_SIZE);
      return normalized.content;
    }) || [];
    return [...tempComments, ...list];
  }, [commentsData, tempComments]);

  const commentsLoading = isLoadingComments || isFetchingNextPageComments;
  const commentsError = errorComments?.message || null;
  const commentsHasMore = hasNextPageComments;

  useEffect(() => {
    setTempComments([]);
  }, [selectedThreadId]);

  // Reactions syncing
  const hydrateViewerReactionsFromThreads = useCallback((list) => {
    if (!Array.isArray(list) || !list.length) return;
    const m = new Map(threadReactionsRef.current);
    list.forEach((t) => {
      if (!t?.id || String(t.id).startsWith('temp-')) return;
      m.set(t.id, clampReaction(t.viewerReaction));
    });
    threadReactionsRef.current = m;
    setThreadReactions((prev) => {
      const next = { ...prev };
      list.forEach((t) => {
        if (!t?.id || String(t.id).startsWith('temp-')) return;
        next[t.id] = clampReaction(t.viewerReaction);
      });
      return next;
    });
  }, []);

  const hydrateViewerReactionsFromComments = useCallback((list) => {
    if (!Array.isArray(list) || !list.length) return;
    const m = new Map(commentReactionsRef.current);
    list.forEach((c) => {
      if (!c?.id) return;
      m.set(c.id, clampReaction(c.viewerReaction));
    });
    commentReactionsRef.current = m;
  }, []);

  useEffect(() => {
    if (threads.length > 0) {
      hydrateViewerReactionsFromThreads(threads);
    }
  }, [threads, hydrateViewerReactionsFromThreads]);

  useEffect(() => {
    if (comments.length > 0) {
      hydrateViewerReactionsFromComments(comments);
    }
  }, [comments, hydrateViewerReactionsFromComments]);

  const getEffectiveThreadReaction = useCallback((thread) => {
    if (!thread?.id || String(thread.id).startsWith('temp-')) return null;
    if (Object.prototype.hasOwnProperty.call(threadReactions, thread.id)) {
      return clampReaction(threadReactions[thread.id]);
    }
    return clampReaction(thread.viewerReaction);
  }, [threadReactions]);

  // Compatibility helpers
  const resetThreads = useCallback(() => {}, []);
  const loadThreads = useCallback(() => {}, []);

  const loadMoreThreads = useCallback(() => {
    if (hasNextPageThreads) {
      fetchNextPageThreads();
    }
  }, [fetchNextPageThreads, hasNextPageThreads]);

  const loadMoreComments = useCallback(() => {
    if (hasNextPageComments) {
      fetchNextPageComments();
    }
  }, [fetchNextPageComments, hasNextPageComments]);

  const selectThread = useCallback((threadId) => {
    if (String(threadId || '').startsWith('temp-')) return;
    setSelectedThreadId(threadId);
    setDraftComment({ content: '', parentCommentId: null });
  }, []);

  const setReplyTarget = useCallback((parentCommentId) => {
    setDraftComment((prev) => ({ ...prev, parentCommentId: parentCommentId || null }));
  }, []);

  const updateDraftContent = useCallback((content) => {
    setDraftComment((prev) => ({ ...prev, content }));
  }, []);

  // Mutations
  const submitCommentMutation = useMutation({
    mutationFn: ({ threadId, payload }) => forumService.addComment(threadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'comments', selectedThreadId] });
    }
  });

  const submitComment = useCallback(async () => {
    if (!selectedThreadId) return;
    const content = String(draftComment.content || '').trim();
    if (!content) return;

    const payload = { content };
    if (draftComment.parentCommentId) payload.parentCommentId = draftComment.parentCommentId;
    payload.authorVisibility = getForumVisibilitySettings().commentAuthorVisibility;

    setDraftComment({ content: '', parentCommentId: null });

    try {
      const created = await submitCommentMutation.mutateAsync({ threadId: selectedThreadId, payload });
      if (created) {
        setTempComments(prev => [created, ...prev]);
        hydrateViewerReactionsFromComments([created]);
      }
      queryClient.invalidateQueries({ queryKey: ['forum', 'comments', selectedThreadId] });
    } catch {
      // Suppressed
    }
  }, [draftComment, selectedThreadId, submitCommentMutation, hydrateViewerReactionsFromComments, queryClient]);

  const publishThreadMutation = useMutation({
    mutationFn: (payload) => forumService.publishThread(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'threads'] });
    }
  });

  const publishThread = useCallback(async ({ category, title, description, authorVisibility }) => {
    const safeTitle = String(title || '').trim();
    const safeDescription = String(description || '').trim();
    const safeCategory = String(category || '').trim();
    const fromSettings = getForumVisibilitySettings().threadAuthorVisibility;
    const safeVisibility = String(authorVisibility || '').trim()
      || fromSettings
      || FORUM_AUTHOR_VISIBILITY.ANONYMOUS;
    const tempId = `temp-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const optimistic = {
      id: tempId,
      title: safeTitle,
      description: safeDescription,
      category: safeCategory,
      status: FORUM_THREAD_STATUSES.OPEN,
      authorVisibility: safeVisibility,
      authorDisplayName: safeVisibility === FORUM_AUTHOR_VISIBILITY.ANONYMOUS ? 'Anonymous' : 'You',
      totalLikes: 0,
      totalDislikes: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setTempThreads((prev) => [optimistic, ...prev]);
    setSelectedThreadId(tempId);
    setDraftComment({ content: '', parentCommentId: null });

    try {
      const created = await publishThreadMutation.mutateAsync({
        category: safeCategory,
        title: safeTitle,
        description: safeDescription,
        authorVisibility: safeVisibility,
      });

      if (!created?.id) {
        setTempThreads((prev) => prev.filter((t) => t?.id !== tempId));
        setSelectedThreadId(null);
        return { ok: false, error: FORUM_MESSAGES.PUBLISH_THREAD_FAILED };
      }

      setTempThreads((prev) => prev.map((t) => (t?.id === tempId ? created : t)));
      setSelectedThreadId(created.id);
      return { ok: true, data: created };
    } catch (e) {
      setTempThreads((prev) => prev.filter((t) => t?.id !== tempId));
      setSelectedThreadId(null);
      return { ok: false, error: e?.message || FORUM_MESSAGES.PUBLISH_THREAD_FAILED };
    }
  }, [publishThreadMutation]);

  const changeThreadStatusMutation = useMutation({
    mutationFn: ({ threadId, nextStatus }) => forumService.changeThreadStatus(threadId, { status: nextStatus }),
  });

  const changeThreadStatus = useCallback(async (threadId, nextStatus) => {
    if (!threadId || String(threadId || '').startsWith('temp-')) return { ok: false };
    const key = `thread-status:${threadId}`;
    if (pendingKeysRef.current.has(key)) return { ok: false };
    pendingKeysRef.current.add(key);

    try {
      const updated = await changeThreadStatusMutation.mutateAsync({ threadId, nextStatus });
      queryClient.invalidateQueries({ queryKey: ['forum'] });
      return { ok: true, data: updated };
    } catch (e) {
      return { ok: false, error: e?.message || FORUM_MESSAGES.CHANGE_STATUS_FAILED };
    } finally {
      pendingKeysRef.current.delete(key);
    }
  }, [changeThreadStatusMutation, queryClient]);

  const deleteThreadMutation = useMutation({
    mutationFn: (threadId) => forumService.deleteThread(threadId),
  });

  const deleteThread = useCallback(async (threadId) => {
    if (!threadId || String(threadId || '').startsWith('temp-')) return { ok: false };
    const key = `thread-delete:${threadId}`;
    if (pendingKeysRef.current.has(key)) return { ok: false };
    pendingKeysRef.current.add(key);

    const wasSelected = selectedThreadId === threadId;
    if (wasSelected) {
      setSelectedThreadId(null);
      setDraftComment({ content: '', parentCommentId: null });
    }

    try {
      await deleteThreadMutation.mutateAsync(threadId);
      queryClient.invalidateQueries({ queryKey: ['forum', 'threads'] });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e?.message || FORUM_MESSAGES.DELETE_THREAD_FAILED };
    } finally {
      pendingKeysRef.current.delete(key);
    }
  }, [selectedThreadId, deleteThreadMutation, queryClient]);

  const reactToThreadMutation = useMutation({
    mutationFn: ({ threadId, reactionReq }) => forumService.reactToThread(threadId, { reaction: reactionReq }),
  });

  const reactToThread = useCallback(async (threadId, nextReactionRaw) => {
    const key = `thread:${threadId}`;
    if (!threadId || pendingKeysRef.current.has(key)) return;
    pendingKeysRef.current.add(key);

    const prevReaction = clampReaction(threadReactionsRef.current.get(threadId));
    const wanted = clampReaction(nextReactionRaw);
    const nextReaction = wanted && wanted === prevReaction ? null : wanted;

    threadReactionsRef.current.set(threadId, nextReaction);
    setThreadReactions((prev) => ({ ...prev, [threadId]: nextReaction }));

    try {
      await reactToThreadMutation.mutateAsync({ threadId, reactionReq: reactionToRequest(nextReaction) });
      queryClient.invalidateQueries({ queryKey: ['forum'] });
    } catch {
      threadReactionsRef.current.set(threadId, prevReaction);
      setThreadReactions((prev) => ({ ...prev, [threadId]: prevReaction }));
    } finally {
      pendingKeysRef.current.delete(key);
    }
  }, [reactToThreadMutation, queryClient]);

  const reactToCommentMutation = useMutation({
    mutationFn: ({ threadId, commentId, reactionReq }) => forumService.reactToComment(threadId, commentId, { reaction: reactionReq }),
  });

  const reactToComment = useCallback(async (threadId, commentId, nextReactionRaw) => {
    const key = `comment:${commentId}`;
    if (!threadId || !commentId || pendingKeysRef.current.has(key)) return;
    pendingKeysRef.current.add(key);

    const prevReaction = clampReaction(commentReactionsRef.current.get(commentId));
    const wanted = clampReaction(nextReactionRaw);
    const nextReaction = wanted && wanted === prevReaction ? null : wanted;

    commentReactionsRef.current.set(commentId, nextReaction);

    try {
      await reactToCommentMutation.mutateAsync({ threadId, commentId, reactionReq: reactionToRequest(nextReaction) });
      queryClient.invalidateQueries({ queryKey: ['forum', 'comments', threadId] });
    } catch {
      commentReactionsRef.current.set(commentId, prevReaction);
    } finally {
      pendingKeysRef.current.delete(key);
    }
  }, [reactToCommentMutation, queryClient]);

  const commentTree = useMemo(() => {
    const byId = new Map();
    const childrenMap = new Map();
    const roots = [];

    (comments || []).forEach((c) => {
      if (!c?.id) return;
      byId.set(c.id, c);
    });

    (comments || []).forEach((c) => {
      if (!c?.id) return;
      const parentId = c.parentCommentId || null;
      if (!parentId) {
        roots.push(c);
        return;
      }
      if (!byId.has(parentId)) {
        roots.push(c);
        return;
      }
      if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
      childrenMap.get(parentId).push(c);
    });

    const sortByCreatedAsc = (a, b) => {
      const da = new Date(a?.createdAt || 0).getTime();
      const db = new Date(b?.createdAt || 0).getTime();
      return da - db;
    };

    roots.sort(sortByCreatedAsc);
    childrenMap.forEach((arr) => arr.sort(sortByCreatedAsc));

    return { roots, childrenMap };
  }, [comments]);

  return {
    category,
    setCategory,
    sort,
    setSort,
    search,
    setSearch,

    threads,
    threadsLoading,
    threadsError,
    threadsHasMore,
    resetThreads,
    loadThreads,
    loadMoreThreads,

    selectedThreadId,
    selectedThread,
    threadLoading,
    threadError,
    selectThread,

    comments,
    commentTree,
    commentsLoading,
    commentsError,
    commentsHasMore,
    loadMoreComments,

    draftComment,
    setReplyTarget,
    updateDraftContent,
    submitComment,

    publishThread,
    changeThreadStatus,
    deleteThread,

    threadReactions,
    getEffectiveThreadReaction,

    reactToThread,
    reactToComment,
  };
};
