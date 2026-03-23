import React, { useMemo } from 'react';
import { CornerDownRight, ThumbsDown, ThumbsUp } from 'lucide-react';

const formatDateTime = (v) => {
  const d = v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const CommentSkeleton = ({ depth = 0 }) => (
  <div className="px-4 py-3">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse" style={{ marginLeft: depth ? `${depth * 12}px` : undefined }} />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-1/4 bg-slate-200 rounded animate-pulse" />
        <div className="mt-2 h-4 w-full bg-slate-200 rounded animate-pulse" />
        <div className="mt-2 h-4 w-5/6 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

export const CommentItem = ({
  comment,
  depth = 0,
  childrenMap,
  activeReplyId,
  replyDraft,
  onReplyDraftChange,
  onSubmitReply,
  onCancelReply,
  onReply,
  onReact,
  threadId,
}) => {
  const children = useMemo(() => {
    if (!comment?.id) return [];
    return childrenMap?.get(comment.id) || [];
  }, [childrenMap, comment?.id]);

  const indent = Math.min(6, Math.max(0, Number(depth) || 0));
  const isNested = indent > 0;
  const marginLeft = indent ? `${indent * 12}px` : undefined;
  const hasChildren = children.length > 0;
  const isReplyTarget = !!activeReplyId && Number(activeReplyId) === Number(comment?.id);

  return (
    <div className="relative" style={{ marginLeft }}>
      <div
        className={`rounded-2xl border shadow-sm ${
          isNested ? 'border-slate-200 bg-slate-50/70' : 'border-slate-200 bg-white'
        } ${hasChildren ? 'pb-2' : ''}`}
      >
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-slate-800">{String(comment?.authorDisplayName || 'Anonymous')}</span>
                <span className="tabular-nums">{formatDateTime(comment?.createdAt)}</span>
                {isNested ? (
                  <span className="inline-flex items-center rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    Reply
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-sm text-slate-800 whitespace-pre-wrap break-words">
                {comment?.content || ''}
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  onClick={() => onReact?.(threadId, comment?.id, 'LIKE')}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="font-semibold tabular-nums">{Number(comment?.totalLikes) || 0}</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  onClick={() => onReact?.(threadId, comment?.id, 'DISLIKE')}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span className="font-semibold tabular-nums">{Number(comment?.totalDislikes) || 0}</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors"
                  onClick={() => onReply?.(comment?.id)}
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                  Reply
                </button>
              </div>

              {isReplyTarget ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                  <textarea
                    value={replyDraft?.content || ''}
                    onChange={(e) => onReplyDraftChange?.(e.target.value)}
                    placeholder="Write a reply..."
                    autoFocus
                    className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={onCancelReply}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={onSubmitReply}
                      className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

      {children.length > 0 && (
        <div className="px-4 pb-4">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
              Replies
            </div>
            <div className="p-3 space-y-2 border-l-2 border-slate-200">
              {children.map((child) => (
                <CommentItem
                  key={child?.id}
                  comment={child}
                  depth={indent + 1}
                  childrenMap={childrenMap}
                  activeReplyId={activeReplyId}
                  replyDraft={replyDraft}
                  onReplyDraftChange={onReplyDraftChange}
                  onSubmitReply={onSubmitReply}
                  onCancelReply={onCancelReply}
                  onReply={onReply}
                  onReact={onReact}
                  threadId={threadId}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

