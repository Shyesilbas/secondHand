import React, {useEffect, useMemo, useState} from 'react';
import {Heart, MessageCircle, Plus, Search, Settings2, SlidersHorizontal, TrendingUp, Sparkles, ArrowUpDown} from 'lucide-react';
import {useForum} from '../hooks/useForum.js';
import {ThreadCard, ThreadCardSkeleton} from '../components/ThreadCard.jsx';
import {ThreadDetail, ThreadDetailSkeleton} from '../components/ThreadDetail.jsx';
import {ThreadComposerModal} from '../components/ThreadComposerModal.jsx';
import {ForumVisibilitySettingsModal} from '../components/ForumVisibilitySettingsModal.jsx';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {
  FORUM_CATEGORY_OPTIONS,
  FORUM_LIST_TABS,
  FORUM_MESSAGES,
  FORUM_REACTIONS,
  FORUM_SORT_OPTIONS,
} from '../forumConstants.js';

const ForumPage = () => {
  const forum = useForum();
  const { isAuthenticated, user } = useAuthState();
  const [composerOpen, setComposerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [listTab, setListTab] = useState(FORUM_LIST_TABS.ALL);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    forum.resetThreads();
    forum.loadThreads({ reset: true });
  }, [forum.category, forum.sort, forum.search]);

  const showListSkeleton = forum.threadsLoading && forum.threads.length === 0;
  const visibleThreads = useMemo(() => {
    if (!isAuthenticated || listTab !== FORUM_LIST_TABS.LIKED) return forum.threads;
    return (forum.threads || []).filter((t) => forum.threadReactions?.[t?.id] === FORUM_REACTIONS.LIKE);
  }, [forum.threadReactions, forum.threads, isAuthenticated, listTab]);

  const threadCount = visibleThreads.length;

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* ── Hero Header ────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8">
            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Community Forum</h1>
                    <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">Share ideas, report issues, and discuss with the community</p>
                  </div>
                </div>
              </div>
              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="h-10 w-10 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 inline-flex items-center justify-center transition-all duration-200"
                    title="Forum settings"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Thread</span>
                  </button>
                </div>
              )}
            </div>

            {/* Search + Filters Row */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className={`relative w-full sm:max-w-sm transition-all duration-300 ${searchFocused ? 'sm:max-w-md' : ''}`}>
                <Search className={`h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${searchFocused ? 'text-violet-500' : 'text-gray-400'}`} />
                <input
                  value={forum.search}
                  onChange={(e) => forum.setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search threads..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={forum.sort}
                  onChange={(e) => forum.setSort(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 cursor-pointer transition-all duration-200"
                >
                  {FORUM_SORT_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Chips + Liked Tab */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {FORUM_CATEGORY_OPTIONS.map((c) => {
                const active = forum.category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => forum.setCategory(c.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {c.id === 'SUGGESTIONS' && <Sparkles className="w-3.5 h-3.5" />}
                    {c.id === 'COMPLAINTS' && <SlidersHorizontal className="w-3.5 h-3.5" />}
                    {c.label}
                  </button>
                );
              })}

              {isAuthenticated && (
                <>
                  <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
                  <button
                    type="button"
                    onClick={() => setListTab(listTab === FORUM_LIST_TABS.LIKED ? FORUM_LIST_TABS.ALL : FORUM_LIST_TABS.LIKED)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      listTab === FORUM_LIST_TABS.LIKED
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${listTab === FORUM_LIST_TABS.LIKED ? 'fill-rose-500' : ''}`} />
                    Liked
                  </button>
                </>
              )}

              {/* Thread count badge */}
              <span className="ml-auto text-xs font-medium text-gray-400 tabular-nums hidden sm:inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {threadCount} thread{threadCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Thread List (Left) ─────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-2.5 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1 scrollbar-thin">
              {forum.threadsError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                  {forum.threadsError}
                </div>
              )}

              {showListSkeleton ? (
                <>
                  <ThreadCardSkeleton />
                  <ThreadCardSkeleton />
                  <ThreadCardSkeleton />
                  <ThreadCardSkeleton />
                </>
              ) : visibleThreads.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {listTab === FORUM_LIST_TABS.LIKED ? FORUM_MESSAGES.NO_LIKED_THREADS : FORUM_MESSAGES.NO_THREADS_FOUND}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{listTab === FORUM_LIST_TABS.LIKED ? 'Like a thread to see it here.' : 'Try changing filters or search.'}</p>
                </div>
              ) : (
                <>
                  {visibleThreads.map((t) => (
                    <ThreadCard
                      key={t?.id}
                      thread={t}
                      isSelected={forum.selectedThreadId === t?.id}
                      onSelect={forum.selectThread}
                      reaction={forum.threadReactions?.[t?.id] || null}
                    />
                  ))}
                  {forum.threadsHasMore && listTab !== FORUM_LIST_TABS.LIKED && (
                    <div className="flex justify-center pt-3 pb-1">
                      <button
                        type="button"
                        onClick={forum.loadMoreThreads}
                        disabled={forum.threadsLoading}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {forum.threadsLoading ? 'Loading...' : FORUM_MESSAGES.LOAD_MORE}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Thread Detail (Right) ──────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="lg:sticky lg:top-6">
              {forum.threadLoading ? (
                <ThreadDetailSkeleton />
              ) : (
                <ThreadDetail
                  thread={forum.selectedThread}
                  threadId={forum.selectedThreadId}
                  currentUserId={user?.id || null}
                  threadReaction={forum.threadReactions?.[forum.selectedThreadId] || null}
                  commentsTree={forum.commentTree}
                  commentsLoading={forum.commentsLoading}
                  commentsError={forum.commentsError}
                  commentsHasMore={forum.commentsHasMore}
                  onLoadMoreComments={forum.loadMoreComments}
                  draftComment={forum.draftComment}
                  onDraftChange={forum.updateDraftContent}
                  onReplyTarget={forum.setReplyTarget}
                  onSubmitComment={forum.submitComment}
                  onReactThread={forum.reactToThread}
                  onReactComment={forum.reactToComment}
                  onChangeThreadStatus={forum.changeThreadStatus}
                  onDeleteThread={forum.deleteThread}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ThreadComposerModal
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        category={forum.category}
        onSubmit={forum.publishThread}
      />

      <ForumVisibilitySettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default ForumPage;
