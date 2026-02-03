import React, { useMemo, useState } from 'react';
import { MessageSquarePlus, ThumbsDown, ThumbsUp, Trash2, X } from 'lucide-react';
import { CommentItem, CommentSkeleton } from './CommentItem.jsx';

const formatDate = (v) => {
  const d = v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const ThreadDetailSkeleton = () => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
    <div className="px-5 py-4 border-b border-slate-100">
      <div className="h-5 w-2/3 bg-slate-200 rounded" />
      <div className="mt-2 h-4 w-1/3 bg-slate-200 rounded" />
    </div>
    <div className="p-5">
      <div className="h-4 w-full bg-slate-200 rounded" />
      <div className="mt-2 h-4 w-5/6 bg-slate-200 rounded" />
      <div className="mt-2 h-4 w-4/6 bg-slate-200 rounded" />
    </div>
    <div className="border-t border-slate-100">
      <CommentSkeleton />
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
  const isLiked = threadReaction === 'LIKE';
  const isDisliked = threadReaction === 'DISLIKE';

  const isOwner = useMemo(() => {
    const a = Number(thread?.userId);
    const b = Number(currentUserId);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
    return a === b;
  }, [currentUserId, thread?.userId]);

  const canManage = isOwner && !!thread?.id && !String(thread?.id || '').startsWith('temp-');

  if (!threadId) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-10 text-center">
        <p className="text-sm font-semibold text-slate-900">Select a thread</p>
        <p className="text-sm text-slate-500 mt-1">Choose a thread from the list to view details.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 tracking-tight truncate">{thread?.title || 'Thread'}</div>
            <div className="mt-1 text-xs text-slate-500 tabular-nums">
              {formatDate(thread?.createdAt)}
              {thread?.authorDisplayName ? <span className="ml-2">• by {thread.authorDisplayName}</span> : null}
            </div>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <select
                value={thread?.status || 'OPEN'}
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
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              <button
                type="button"
                onClick={async () => {
                  const ok = window.confirm('Delete this thread?');
                  if (!ok) return;
                  await onDeleteThread?.(threadId);
                }}
                className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 inline-flex items-center justify-center transition-colors duration-300"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="text-sm text-slate-700 whitespace-pre-wrap break-words">
          {thread?.description || ''}
        </div>

        <div className="mt-4 flex items-center gap-3 text-sm">
          <button
            type="button"
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isLiked ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'}`}
            onClick={() => onReactThread?.(threadId, 'LIKE')}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'text-white' : 'text-slate-700'}`} />
            <span className={`font-semibold tabular-nums ${isLiked ? 'text-white' : 'text-slate-900'}`}>{Number(thread?.totalLikes) || 0}</span>
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isDisliked ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'}`}
            onClick={() => onReactThread?.(threadId, 'DISLIKE')}
          >
            <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'text-white' : 'text-slate-700'}`} />
            <span className={`font-semibold tabular-nums ${isDisliked ? 'text-white' : 'text-slate-900'}`}>{Number(thread?.totalDislikes) || 0}</span>
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Comments</p>
            {draftComment?.parentCommentId ? (
              <p className="text-xs text-indigo-600 mt-0.5">
                Replying to comment #{draftComment.parentCommentId}
                <button
                  type="button"
                  className="ml-2 text-xs text-slate-600 hover:text-slate-900"
                  onClick={() => onReplyTarget?.(null)}
                >
                  Cancel
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-0.5">Tap the icon to write a comment</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setComposerOpen((v) => !v)}
            className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center justify-center transition-colors duration-300"
            title={composerOpen ? 'Close' : 'Write a comment'}
          >
            {composerOpen ? <X className="w-4 h-4" /> : <MessageSquarePlus className="w-4 h-4" />}
          </button>
        </div>

        {composerOpen && !draftComment?.parentCommentId && (
          <div className="px-5 pb-5">
            <textarea
              value={draftComment?.content || ''}
              onChange={(e) => onDraftChange?.(e.target.value)}
              placeholder="Write a comment..."
              className="w-full min-h-[90px] rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
            <div className="mt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={onSubmitComment}
                className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        )}

        {commentsError && (
          <div className="px-5 pb-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
              <div className="px-4 pb-2 space-y-3">
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
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-semibold text-slate-900">No comments yet</p>
                <p className="text-sm text-slate-500 mt-1">Be the first to comment.</p>
              </div>
            )}
          </div>
        )}

        {commentsHasMore && (
          <div className="px-5 py-4 bg-slate-50/40 border-t border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={onLoadMoreComments}
              disabled={commentsLoading}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

