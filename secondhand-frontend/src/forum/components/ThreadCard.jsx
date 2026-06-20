import {AlertTriangle, ChevronUp, ChevronDown, Lightbulb, MessageCircle, Clock} from 'lucide-react';
import {
  FORUM_CATEGORIES,
  FORUM_REACTIONS,
  FORUM_THREAD_STATUSES,
} from '../forumConstants.js';
import {formatForumDate} from '../utils/forumDateFormat.js';

const categoryMeta = {
  [FORUM_CATEGORIES.SUGGESTIONS]: {label: 'Suggestion', icon: Lightbulb, color: 'text-status-warning bg-status-warning-bg border-amber-200'},
  [FORUM_CATEGORIES.COMPLAINTS]: {label: 'Complaint', icon: AlertTriangle, color: 'text-status-error bg-status-error-bg border-red-200'},
};

const statusMeta = {
  [FORUM_THREAD_STATUSES.OPEN]: {
    label: 'Open',
    dot: 'bg-status-success-bg',
  },
  [FORUM_THREAD_STATUSES.IN_PROGRESS]: {
    label: 'In Progress',
    dot: 'bg-blue-500',
  },
  [FORUM_THREAD_STATUSES.RESOLVED]: {
    label: 'Resolved',
    dot: 'bg-gray-400',
  },
};

export const ThreadCardSkeleton = () => (
  <div className="rounded-xl border border-border-light bg-background-primary p-4 animate-pulse">
    <div className="flex items-center gap-2 mb-3">
      <div className="h-5 w-16 bg-tertiary rounded-full" />
      <div className="h-4 w-12 bg-tertiary rounded" />
    </div>
    <div className="h-5 bg-tertiary rounded w-5/6 mb-2" />
    <div className="h-4 bg-tertiary rounded w-full mb-1" />
    <div className="h-4 bg-tertiary rounded w-3/4" />
    <div className="mt-4 flex items-center gap-4">
      <div className="h-4 w-10 bg-tertiary rounded" />
      <div className="h-4 w-10 bg-tertiary rounded" />
      <div className="h-4 w-16 bg-tertiary rounded ml-auto" />
    </div>
  </div>
);

export const ThreadCard = ({thread, isSelected, onSelect, reaction}) => {
  const category = thread?.category || FORUM_CATEGORIES.SUGGESTIONS;
  const status = thread?.status || FORUM_THREAD_STATUSES.OPEN;
  const catMeta = categoryMeta[category] || categoryMeta[FORUM_CATEGORIES.SUGGESTIONS];
  const CatIcon = catMeta.icon;
  const statusInfo = statusMeta[status] || statusMeta[FORUM_THREAD_STATUSES.OPEN];
  const author = String(thread?.authorDisplayName || '').trim();
  const isLiked = reaction === FORUM_REACTIONS.LIKE;
  const isDisliked = reaction === FORUM_REACTIONS.DISLIKE;
  const netVotes = (Number(thread?.totalLikes) || 0) - (Number(thread?.totalDislikes) || 0);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(thread?.id)}
      className={`group w-full text-left rounded-xl border bg-background-primary transition-all duration-200 ${
        isSelected
          ? 'border-violet-300 ring-2 ring-violet-500/10 shadow-md shadow-violet-500/5'
          : 'border-border-light hover:border-border-DEFAULT hover:shadow-sm'
      }`}
    >
      <div className="p-4">
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-semibold border ${catMeta.color}`}>
              <CatIcon className="w-3 h-3" />
              {catMeta.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-caption text-text-muted font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-sm font-medium text-text-primary tracking-tight line-clamp-2 mb-1.5 transition-colors duration-200 ${ isSelected ? '' : ' group-' }`}>
          {thread?.title || 'Untitled'}
        </h3>

        {/* Description preview */}
        <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
          {thread?.description || ''}
        </p>

        {/* Bottom row: votes, date, author */}
        <div className="mt-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Vote display */}
            <div className="inline-flex items-center gap-0.5 text-xs">
              <ChevronUp className={`w-3.5 h-3.5 ${isLiked ? 'text-violet-600' : 'text-text-muted'}`} />
              <span className={`font-bold tabular-nums min-w-[16px] text-center ${
                netVotes > 0 ? 'text-violet-600' : netVotes < 0 ? 'text-status-error' : 'text-text-muted'
              }`}>
                {netVotes}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 ${isDisliked ? 'text-status-error' : 'text-text-muted'}`} />
            </div>

            {/* Comment count placeholder */}
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <MessageCircle className="w-3 h-3" />
              <span className="tabular-nums font-medium">{Number(thread?.commentCount) || 0}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-caption text-text-muted">
            {author && (
              <>
                <span className="font-medium text-text-muted truncate max-w-[100px]">{author}</span>
                <span className="text-gray-300">·</span>
              </>
            )}
            <span className="inline-flex items-center gap-1 tabular-nums whitespace-nowrap">
              <Clock className="w-3 h-3" />
              {formatForumDate(thread?.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};
