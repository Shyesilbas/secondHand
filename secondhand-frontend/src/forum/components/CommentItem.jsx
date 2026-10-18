import { useTranslation } from "react-i18next";
import { useMemo } from 'react';
import { ChevronUp, ChevronDown, CornerDownRight, Send } from 'lucide-react';
import { FORUM_REACTIONS } from '../forumConstants.js';
import { formatForumDateTime } from '../utils/forumDateFormat.js';
export const CommentSkeleton = ({
 depth = 0
}) => <div className="px-5 py-4" style={{
 marginLeft: depth ? `${depth * 20}px` : undefined
}}>
 <div className="flex items-start gap-3 animate-pulse">
 <div className="w-8 h-8 rounded-full bg-tertiary shrink-0" />
 <div className="flex-1 min-w-0">
 <div className="h-3 w-24 bg-tertiary rounded mb-2" />
 <div className="h-4 w-full bg-tertiary rounded mb-1" />
 <div className="h-4 w-4/5 bg-tertiary rounded" />
 </div>
 </div>
 </div>;
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
 threadId
}) => {
 const {
 t
 } = useTranslation();
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
 const myReaction = comment?.viewerReaction === FORUM_REACTIONS.LIKE || comment?.viewerReaction === FORUM_REACTIONS.DISLIKE ? comment.viewerReaction : null;
 const voteUpActive = myReaction === FORUM_REACTIONS.LIKE;
 const voteDownActive = myReaction === FORUM_REACTIONS.DISLIKE;
 const netVotes = (Number(comment?.totalLikes) || 0) - (Number(comment?.totalDislikes) || 0);
 return <div style={{
 marginLeft: indent > 0 ? `${indent * 20}px` : undefined
 }}>
 <div className={`rounded transition-colors duration-200 ${isNested ? 'border-l-2 border-border-light pl-4' : ''}`}>
 <div className="py-3">
 {/* Author row */}
 <div className="flex items-start gap-3">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${isNested ? 'bg-tertiary text-text-muted' : 'bg-background-tertiary text-text-primary'}`}>
 {authorInitial}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
 <span className="font-semibold text-text-primary">{authorName}</span>
 <span className="text-text-muted tabular-nums">{formatForumDateTime(comment?.createdAt)}</span>
 </div>

 <div className="mt-1.5 text-sm text-text-secondary whitespace-pre-wrap break-words leading-relaxed">
 {comment?.content || ''}
 </div>

 {/* Action row */}
 <div className="mt-2.5 flex items-center gap-1">
 {/* Compact vote */}
 <button type="button" className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 ${voteUpActive ? 'text-text-inverse bg-primary ring-1 ring-border/60' : 'text-text-muted hover:text-text-primary hover:bg-background-secondary'}`} onClick={() => onReact?.(threadId, comment?.id, FORUM_REACTIONS.LIKE)}>
 <ChevronUp className="w-4 h-4" />
 </button>
 <span className={`text-xs font-semibold tabular-nums min-w-4 text-center ${netVotes > 0 ? 'text-text-primary' : netVotes < 0 ? 'text-status-error' : 'text-text-muted'}`}>
 {netVotes}
 </span>
 <button type="button" className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 ${voteDownActive ? 'text-status-error-text bg-background-secondary ring-1 ring-status-error-border/60' : 'text-text-muted hover:text-status-error-text hover:bg-background-secondary'}`} onClick={() => onReact?.(threadId, comment?.id, FORUM_REACTIONS.DISLIKE)}>
 <ChevronDown className="w-4 h-4" />
 </button>

 <div className="w-px h-4 bg-tertiary mx-1.5" />

 <button type="button" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary font-medium px-2 py-1.5 rounded-md hover:bg-background-secondary transition-all duration-200" onClick={() => onReply?.(comment?.id)}>
 <CornerDownRight className="w-3 h-3" />{t("reply")}</button>
 </div>

 {/* Reply composer (inline) */}
 {isReplyTarget && <div className="mt-3 rounded border border-border-light bg-secondary-light/60 overflow-hidden focus-within:border-card-border-hover focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
 <textarea value={replyDraft?.content || ''} onChange={e => onReplyDraftChange?.(e.target.value)} placeholder={t("write_a_reply")} autoFocus className="w-full min-h-20 bg-transparent p-3 text-sm text-text-primary placeholder-text-muted focus:outline-none resize-none" />
 <div className="px-3 py-2.5 border-t border-border-light/60 bg-background-primary flex items-center justify-end gap-2">
 <button type="button" onClick={onCancelReply} className="px-3 py-1.5 rounded text-xs font-semibold text-text-secondary hover:bg-tertiary transition-colors duration-200">{t("cancel")}</button>
 <button type="button" onClick={onSubmitReply} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3">
 <Send className="w-3 h-3" />{t("reply")}</button>
 </div>
 </div>}
 </div>
 </div>
 </div>

 {/* Nested children */}
 {hasChildren && <div className="mt-1 space-y-0.5">
 {children.map(child => <CommentItem key={child?.id} comment={child} depth={indent + 1} childrenMap={childrenMap} activeReplyId={activeReplyId} replyDraft={replyDraft} onReplyDraftChange={onReplyDraftChange} onSubmitReply={onSubmitReply} onCancelReply={onCancelReply} onReply={onReply} onReact={onReact} threadId={threadId} />)}
 </div>}
 </div>
 </div>;
};