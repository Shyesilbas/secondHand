import React, {useMemo} from 'react';
import {ChevronUp, ChevronDown, CornerDownRight, Send} from 'lucide-react';
import {FORUM_REACTIONS} from '../forumConstants.js';
import {formatForumDateTime} from '../utils/forumDateFormat.js';

export const CommentSkeleton = ({depth = 0}) => (
  <div className="px-5 py-4" style={{marginLeft: depth ? `${depth * 20}px` : undefined}}>
    <div className="flex items-start gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-full bg-gray-100 rounded mb-1" />
        <div className="h-4 w-4/5 bg-gray-100 rounded" />
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

  const indent = Math.min(4, Math.max(0, Number(depth) || 0));
  const isNested = indent > 0;
  const hasChildren = children.length > 0;
  const isReplyTarget = !!activeReplyId && Number(activeReplyId) === Number(comment?.id);
  const authorName = String(comment?.authorDisplayName || 'Anonymous');
  const authorInitial = authorName.charAt(0).toUpperCase();
  const netVotes = (Number(comment?.totalLikes) || 0) - (Number(comment?.totalDislikes) || 0);

  return (
    <div style={{marginLeft: indent > 0 ? `${indent * 20}px` : undefined}}>
      <div className={`rounded-xl transition-colors duration-200 ${
        isNested ? 'border-l-2 border-gray-200 pl-4' : ''
      }`}>
        <div className="py-3">
          {/* Author row */}
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
              isNested
                ? 'bg-gray-100 text-gray-500'
                : 'bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700'
            }`}>
              {authorInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                <span className="font-semibold text-gray-800">{authorName}</span>
                <span className="text-gray-400 tabular-nums">{formatForumDateTime(comment?.createdAt)}</span>
              </div>

              <div className="mt-1.5 text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                {comment?.content || ''}
              </div>

              {/* Action row */}
              <div className="mt-2.5 flex items-center gap-1">
                {/* Compact vote */}
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all duration-200"
                  onClick={() => onReact?.(threadId, comment?.id, FORUM_REACTIONS.LIKE)}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className={`text-xs font-bold tabular-nums min-w-[16px] text-center ${
                  netVotes > 0 ? 'text-violet-600' : netVotes < 0 ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {netVotes}
                </span>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                  onClick={() => onReact?.(threadId, comment?.id, FORUM_REACTIONS.DISLIKE)}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-gray-200 mx-1.5" />

                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-violet-600 font-medium px-2 py-1.5 rounded-md hover:bg-violet-50 transition-all duration-200"
                  onClick={() => onReply?.(comment?.id)}
                >
                  <CornerDownRight className="w-3 h-3" />
                  Reply
                </button>
              </div>

              {/* Reply composer (inline) */}
              {isReplyTarget && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/60 overflow-hidden focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all duration-200">
                  <textarea
                    value={replyDraft?.content || ''}
                    onChange={(e) => onReplyDraftChange?.(e.target.value)}
                    placeholder="Write a reply..."
                    autoFocus
                    className="w-full min-h-[80px] bg-transparent p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none"
                  />
                  <div className="px-3 py-2.5 border-t border-gray-200/60 bg-white flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={onCancelReply}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={onSubmitReply}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors duration-200"
                    >
                      <Send className="w-3 h-3" />
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nested children */}
        {hasChildren && (
          <div className="mt-1 space-y-0.5">
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
        )}
      </div>
    </div>
  );
};
