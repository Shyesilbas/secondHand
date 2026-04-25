import {AlertTriangle, ChevronUp, ChevronDown, Lightbulb, MessageCircle, Clock} from 'lucide-react';
import {
  FORUM_CATEGORIES,
  FORUM_REACTIONS,
  FORUM_THREAD_STATUSES,
} from '../forumConstants.js';
import {formatForumDate} from '../utils/forumDateFormat.js';

const categoryMeta = {
  [FORUM_CATEGORIES.SUGGESTIONS]: {label: 'Suggestion', icon: Lightbulb, color: 'text-amber-600 bg-amber-50 border-amber-200'},
  [FORUM_CATEGORIES.COMPLAINTS]: {label: 'Complaint', icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200'},
};

const statusMeta = {
  [FORUM_THREAD_STATUSES.OPEN]: {
    label: 'Open',
    dot: 'bg-emerald-500',
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
  <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
    <div className="flex items-center gap-2 mb-3">
      <div className="h-5 w-16 bg-gray-200 rounded-full" />
      <div className="h-4 w-12 bg-gray-200 rounded" />
    </div>
    <div className="h-5 bg-gray-200 rounded w-5/6 mb-2" />
    <div className="h-4 bg-gray-100 rounded w-full mb-1" />
    <div className="h-4 bg-gray-100 rounded w-3/4" />
    <div className="mt-4 flex items-center gap-4">
      <div className="h-4 w-10 bg-gray-200 rounded" />
      <div className="h-4 w-10 bg-gray-200 rounded" />
      <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
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
      className={`group w-full text-left rounded-xl border bg-white transition-all duration-200 ${
        isSelected
          ? 'border-violet-300 ring-2 ring-violet-500/10 shadow-md shadow-violet-500/5'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="p-4">
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${catMeta.color}`}>
              <CatIcon className="w-3 h-3" />
              {catMeta.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-sm font-semibold tracking-tight line-clamp-2 mb-1.5 transition-colors duration-200 ${
          isSelected ? 'text-violet-900' : 'text-gray-900 group-hover:text-gray-800'
        }`}>
          {thread?.title || 'Untitled'}
        </h3>

        {/* Description preview */}
        <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">
          {thread?.description || ''}
        </p>

        {/* Bottom row: votes, date, author */}
        <div className="mt-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Vote display */}
            <div className="inline-flex items-center gap-0.5 text-xs">
              <ChevronUp className={`w-3.5 h-3.5 ${isLiked ? 'text-violet-600' : 'text-gray-400'}`} />
              <span className={`font-bold tabular-nums min-w-[16px] text-center ${
                netVotes > 0 ? 'text-violet-600' : netVotes < 0 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {netVotes}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 ${isDisliked ? 'text-red-500' : 'text-gray-400'}`} />
            </div>

            {/* Comment count placeholder */}
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <MessageCircle className="w-3 h-3" />
              <span className="tabular-nums font-medium">{Number(thread?.commentCount) || 0}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            {author && (
              <>
                <span className="font-medium text-gray-500 truncate max-w-[100px]">{author}</span>
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
