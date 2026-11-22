import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, MessageSquarePlus, Send, Trash2, X } from 'lucide-react';
import { Badge, Button, Card, EmptyState, ErrorState, Skeleton } from '../../common/components/ui/index.js';
import { inputNormal, selectCompact } from '../../common/components/forms/inputStyles.js';
import { CommentItem, CommentSkeleton } from './CommentItem.jsx';
import {
  FORUM_CATEGORIES,
  FORUM_REACTIONS,
  FORUM_THREAD_STATUS_OPTIONS,
  FORUM_THREAD_STATUSES,
  formatForumAuthor,
} from '../forumConstants.js';
import { formatForumDateTime } from '../utils/forumDateFormat.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

const CATEGORY_BADGE = {
  [FORUM_CATEGORIES.SUGGESTIONS]: {
    labelKey: 'forum_cat_suggestion_singular',
    fallback: 'Öneri',
    variant: 'warning',
  },
  [FORUM_CATEGORIES.COMPLAINTS]: {
    labelKey: 'forum_cat_complaint_singular',
    fallback: 'Şikayet',
    variant: 'error',
  },
};

export const ThreadDetailSkeleton = () => (
  <Card padding="none" className="overflow-hidden">
    <div className="border-b border-border-light px-6 py-5">
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-sm" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="mb-2.5 h-6 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
    </div>
    <div className="space-y-2 p-6">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
    <div className="border-t border-border-light">
      <CommentSkeleton />
      <CommentSkeleton />
    </div>
  </Card>
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
  onRetryComments,
  draftComment,
  onDraftChange,
  onReplyTarget,
  onSubmitComment,
  onReactThread,
  onReactComment,
  onChangeThreadStatus,
  onDeleteThread
}) => {
  const { t } = useTranslation();
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
    return (
      <EmptyState
        icon={MessageCircle}
        title={t('forum_select_thread_title', 'Bir konu seçin')}
        description={t('forum_select_thread_desc', 'Detayları ve yorumları görmek için soldaki listeden bir konu seçin.')}
        className="py-16 shadow-sm"
      />
    );
  }

  const commentCount = commentsTree?.roots?.length || 0;
  const catMeta = CATEGORY_BADGE[thread?.category] || CATEGORY_BADGE[FORUM_CATEGORIES.SUGGESTIONS];
  const authorName = formatForumAuthor(t, thread?.authorDisplayName);

  return (
    <Card padding="none" className="overflow-hidden">
      <header className="border-b border-border-light px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={catMeta.variant} size="sm">
                {t(catMeta.labelKey, catMeta.fallback)}
              </Badge>
              <span className="text-sm font-medium text-text-secondary">{authorName}</span>
              <span className="text-text-tertiary" aria-hidden>·</span>
              <time dateTime={thread?.createdAt || undefined} className="text-sm tabular-nums text-text-tertiary">
                {formatForumDateTime(thread?.createdAt)}
              </time>
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              {thread?.title || t('forum_untitled', 'Başlıksız konu')}
            </h2>
          </div>

          {canManage && (
            <div className="flex shrink-0 items-center gap-2">
              <select
                aria-label={t('forum_status_label', 'Konu durumu')}
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
                className={`${selectCompact} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {FORUM_THREAD_STATUS_OPTIONS.map((statusOption) => (
                  <option key={statusOption.id} value={statusOption.id}>
                    {t(statusOption.labelKey, statusOption.label)}
                  </option>
                ))}
              </select>
              <Button
                variant="danger"
                size="icon"
                onClick={() =>
                  showConfirmation(
                    t('delete', 'Sil'),
                    t('forum_delete_thread_confirm', 'Bu konuyu silmek istediğinize emin misiniz?'),
                    () => onDeleteThread?.(threadId),
                    { confirmLabel: t('delete', 'Sil') }
                  )
                }
                title={t('delete', 'Sil')}
                aria-label={t('delete', 'Sil')}
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="px-6 py-5">
        <div className="max-w-prose whitespace-pre-wrap break-words text-base leading-relaxed text-text-secondary">
          {thread?.description || ''}
        </div>

        <div className="mt-5 flex items-center gap-1">
          <Button
            variant={isLiked ? 'primary' : 'secondary'}
            size="icon"
            onClick={() => onReactThread?.(threadId, FORUM_REACTIONS.LIKE)}
            title={t('upvote', 'Beğen')}
            aria-label={t('upvote', 'Beğen')}
            aria-pressed={isLiked}
          >
            <ChevronUp className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
          <span
            className={`inline-flex h-8 min-w-8 items-center justify-center text-sm font-semibold tabular-nums ${
              netVotes > 0 ? 'text-text-primary' : netVotes < 0 ? 'text-status-error-text' : 'text-text-tertiary'
            }`}
          >
            {netVotes}
          </span>
          <Button
            variant={isDisliked ? 'danger' : 'secondary'}
            size="icon"
            onClick={() => onReactThread?.(threadId, FORUM_REACTIONS.DISLIKE)}
            title={t('downvote', 'Beğenme')}
            aria-label={t('downvote', 'Beğenme')}
            aria-pressed={isDisliked}
          >
            <ChevronDown className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
        </div>
      </div>

      <section className="border-t border-border-light" aria-label={t('comments', 'Yorumlar')}>
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">{t('comments', 'Yorumlar')}</h3>
            <Badge variant="muted" size="sm">
              {commentCount}
            </Badge>
            {draftComment?.parentCommentId ? (
              <span className="ml-2 text-xs font-medium text-text-secondary">
                {t('replying', 'Yanıtlanıyor...')}
                <button
                  type="button"
                  className="ml-1.5 rounded-sm text-xs text-text-link hover:text-text-linkHover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                  onClick={() => onReplyTarget?.(null)}
                >
                  {t('cancel', 'İptal')}
                </button>
              </span>
            ) : null}
          </div>

          <Button
            variant={composerOpen ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setComposerOpen((v) => !v)}
          >
            {composerOpen ? (
              <>
                <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                <span>{t('close', 'Kapat')}</span>
              </>
            ) : (
              <>
                <MessageSquarePlus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                <span>{t('forum_write_comment', 'Yorum yaz')}</span>
              </>
            )}
          </Button>
        </div>

        {composerOpen && !draftComment?.parentCommentId && (
          <div className="space-y-2.5 px-6 pb-5">
            <textarea
              value={draftComment?.content || ''}
              onChange={(e) => onDraftChange?.(e.target.value)}
              aria-label={t('forum_write_comment', 'Yorum yaz')}
              placeholder={t('share_your_thoughts', 'Düşüncelerinizi paylaşın...')}
              rows={3}
              className={`${inputNormal} resize-none`}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={onSubmitComment} disabled={!String(draftComment?.content || '').trim()}>
                <Send className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                <span>{t('post', 'Gönder')}</span>
              </Button>
            </div>
          </div>
        )}

        {commentsError && (
          <div className="px-6 pb-4">
            <ErrorState
              size="compact"
              bordered={false}
              title={t('forum_load_comments_failed', 'Yorumlar yüklenemedi')}
              description={commentsError}
              onRetry={onRetryComments}
            />
          </div>
        )}

        {commentsLoading && commentsTree?.roots?.length === 0 ? (
          <div>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        ) : commentsTree?.roots?.length ? (
          <div className="space-y-1 px-6 pb-5">
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
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-medium text-text-secondary">
              {t('forum_no_comments_yet', 'Henüz yorum yok')}
            </p>
            <p className="mt-1 text-sm text-text-tertiary">
              {t('forum_be_first_to_comment', 'İlk yorumu siz yapın.')}
            </p>
          </div>
        )}

        {commentsHasMore && (
          <div className="flex justify-center border-t border-border-light px-6 py-4">
            <Button variant="secondary" size="sm" onClick={onLoadMoreComments} disabled={commentsLoading}>
              {commentsLoading ? t('loading', 'Yükleniyor...') : t('load_more', 'Daha fazla yükle')}
            </Button>
          </div>
        )}
      </section>
    </Card>
  );
};
