import { useCallback, useMemo, useRef, useState } from 'react';
import { forumService } from '../services/forumService.js';
import { getForumVisibilitySettings } from '../utils/forumVisibilitySettings.js';

const clampReaction = (v) => {
  if (v === 'LIKE' || v === 'DISLIKE') return v;
  return null;
};

const reactionToRequest = (reaction) => {
  if (reaction === 'LIKE' || reaction === 'DISLIKE') return reaction;
  return 'CLEAR';
};

const applyDelta = ({ likes, dislikes, prev, next }) => {
  let l = Number(likes) || 0;
  let d = Number(dislikes) || 0;

  if (prev === 'LIKE') l -= 1;
  if (prev === 'DISLIKE') d -= 1;
  if (next === 'LIKE') l += 1;
  if (next === 'DISLIKE') d += 1;

  return { likes: Math.max(0, l), dislikes: Math.max(0, d) };
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
  const [category, setCategory] = useState('SUGGESTIONS');
  const [sort, setSort] = useState('NEW');
  const [search, setSearch] = useState('');

  const [threads, setThreads] = useState([]);
  const [threadsPage, setThreadsPage] = useState(0);
  const [threadsHasMore, setThreadsHasMore] = useState(true);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadsError, setThreadsError] = useState(null);

  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(0);
  const [commentsHasMore, setCommentsHasMore] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  const [draftComment, setDraftComment] = useState({ content: '', parentCommentId: null });

  const threadReactionsRef = useRef(new Map());
  const commentReactionsRef = useRef(new Map());

  const [threadReactions, setThreadReactions] = useState({});

  const pendingKeysRef = useRef(new Set());

  const listParams = useMemo(() => ({
    category,
    q: search,
    sort,
  }), [category, search, sort]);

  const resetThreads = useCallback(() => {
    setThreads([]);
    setThreadsPage(0);
    setThreadsHasMore(true);
    setThreadsError(null);
  }, []);

  const loadThreads = useCallback(async ({ reset = false } = {}) => {
    if (threadsLoading) return;
    setThreadsLoading(true);
    setThreadsError(null);
    try {
      const page = reset ? 0 : threadsPage;
      const data = await forumService.listThreads({ ...listParams, page, size: 20 });
      const normalized = normalizePage(data, page, 20);
      setThreads((prev) => reset ? normalized.content : [...prev, ...normalized.content]);
      setThreadsPage(normalized.number);
      setThreadsHasMore(normalized.number + 1 < normalized.totalPages);
    } catch (e) {
      setThreadsError(e?.message || 'Unable to load threads');
    } finally {
      setThreadsLoading(false);
    }
  }, [listParams, threadsLoading, threadsPage]);

  const loadMoreThreads = useCallback(async () => {
    if (threadsLoading || !threadsHasMore) return;
    const next = threadsPage + 1;
    setThreadsLoading(true);
    setThreadsError(null);
    try {
      const data = await forumService.listThreads({ ...listParams, page: next, size: 20 });
      const normalized = normalizePage(data, next, 20);
      setThreads((prev) => [...prev, ...normalized.content]);
      setThreadsPage(normalized.number);
      setThreadsHasMore(normalized.number + 1 < normalized.totalPages);
    } catch (e) {
      setThreadsError(e?.message || 'Unable to load threads');
    } finally {
      setThreadsLoading(false);
    }
  }, [listParams, threadsHasMore, threadsLoading, threadsPage]);

  const selectThread = useCallback(async (threadId) => {
    if (String(threadId || '').startsWith('temp-')) return;
    setSelectedThreadId(threadId);
    setSelectedThread(null);
    setThreadError(null);
    setComments([]);
    setCommentsPage(0);
    setCommentsHasMore(true);
    setCommentsError(null);
    setDraftComment({ content: '', parentCommentId: null });

    if (!threadId) return;

    setThreadLoading(true);
    try {
      const data = await forumService.getThreadById(threadId);
      setSelectedThread(data || null);
    } catch (e) {
      setThreadError(e?.message || 'Unable to load thread');
    } finally {
      setThreadLoading(false);
    }

    setCommentsLoading(true);
    try {
      const data = await forumService.listComments(threadId, { page: 0, size: 20 });
      const normalized = normalizePage(data, 0, 20);
      setComments(normalized.content);
      setCommentsPage(normalized.number);
      setCommentsHasMore(normalized.number + 1 < normalized.totalPages);
    } catch (e) {
      setCommentsError(e?.message || 'Unable to load comments');
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const loadMoreComments = useCallback(async () => {
    if (!selectedThreadId || commentsLoading || !commentsHasMore) return;
    const next = commentsPage + 1;
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const data = await forumService.listComments(selectedThreadId, { page: next, size: 20 });
      const normalized = normalizePage(data, next, 20);
      setComments((prev) => [...prev, ...normalized.content]);
      setCommentsPage(normalized.number);
      setCommentsHasMore(normalized.number + 1 < normalized.totalPages);
    } catch (e) {
      setCommentsError(e?.message || 'Unable to load comments');
    } finally {
      setCommentsLoading(false);
    }
  }, [commentsHasMore, commentsLoading, commentsPage, selectedThreadId]);

  const setReplyTarget = useCallback((parentCommentId) => {
    setDraftComment((prev) => ({ ...prev, parentCommentId: parentCommentId || null }));
  }, []);

  const updateDraftContent = useCallback((content) => {
    setDraftComment((prev) => ({ ...prev, content }));
  }, []);

  const submitComment = useCallback(async () => {
    if (!selectedThreadId) return;
    const content = String(draftComment.content || '').trim();
    if (!content) return;

    const payload = { content };
    if (draftComment.parentCommentId) payload.parentCommentId = draftComment.parentCommentId;
    payload.authorVisibility = getForumVisibilitySettings().commentAuthorVisibility;

    setCommentsError(null);
    try {
      const created = await forumService.addComment(selectedThreadId, payload);
      setDraftComment({ content: '', parentCommentId: null });
      if (created) {
        setComments((prev) => [created, ...prev]);
      } else {
        await selectThread(selectedThreadId);
      }
    } catch (e) {
      setCommentsError(e?.message || 'Unable to add comment');
    }
  }, [draftComment.content, draftComment.parentCommentId, selectThread, selectedThreadId]);

  const publishThread = useCallback(async ({ category, title, description, authorVisibility }) => {
    const safeTitle = String(title || '').trim();
    const safeDescription = String(description || '').trim();
    const safeCategory = String(category || '').trim();
    const fromSettings = getForumVisibilitySettings().threadAuthorVisibility;
    const safeVisibility = String(authorVisibility || '').trim() || fromSettings || 'ANONYMOUS';
    const tempId = `temp-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const optimistic = {
      id: tempId,
      title: safeTitle,
      description: safeDescription,
      category: safeCategory,
      status: 'OPEN',
      authorVisibility: safeVisibility,
      authorDisplayName: safeVisibility === 'ANONYMOUS' ? 'Anonymous' : 'You',
      totalLikes: 0,
      totalDislikes: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setThreadsError(null);
    setThreadError(null);
    setThreads((prev) => [optimistic, ...prev]);
    setSelectedThreadId(tempId);
    setSelectedThread(optimistic);
    setComments([]);
    setCommentsPage(0);
    setCommentsHasMore(true);
    setCommentsError(null);
    setDraftComment({ content: '', parentCommentId: null });

    try {
      const created = await forumService.publishThread({
        category: safeCategory,
        title: safeTitle,
        description: safeDescription,
        authorVisibility: safeVisibility,
      });

      if (!created?.id) {
        setThreads((prev) => prev.filter((t) => t?.id !== tempId));
        setSelectedThreadId(null);
        setSelectedThread(null);
        return { ok: false, error: 'Unable to publish thread' };
      }

      setThreads((prev) => prev.map((t) => (t?.id === tempId ? created : t)));
      setSelectedThreadId(created.id);
      setSelectedThread(created);
      await selectThread(created.id);
      return { ok: true, data: created };
    } catch (e) {
      setThreads((prev) => prev.filter((t) => t?.id !== tempId));
      setSelectedThreadId(null);
      setSelectedThread(null);
      return { ok: false, error: e?.message || 'Unable to publish thread' };
    }
  }, [selectThread]);

  const changeThreadStatus = useCallback(async (threadId, nextStatus) => {
    if (!threadId || String(threadId || '').startsWith('temp-')) return { ok: false };
    const key = `thread-status:${threadId}`;
    if (pendingKeysRef.current.has(key)) return { ok: false };
    pendingKeysRef.current.add(key);

    let rollbackThreads = null;
    let rollbackSelected = null;

    setThreads((prev) => {
      rollbackThreads = prev;
      return prev.map((t) => (t?.id === threadId ? { ...t, status: nextStatus } : t));
    });
    setSelectedThread((prev) => {
      rollbackSelected = prev;
      if (!prev || prev?.id !== threadId) return prev;
      return { ...prev, status: nextStatus };
    });

    try {
      const updated = await forumService.changeThreadStatus(threadId, { status: nextStatus });
      const status = updated?.status || nextStatus;
      setThreads((prev) => prev.map((t) => (t?.id === threadId ? { ...t, status } : t)));
      setSelectedThread((prev) => (prev && prev?.id === threadId ? { ...prev, status } : prev));
      return { ok: true, data: updated };
    } catch (e) {
      if (rollbackThreads) setThreads(rollbackThreads);
      if (rollbackSelected !== null) setSelectedThread(rollbackSelected);
      return { ok: false, error: e?.message || 'Unable to change status' };
    } finally {
      pendingKeysRef.current.delete(key);
    }
  }, []);

  const deleteThread = useCallback(async (threadId) => {
    if (!threadId || String(threadId || '').startsWith('temp-')) return { ok: false };
    const key = `thread-delete:${threadId}`;
    if (pendingKeysRef.current.has(key)) return { ok: false };
    pendingKeysRef.current.add(key);

    let rollbackThreads = null;
    const wasSelected = selectedThreadId === threadId;

    setThreads((prev) => {
      rollbackThreads = prev;
      return prev.filter((t) => t?.id !== threadId);
    });
    if (wasSelected) {
      setSelectedThreadId(null);
      setSelectedThread(null);
      setComments([]);
      setCommentsPage(0);
      setCommentsHasMore(true);
      setCommentsError(null);
      setDraftComment({ content: '', parentCommentId: null });
    }

    try {
      await forumService.deleteThread(threadId);
      return { ok: true };
    } catch (e) {
      if (rollbackThreads) setThreads(rollbackThreads);
      return { ok: false, error: e?.message || 'Unable to delete thread' };
    } finally {
      pendingKeysRef.current.delete(key);
    }
  }, [selectedThreadId]);

  const reactToThread = useCallback(async (threadId, nextReactionRaw) => {
    const key = `thread:${threadId}`;
    if (!threadId || pendingKeysRef.current.has(key)) return;
    pendingKeysRef.current.add(key);

    const prevReaction = clampReaction(threadReactionsRef.current.get(threadId));
    const wanted = clampReaction(nextReactionRaw);
    const nextReaction = wanted && wanted === prevReaction ? null : wanted;

    const rollback = { threads: null, selectedThread: null, prevReaction };

    setThreads((prev) => {
      rollback.threads = prev;
      return prev.map((t) => {
        if (t?.id !== threadId) return t;
        const delta = applyDelta({ likes: t?.totalLikes, dislikes: t?.totalDislikes, prev: prevReaction, next: nextReaction });
        return { ...t, totalLikes: delta.likes, totalDislikes: delta.dislikes };
      });
    });

    setSelectedThread((prev) => {
      rollback.selectedThread = prev;
      if (!prev || prev?.id !== threadId) return prev;
      const delta = applyDelta({ likes: prev?.totalLikes, dislikes: prev?.totalDislikes, prev: prevReaction, next: nextReaction });
      return { ...prev, totalLikes: delta.likes, totalDislikes: delta.dislikes };
    });

    threadReactionsRef.current.set(threadId, nextReaction);
    setThreadReactions((prev) => ({ ...prev, [threadId]: nextReaction }));

    try {
      await forumService.reactToThread(threadId, { reaction: reactionToRequest(nextReaction) });
    } catch (e) {
      threadReactionsRef.current.set(threadId, rollback.prevReaction);
      setThreadReactions((prev) => ({ ...prev, [threadId]: rollback.prevReaction }));
      if (rollback.threads) setThreads(rollback.threads);
      if (rollback.selectedThread !== null) setSelectedThread(rollback.selectedThread);
    } finally {
      pendingKeysRef.current.delete(key);
    }
  }, []);

  const reactToComment = useCallback(async (threadId, commentId, nextReactionRaw) => {
    const key = `comment:${commentId}`;
    if (!threadId || !commentId || pendingKeysRef.current.has(key)) return;
    pendingKeysRef.current.add(key);

    const nextReaction = clampReaction(nextReactionRaw);
    const prevReaction = clampReaction(commentReactionsRef.current.get(commentId));

    let rollbackComments = null;
    setComments((prev) => {
      rollbackComments = prev;
      return prev.map((c) => {
        if (c?.id !== commentId) return c;
        const delta = applyDelta({ likes: c?.totalLikes, dislikes: c?.totalDislikes, prev: prevReaction, next: nextReaction });
        return { ...c, totalLikes: delta.likes, totalDislikes: delta.dislikes };
      });
    });

    commentReactionsRef.current.set(commentId, nextReaction);

    try {
      await forumService.reactToComment(threadId, commentId, { reaction: reactionToRequest(nextReaction) });
    } catch (e) {
      commentReactionsRef.current.set(commentId, prevReaction);
      if (rollbackComments) setComments(rollbackComments);
    } finally {
      pendingKeysRef.current.delete(key);
    }
  }, []);

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

    reactToThread,
    reactToComment,
  };
};

