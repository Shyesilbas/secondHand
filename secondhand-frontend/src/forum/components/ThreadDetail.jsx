import React, {useMemo, useState} from 'react';
import {ChevronUp, ChevronDown, MessageSquarePlus, Trash2, X, Send, MessageCircle, User} from 'lucide-react';
import {CommentItem, CommentSkeleton} from './CommentItem.jsx';
import {
  FORUM_MESSAGES,
  FORUM_REACTIONS,
  FORUM_THREAD_STATUS_OPTIONS,
  FORUM_THREAD_STATUSES,
} from '../forumConstants.js';
import {formatForumDateTime} from '../utils/forumDateFormat.js';

export const ThreadDetailSkeleton = () => (
  <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden animate-pulse">
    <div className="px-6 py-5 border-b border-gray-100">
      <div className="h-6 w-2/3 bg-gray-200 rounded mb-3" />
      <div className="h-4 w-1/3 bg-gray-100 rounded" />
    </div>
    <div className="p-6">
      <div className="h-4 w-full bg-gray-100 rounded mb-2" />
      <div className="h-4 w-5/6 bg-gray-100 rounded mb-2" />
      <div className="h-4 w-4/6 bg-gray-100 rounded" />
    </div>
    <div className="border-t border-gray-100">
      <CommentSkeleton />
      <CommentSkeleton />
    </div>
  </div>
);

