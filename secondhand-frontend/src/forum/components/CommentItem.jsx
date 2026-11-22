import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { ChevronDown, ChevronUp, CornerDownRight, Send } from 'lucide-react';
import { Button, Skeleton } from '../../common/components/ui/index.js';
import { inputNormal } from '../../common/components/forms/inputStyles.js';
import { FORUM_REACTIONS, formatForumAuthor } from '../forumConstants.js';
import { formatForumDateTime } from '../utils/forumDateFormat.js';

export const CommentSkeleton = ({ depth = 0 }) => (
  <div className="px-5 py-4" style={{ marginLeft: depth ? `${depth * 20}px` : undefined }}>
    <div className="flex items-start gap-3">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
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
  threadId
}) => {
  const { t } = useTranslation();
  const children = useMemo(() => {
    if (!comment?.id) return [];
    return childrenMap?.get(comment.id) || [];
  }, [childrenMap, comment?.id]);

  const indent = Math.min(4, Math.max(0, Number(depth) || 0));
  const isNested = indent > 0;
  const hasChildren = children.length > 0;
  const isReplyTarget = !!activeReplyId && Number(activeReplyId) === Number(comment?.id);
  const authorName = formatForumAuthor(t, comment?.authorDisplayName);
  const authorInitial = authorName.charAt(0).toUpperCase();
  const myReaction =
    comment?.viewerReaction === FORUM_REACTIONS.LIKE || comment?.viewerReaction === FORUM_REACTIONS.DISLIKE
      ? comment.viewerReaction
      : null;
  const voteUpActive = myReaction === FORUM_REACTIONS.LIKE;
  const voteDownActive = myReaction === FORUM_REACTIONS.DISLIKE;
  const netVotes = (Number(comment?.totalLikes) || 0) - (Number(comment?.totalDislikes) || 0);

  return (
    <div style={{ marginLeft: indent > 0 ? `${indent * 20}px` : undefined }}>
      <div className={isNested ? 'border-l-2 border-border-light pl-4' : ''}>
        <div className="py-3">
          <div className="flex items-start gap-3">
            <div
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background-tertiary text-xs font-semibold text-text-secondary"
            >
              {authorInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                <span className="font-semibold text-text-primary">{authorName}</span>
                <time dateTime={comment?.createdAt || undefined} className="tabular-nums text-text-tertiary">
                  {formatForumDateTime(comment?.createdAt)}
                </time>
              </div>

              <p className="mt-1.5 max-w-prose whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">
                {comment?.content || ''}
              </p>

              <div className="mt-2.5 flex items-center gap-1">
                <Button
                  variant={voteUpActive ? 'primary' : 'ghost'}
                  size="icon"
                  onClick={() => onReact?.(threadId, comment?.id, FORUM_REACTIONS.LIKE)}
                  aria-label={t('upvote', 'Beğen')}
                  aria-pressed={voteUpActive}
                >
                  <ChevronUp className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </Button>
                <span
                  className={`min-w-5 text-center text-xs font-semibold tabular-nums ${
                    netVotes > 0 ? 'text-text-primary' : netVotes < 0 ? 'text-status-error-text' : 'text-text-tertiary'
                  }`}
                >
                  {netVotes}
                </span>
                <Button
                  variant={voteDownActive ? 'danger' : 'ghost'}
                  size="icon"
                  onClick={() => onReact?.(threadId, comment?.id, FORUM_REACTIONS.DISLIKE)}
                  aria-label={t('downvote', 'Beğenme')}
                  aria-pressed={voteDownActive}
                >
                  <ChevronDown className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </Button>

                <div className="mx-1.5 h-4 w-px bg-border-light" aria-hidden />

                <Button variant="ghost" size="sm" onClick={() => onReply?.(comment?.id)}>
                  <CornerDownRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                  <span>{t('reply', 'Yanıtla')}</span>
                </Button>
              </div>

              {isReplyTarget && (
                <div className="mt-3 space-y-2.5">
                  <textarea
                    value={replyDraft?.content || ''}
                    onChange={(e) => onReplyDraftChange?.(e.target.value)}
                    aria-label={t('write_a_reply', 'Bir yanıt yazın')}
                    placeholder={t('write_a_reply', 'Bir yanıt yazın...')}
                    autoFocus
                    rows={3}
                    className={`${inputNormal} resize-none`}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={onCancelReply}>
                      {t('cancel', 'İptal')}
                    </Button>
                    <Button size="sm" onClick={onSubmitReply} disabled={!String(replyDraft?.content || '').trim()}>
                      <Send className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                      <span>{t('reply', 'Yanıtla')}</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
