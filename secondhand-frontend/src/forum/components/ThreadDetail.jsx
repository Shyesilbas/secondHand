import { useTranslation } from "react-i18next";
import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, MessageSquarePlus, Trash2, X, Send, MessageCircle, User } from 'lucide-react';
import { CommentItem, CommentSkeleton } from './CommentItem.jsx';
import { FORUM_MESSAGES, FORUM_REACTIONS, FORUM_THREAD_STATUS_OPTIONS, FORUM_THREAD_STATUSES } from '../forumConstants.js';
import { formatForumDateTime } from '../utils/forumDateFormat.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
export const ThreadDetailSkeleton = () => <div className="rounded-md border border-border-light bg-background-primary overflow-hidden animate-pulse">
 <div className="px-6 py-5 border-b border-border-light">
 <div className="h-6 w-2/3 bg-tertiary rounded mb-3" />
 <div className="h-4 w-1/3 bg-tertiary rounded" />
 </div>
 <div className="p-6">
 <div className="h-4 w-full bg-tertiary rounded mb-2" />
 <div className="h-4 w-5/6 bg-tertiary rounded mb-2" />
 <div className="h-4 w-4/6 bg-tertiary rounded" />
 </div>
 <div className="border-t border-border-light">
 <CommentSkeleton />
 <CommentSkeleton />
 </div>
 </div>;
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
 onDeleteThread
}) => {
 const {
 t
 } = useTranslation();
 const { showConfirmation } = useNotification();
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
 return <div className="rounded-md border border-border-light/80 bg-background-secondary/90 p-16 text-center shadow-sm ring-1 ring-border-light/80">
 <MessageCircle className="mx-auto mb-5 block h-5 w-5 shrink-0 text-secondary-300" strokeWidth={1.5} aria-hidden />
 <p className="text-base font-semibold text-text-primary">{FORUM_MESSAGES.SELECT_THREAD_TITLE}</p>
 <p className="text-sm text-text-muted mt-1.5 max-w-xs mx-auto">{FORUM_MESSAGES.SELECT_THREAD_DESCRIPTION}</p>
 </div>;
 }
 const commentCount = commentsTree?.roots?.length || 0;
 return <div className="rounded-md border border-border-light/80 bg-background-primary/90 shadow-sm ring-1 ring-border-light/80 overflow-hidden">

 {/* ── Thread Header ─────────────────────────────────── */}
 <div className="px-6 py-5 border-b border-border-light">
 <div className="flex items-start justify-between gap-4">
 <div className="min-w-0 flex-1">
 <h2 className="text-lg font-semibold text-text-primary tracking-tight">
 {thread?.title || FORUM_MESSAGES.SELECT_THREAD_TITLE}
 </h2>
 <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
 {thread?.authorDisplayName && <span className="inline-flex items-center gap-1.5">
 <User className="w-3 h-3" />
 <span className="font-medium text-text-secondary">{thread.authorDisplayName}</span>
 </span>}
 <span className="tabular-nums">{formatForumDateTime(thread?.createdAt)}</span>
 </div>
 </div>

 {canManage && <div className="flex items-center gap-2 shrink-0">
 <select value={thread?.status || FORUM_THREAD_STATUSES.OPEN} onChange={async e => {
 const next = e.target.value;
 setStatusUpdating(true);
 try {
 await onChangeThreadStatus?.(threadId, next);
 } finally {
 setStatusUpdating(false);
 }
 }} disabled={statusUpdating} className="h-9 rounded border border-border-light bg-background-primary px-3 text-xs font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-card-border-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all">
 {FORUM_THREAD_STATUS_OPTIONS.map(statusOption => <option key={statusOption.id} value={statusOption.id}>{statusOption.label}</option>)}
 </select>
 <button type="button" onClick={() => showConfirmation(t("delete"), FORUM_MESSAGES.DELETE_THREAD_CONFIRM, () => onDeleteThread?.(threadId), {
 confirmLabel: t("delete")
 })} className="h-9 w-9 rounded border border-border-light bg-background-primary hover:bg-background-secondary hover:border-border text-text-muted hover:text-status-error-text inline-flex items-center justify-center transition-all duration-200" title={t("delete")}>
 <Trash2 className="w-4 h-4" />
 </button>
 </div>}
 </div>
 </div>

 {/* ── Thread Body ───────────────────────────────────── */}
 <div className="px-6 py-5">
 <div className="text-sm text-text-secondary whitespace-pre-wrap break-words leading-relaxed">
 {thread?.description || ''}
 </div>

 {/* Voting bar */}
 <div className="mt-5 flex items-center gap-1">
 <button type="button" className={`inline-flex items-center justify-center w-9 h-9 rounded border transition-all duration-200 ${isLiked ? 'border-card-border-hover bg-primary text-text-inverse' : 'border-border-light bg-background-primary text-text-muted hover:text-text-primary hover:border-border hover:bg-background-secondary'}`} onClick={() => onReactThread?.(threadId, FORUM_REACTIONS.LIKE)} title={t("upvote")}>
 <ChevronUp className="w-5 h-5" />
 </button>
 <span className={`inline-flex items-center justify-center min-w-9 h-9 text-sm font-semibold tabular-nums ${netVotes > 0 ? 'text-text-primary' : netVotes < 0 ? 'text-status-error' : 'text-text-muted'}`}>
 {netVotes}
 </span>
 <button type="button" className={`inline-flex items-center justify-center w-9 h-9 rounded border transition-all duration-200 ${isDisliked ? 'border-border bg-background-secondary text-status-error-text' : 'border-border-light bg-background-primary text-text-muted hover:text-status-error-text hover:border-border hover:bg-background-secondary'}`} onClick={() => onReactThread?.(threadId, FORUM_REACTIONS.DISLIKE)} title={t("downvote")}>
 <ChevronDown className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* ── Comments Section ──────────────────────────────── */}
 <div className="border-t border-border-light">
 {/* Comments header */}
 <div className="px-6 py-4 flex items-center justify-between gap-3">
 <div className="flex items-center gap-2">
 <h3 className="text-sm font-medium text-text-primary">{t("comments")}</h3>
 <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-sm bg-tertiary text-xs font-semibold text-text-secondary tabular-nums">
 {commentCount}
 </span>
 {draftComment?.parentCommentId ? <span className="text-xs text-text-primary font-medium ml-2">{t("replying")}<button type="button" className="ml-1.5 text-xs text-text-muted hover:text-text-secondary" onClick={() => onReplyTarget?.(null)}>{t("cancel")}</button>
 </span> : null}
 </div>
 <button type="button" onClick={() => setComposerOpen(v => !v)} className={`h-9 w-9 rounded border inline-flex items-center justify-center transition-all duration-200 ${composerOpen ? 'border-card-border-hover bg-primary text-text-inverse' : 'border-border-light bg-background-primary hover:bg-secondary-light text-text-muted hover:text-text-secondary'}`} title={composerOpen ? FORUM_MESSAGES.CLOSE : FORUM_MESSAGES.WRITE_COMMENT}>
 {composerOpen ? <X className="w-4 h-4" /> : <MessageSquarePlus className="w-4 h-4" />}
 </button>
 </div>

 {/* Comment composer */}
 {composerOpen && !draftComment?.parentCommentId && <div className="px-6 pb-5">
 <div className="rounded border border-border-light bg-secondary-light/60 overflow-hidden focus-within:border-card-border-hover focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
 <textarea value={draftComment?.content || ''} onChange={e => onDraftChange?.(e.target.value)} placeholder={t("share_your_thoughts")} className="w-full min-h-24 bg-transparent p-4 text-sm text-text-primary placeholder-text-muted focus:outline-none resize-none" />
 <div className="px-4 py-3 border-t border-border-light/60 bg-background-primary flex items-center justify-end">
 <button type="button" onClick={onSubmitComment} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3">
 <Send className="w-3.5 h-3.5" />{t("post")}</button>
 </div>
 </div>
 </div>}

 {commentsError && <div className="px-6 pb-4">
 <div className="rounded border border-border bg-background-secondary px-4 py-3 text-sm text-status-error-text font-medium">
 {commentsError}
 </div>
 </div>}

 {commentsLoading && commentsTree?.roots?.length === 0 ? <div>
 <CommentSkeleton />
 <CommentSkeleton />
 <CommentSkeleton />
 </div> : <div>
 {commentsTree?.roots?.length ? <div className="px-5 pb-4 space-y-2.5">
 {commentsTree.roots.map(c => <CommentItem key={c?.id} comment={c} depth={0} childrenMap={commentsTree.childrenMap} activeReplyId={draftComment?.parentCommentId || null} replyDraft={draftComment} onReplyDraftChange={onDraftChange} onSubmitReply={onSubmitComment} onCancelReply={() => onReplyTarget?.(null)} onReply={id => {
 setComposerOpen(false);
 onReplyTarget?.(id);
 }} onReact={onReactComment} threadId={threadId} />)}
 </div> : <div className="px-6 py-12 text-center">
 <p className="text-sm font-semibold text-text-muted">{FORUM_MESSAGES.NO_COMMENTS_YET}</p>
 <p className="text-xs text-text-muted mt-1">{FORUM_MESSAGES.BE_FIRST_TO_COMMENT}</p>
 </div>}
 </div>}

 {commentsHasMore && <div className="px-6 py-4 border-t border-border-light flex justify-center">
 <button type="button" onClick={onLoadMoreComments} disabled={commentsLoading} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4">
 {commentsLoading ? 'Loading...' : FORUM_MESSAGES.LOAD_MORE}
 </button>
 </div>}
 </div>
 </div>;
};