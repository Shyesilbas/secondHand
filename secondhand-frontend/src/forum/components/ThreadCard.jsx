import { AlertTriangle, Lightbulb, ThumbsDown, ThumbsUp } from 'lucide-react';
import {
  FORUM_CATEGORIES,
  FORUM_REACTIONS,
  FORUM_THREAD_STATUSES,
} from '../forumConstants.js';
import { formatForumDate } from '../utils/forumDateFormat.js';

const categoryMeta = {
  [FORUM_CATEGORIES.SUGGESTIONS]: { label: 'Suggestions', icon: Lightbulb },
  [FORUM_CATEGORIES.COMPLAINTS]: { label: 'Complaints', icon: AlertTriangle },
};

const statusMeta = {
  [FORUM_THREAD_STATUSES.OPEN]: {
    label: 'Open',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [FORUM_THREAD_STATUSES.IN_PROGRESS]: {
    label: 'In progress',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  [FORUM_THREAD_STATUSES.RESOLVED]: {
    label: 'Resolved',
    className: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

export const ThreadCardSkeleton = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="mt-2 h-5 bg-slate-200 rounded w-5/6" />
        <div className="mt-2 h-4 bg-slate-200 rounded w-full" />
      </div>
      <div className="h-9 w-16 bg-slate-200 rounded-lg" />
    </div>
    <div className="mt-4 flex items-center gap-3">
      <div className="h-4 w-12 bg-slate-200 rounded" />
      <div className="h-4 w-12 bg-slate-200 rounded" />
    </div>
  </div>
);

export const ThreadCard = ({ thread, isSelected, onSelect, reaction }) => {
  const category = thread?.category || FORUM_CATEGORIES.SUGGESTIONS;
  const status = thread?.status || FORUM_THREAD_STATUSES.OPEN;
  const CatIcon = categoryMeta[category]?.icon || Lightbulb;
  const statusInfo = statusMeta[status] || statusMeta[FORUM_THREAD_STATUSES.OPEN];
  const author = String(thread?.authorDisplayName || '').trim();
  const isLiked = reaction === FORUM_REACTIONS.LIKE;
  const isDisliked = reaction === FORUM_REACTIONS.DISLIKE;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(thread?.id)}
      className={`w-full text-left rounded-xl border bg-white p-4 shadow-sm transition-colors duration-300 ${isSelected ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CatIcon className="w-3.5 h-3.5" />
              <span className="font-semibold">{categoryMeta[category]?.label || category}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="tabular-nums">{formatForumDate(thread?.createdAt)}</span>
            {author ? (
              <>
                <span className="text-slate-300">•</span>
                <span className="truncate">by {author}</span>
              </>
            ) : null}
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900 tracking-tight line-clamp-2">
            {thread?.title || 'Untitled'}
          </div>
          <div className="mt-2 text-sm text-slate-600 line-clamp-2">
            {thread?.description || ''}
          </div>
        </div>

        <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'text-slate-900' : 'text-slate-400'}`} />
          <span className={`font-semibold tabular-nums ${isLiked ? 'text-slate-900' : 'text-slate-600'}`}>{Number(thread?.totalLikes) || 0}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <ThumbsDown className={`w-3.5 h-3.5 ${isDisliked ? 'text-slate-900' : 'text-slate-400'}`} />
          <span className={`font-semibold tabular-nums ${isDisliked ? 'text-slate-900' : 'text-slate-600'}`}>{Number(thread?.totalDislikes) || 0}</span>
        </span>
      </div>
    </button>
  );
};