export const ThreadDetail = ({
  thread,
  threadId,
  currentUserId,
  threadReaction,
  commentsTree,
  commentsLoading,
  commentsError,
  commentsHasMore,
  onLoadMoreComments,
  draftComment,
  onDraftChange,
  onReplyTarget,
  onSubmitComment,
  onReactThread,
  onReactComment,
  onChangeThreadStatus,
  onDeleteThread,
}) => {
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const isLiked = threadReaction === FORUM_REACTIONS.LIKE;
  const isDisliked = threadReaction === FORUM_REACTIONS.DISLIKE;
  const netVotes = (Number(thread?.totalLikes) || 0) - (Number(thread?.totalDislikes) || 0);

  const isOwner = useMemo(() => {
    const a = Number(thread?.userId);
    const b = Number(currentUserId);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
    return a === b;
  }, [currentUserId, thread?.userId]);

  const canManage = isOwner && !!thread?.id && !String(thread?.id || '').startsWith('temp-');

  if (!threadId) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
          <MessageCircle className="w-7 h-7 text-gray-300" />
        </div>
        <p className="text-base font-semibold text-gray-900">{FORUM_MESSAGES.SELECT_THREAD_TITLE}</p>
        <p className="text-sm text-gray-500 mt-1.5 max-w-xs mx-auto">{FORUM_MESSAGES.SELECT_THREAD_DESCRIPTION}</p>
      </div>
    );
  }

  const commentCount = commentsTree?.roots?.length || 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">

      {/* ── Thread Header ─────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight leading-snug">
              {thread?.title || FORUM_MESSAGES.SELECT_THREAD_TITLE}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              {thread?.authorDisplayName && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  <span className="font-medium text-gray-700">{thread.authorDisplayName}</span>
                </span>
              )}
              <span className="tabular-nums">{formatForumDateTime(thread?.createdAt)}</span>
            </div>
          </div>

          {canManage && (
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={thread?.status || FORUM_THREAD_STATUSES.OPEN}
                onChange={async (e) => {
                  const next = e.target.value;
                  setStatusUpdating(true);
                  try {
                    await onChangeThreadStatus?.(threadId, next);
                  } finally {
                    setStatusUpdating(false);
                  }
                }}
                disabled={statusUpdating}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                {FORUM_THREAD_STATUS_OPTIONS.map((statusOption) => (
                  <option key={statusOption.id} value={statusOption.id}>{statusOption.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={async () => {
                  const ok = window.confirm(FORUM_MESSAGES.DELETE_THREAD_CONFIRM);
                  if (!ok) return;
                  await onDeleteThread?.(threadId);
                }}
                className="h-9 w-9 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-600 inline-flex items-center justify-center transition-all duration-200"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Thread Body ───────────────────────────────────── */}
      <div className="px-6 py-5">
        <div className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
          {thread?.description || ''}
        </div>

        {/* Voting bar */}
        <div className="mt-5 flex items-center gap-1">
          <button
            type="button"
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 ${
              isLiked
                ? 'border-violet-300 bg-violet-50 text-violet-600'
                : 'border-gray-200 bg-white text-gray-400 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50'
            }`}
            onClick={() => onReactThread?.(threadId, FORUM_REACTIONS.LIKE)}
            title="Upvote"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className={`inline-flex items-center justify-center min-w-[36px] h-9 text-sm font-bold tabular-nums ${
            netVotes > 0 ? 'text-violet-600' : netVotes < 0 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {netVotes}
          </span>
          <button
            type="button"
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 ${
              isDisliked
                ? 'border-red-300 bg-red-50 text-red-500'
                : 'border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
            }`}
            onClick={() => onReactThread?.(threadId, FORUM_REACTIONS.DISLIKE)}
            title="Downvote"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Comments Section ──────────────────────────────── */}
      <div className="border-t border-gray-100">
        {/* Comments header */}
        <div className="px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">Comments</h3>
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-gray-100 text-[11px] font-bold text-gray-600 tabular-nums">
              {commentCount}
            </span>
            {draftComment?.parentCommentId ? (
              <span className="text-xs text-violet-600 font-medium ml-2">
                Replying...
                <button
                  type="button"
                  className="ml-1.5 text-xs text-gray-400 hover:text-gray-600"
                  onClick={() => onReplyTarget?.(null)}
                >
                  Cancel
                </button>
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setComposerOpen((v) => !v)}
            className={`h-9 w-9 rounded-lg border inline-flex items-center justify-center transition-all duration-200 ${
              composerOpen
                ? 'border-violet-300 bg-violet-50 text-violet-600'
                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700'
            }`}
            title={composerOpen ? FORUM_MESSAGES.CLOSE : FORUM_MESSAGES.WRITE_COMMENT}
          >
            {composerOpen ? <X className="w-4 h-4" /> : <MessageSquarePlus className="w-4 h-4" />}
          </button>
        </div>

        {/* Comment composer */}
        {composerOpen && !draftComment?.parentCommentId && (
          <div className="px-6 pb-5">
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 overflow-hidden focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all duration-200">
              <textarea
                value={draftComment?.content || ''}
                onChange={(e) => onDraftChange?.(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full min-h-[100px] bg-transparent p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none"
              />
              <div className="px-4 py-3 border-t border-gray-200/60 bg-white flex items-center justify-end">
                <button
                  type="button"
                  onClick={onSubmitComment}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors duration-200"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post
                </button>
              </div>
            </div>
          </div>
        )}

        {commentsError && (
          <div className="px-6 pb-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
              {commentsError}
            </div>
          </div>
        )}

        {commentsLoading && commentsTree?.roots?.length === 0 ? (
          <div>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        ) : (
          <div>
            {commentsTree?.roots?.length ? (
              <div className="px-5 pb-4 space-y-2.5">
                {commentsTree.roots.map((c) => (
                  <CommentItem
                    key={c?.id}
                    comment={c}
                    depth={0}
                    childrenMap={commentsTree.childrenMap}
                    activeReplyId={draftComment?.parentCommentId || null}
                    replyDraft={draftComment}
                    onReplyDraftChange={onDraftChange}
                    onSubmitReply={onSubmitComment}
                    onCancelReply={() => onReplyTarget?.(null)}
                    onReply={(id) => {
                      setComposerOpen(false);
                      onReplyTarget?.(id);
                    }}
                    onReact={onReactComment}
                    threadId={threadId}
                  />
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-semibold text-gray-500">{FORUM_MESSAGES.NO_COMMENTS_YET}</p>
                <p className="text-xs text-gray-400 mt-1">{FORUM_MESSAGES.BE_FIRST_TO_COMMENT}</p>
              </div>
            )}
          </div>
        )}

        {commentsHasMore && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-center">
            <button
              type="button"
              onClick={onLoadMoreComments}
              disabled={commentsLoading}
              className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {commentsLoading ? 'Loading...' : FORUM_MESSAGES.LOAD_MORE}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
