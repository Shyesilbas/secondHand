import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { Badge, Skeleton } from '../../common/components/ui/index.js';
import {
  FORUM_CATEGORIES,
  FORUM_REACTIONS,
  FORUM_THREAD_STATUSES,
  formatForumAuthor,
} from '../forumConstants.js';
import { formatForumDate } from '../utils/forumDateFormat.js';

const CATEGORY_META = {
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

const STATUS_META = {
  [FORUM_THREAD_STATUSES.OPEN]: {
    labelKey: 'forum_status_open',
    fallback: 'Açık',
    dot: 'bg-status-success',
  },
  [FORUM_THREAD_STATUSES.IN_PROGRESS]: {
    labelKey: 'forum_status_in_progress',
    fallback: 'İnceleniyor',
    dot: 'bg-status-warning',
  },
  [FORUM_THREAD_STATUSES.RESOLVED]: {
    labelKey: 'forum_status_resolved',
    fallback: 'Çözüldü',
    dot: 'bg-text-tertiary',
  },
};

export const ThreadCardSkeleton = () => (
  <div className="p-4">
    <div className="mb-2.5 flex items-center gap-2">
      <Skeleton className="h-5 w-16 rounded-sm" />
      <Skeleton className="h-4 w-12" />
    </div>
    <Skeleton className="mb-2 h-4 w-5/6" />
    <Skeleton className="mb-1 h-3.5 w-full" />
    <Skeleton className="h-3.5 w-3/4" />
    <div className="mt-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-8" />
      </div>
      <Skeleton className="h-3.5 w-28" />
    </div>
  </div>
);

export const ThreadCard = ({ thread, isSelected, onSelect, reaction }) => {
  const { t } = useTranslation();
  const category = thread?.category || FORUM_CATEGORIES.SUGGESTIONS;
  const status = thread?.status || FORUM_THREAD_STATUSES.OPEN;
  const catMeta = CATEGORY_META[category] || CATEGORY_META[FORUM_CATEGORIES.SUGGESTIONS];
  const statusInfo = STATUS_META[status] || STATUS_META[FORUM_THREAD_STATUSES.OPEN];
  const author = formatForumAuthor(t, thread?.authorDisplayName);
  const isLiked = reaction === FORUM_REACTIONS.LIKE;
  const isDisliked = reaction === FORUM_REACTIONS.DISLIKE;
  const netVotes = (Number(thread?.totalLikes) || 0) - (Number(thread?.totalDislikes) || 0);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect?.(thread?.id)}
        aria-current={isSelected ? 'true' : undefined}
        className={`block w-full border-l-2 px-4 py-4 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus ${
          isSelected
            ? 'border-l-accent-teal bg-accent-teal-50'
            : 'border-l-transparent bg-background-primary hover:bg-background-secondary'
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={catMeta.variant} size="sm">
              {t(catMeta.labelKey, catMeta.fallback)}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
              <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} aria-hidden />
              {t(statusInfo.labelKey, statusInfo.fallback)}
            </span>
          </div>
          <time
            dateTime={thread?.createdAt || undefined}
            className="whitespace-nowrap text-xs tabular-nums text-text-tertiary"
          >
            {formatForumDate(thread?.createdAt)}
          </time>
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold text-text-primary">
          {thread?.title || t('forum_untitled', 'Başlıksız konu')}
        </h3>

        {thread?.description && (
          <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
            {thread.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-text-tertiary">
            <span className="inline-flex items-center gap-0.5">
              <ChevronUp
                className={`h-3.5 w-3.5 ${isLiked ? 'text-accent-teal' : 'text-text-tertiary'}`}
                strokeWidth={1.5}
                aria-hidden
              />
              <span
                className={`min-w-4 text-center font-semibold tabular-nums ${
                  netVotes > 0 ? 'text-text-primary' : netVotes < 0 ? 'text-status-error-text' : 'text-text-tertiary'
                }`}
              >
                {netVotes}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 ${isDisliked ? 'text-status-error-text' : 'text-text-tertiary'}`}
                strokeWidth={1.5}
                aria-hidden
              />
            </span>

            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              <span className="font-medium tabular-nums">{Number(thread?.commentCount) || 0}</span>
            </span>
          </div>

          <span className="max-w-32 truncate text-xs font-medium text-text-tertiary">
            {author}
          </span>
        </div>
      </button>
    </li>
  );
};
