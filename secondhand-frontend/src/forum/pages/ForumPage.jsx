import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from 'react';
import { Heart, MessageCircle, Plus, Search, Settings2, SlidersHorizontal, TrendingUp, Sparkles, ArrowUpDown } from 'lucide-react';
import { useForum } from '../hooks/useForum.js';
import { ThreadCard, ThreadCardSkeleton } from '../components/ThreadCard.jsx';
import { ThreadDetail, ThreadDetailSkeleton } from '../components/ThreadDetail.jsx';
import { ThreadComposerModal } from '../components/ThreadComposerModal.jsx';
import { ForumVisibilitySettingsModal } from '../components/ForumVisibilitySettingsModal.jsx';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { FORUM_CATEGORY_OPTIONS, FORUM_LIST_TABS, FORUM_MESSAGES, FORUM_REACTIONS, FORUM_SORT_OPTIONS } from '../forumConstants.js';
const ForumPage = () => {
  const {
    t
  } = useTranslation();
  const forum = useForum();
  const {
    isAuthenticated,
    user
  } = useAuthState();
  const [composerOpen, setComposerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [listTab, setListTab] = useState(FORUM_LIST_TABS.ALL);
  const [searchFocused, setSearchFocused] = useState(false);
  useEffect(() => {
    forum.resetThreads();
    forum.loadThreads({
      reset: true
    });
  }, [forum.category, forum.sort, forum.search]);
  const showListSkeleton = forum.threadsLoading && forum.threads.length === 0;
  const visibleThreads = useMemo(() => {
    if (!isAuthenticated || listTab !== FORUM_LIST_TABS.LIKED) return forum.threads;
    return (forum.threads || []).filter(t => forum.getEffectiveThreadReaction?.(t) === FORUM_REACTIONS.LIKE);
  }, [forum.getEffectiveThreadReaction, forum.threads, isAuthenticated, listTab]);
  const threadCount = visibleThreads.length;
  return <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/40">
      {/* ── Hero Header ────────────────────────────────────────── */}
      <div className="bg-background-primary/95 backdrop-blur-sm border-b border-border-light/80 shadow-sm">
        <PageContainer>
          <div className="py-6 sm:py-8">
            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("community_forum")}</h1>
                    <p className="text-sm text-text-muted mt-0.5 hidden sm:block">{t("share_ideas_report_issues_and_discuss_wi")}</p>
                  </div>
                </div>
              </div>
              {isAuthenticated && <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setSettingsOpen(true)} className="h-10 w-10 rounded-xl border border-border-light bg-background-primary text-text-muted hover:text-text-secondary hover:bg-secondary hover:border-border-DEFAULT inline-flex items-center justify-center transition-all duration-200" title={t("forum_settings")}>
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setComposerOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("new_thread")}</span>
                  </button>
                </div>}
            </div>

            {/* Search + Filters Row */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className={`relative w-full sm:max-w-sm transition-all duration-300 ${searchFocused ? 'sm:max-w-md' : ''}`}>
                <Search className={`h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${searchFocused ? 'text-violet-500' : 'text-text-muted'}`} />
                <input value={forum.search} onChange={e => forum.setSearch(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} placeholder={t("search_threads")} className="w-full h-10 pl-10 pr-4 rounded-xl border border-border-light bg-secondary/80 text-sm text-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:bg-background-primary transition-all duration-200" />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
                <select value={forum.sort} onChange={e => forum.setSort(e.target.value)} className="rounded-xl border border-border-light bg-background-primary px-3 py-2 text-sm text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 cursor-pointer transition-all duration-200">
                  {FORUM_SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {/* Category Chips + Liked Tab */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {FORUM_CATEGORY_OPTIONS.map(c => {
              const active = forum.category === c.id;
              return <button key={c.id} type="button" onClick={() => forum.setCategory(c.id)} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${active ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'bg-background-primary text-text-secondary border border-border-light hover:border-border-DEFAULT hover:text-text-primary hover:bg-secondary'}`}>
                    {c.id === 'SUGGESTIONS' && <Sparkles className="w-3.5 h-3.5" />}
                    {c.id === 'COMPLAINTS' && <SlidersHorizontal className="w-3.5 h-3.5" />}
                    {c.label}
                  </button>;
            })}

              {isAuthenticated && <>
                  <div className="w-px h-6 bg-tertiary mx-1 hidden sm:block" />
                  <button type="button" onClick={() => setListTab(listTab === FORUM_LIST_TABS.LIKED ? FORUM_LIST_TABS.ALL : FORUM_LIST_TABS.LIKED)} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${listTab === FORUM_LIST_TABS.LIKED ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-background-primary text-text-secondary border border-border-light hover:border-border-DEFAULT hover:text-text-primary hover:bg-secondary'}`}>
                    <Heart className={`w-3.5 h-3.5 ${listTab === FORUM_LIST_TABS.LIKED ? 'fill-rose-500' : ''}`} />{t("liked")}</button>
                </>}

              {/* Thread count badge */}
              <span className="ml-auto text-xs font-medium text-text-muted tabular-nums hidden sm:inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {threadCount}{t("thread")}{threadCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* ── Main Content ───────────────────────────────────────── */}
      <PageContainer className="py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Thread List (Left) ─────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="rounded-2xl border border-border-light/70 bg-background-primary/70 backdrop-blur-sm p-2 shadow-sm lg:sticky lg:top-6 space-y-2 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1 [scrollbar-width:thin]">
              {forum.threadsError && <div className="rounded-xl border border-red-200 bg-status-error-bg px-4 py-3 text-sm text-red-700 font-medium">
                  {forum.threadsError}
                </div>}

              {showListSkeleton ? <>
                  <ThreadCardSkeleton />
                  <ThreadCardSkeleton />
                  <ThreadCardSkeleton />
                  <ThreadCardSkeleton />
                </> : visibleThreads.length === 0 ? <div className="rounded-2xl border border-border-light/90 bg-background-primary/90 shadow-sm ring-1 ring-gray-100 p-12 text-center mx-0.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-5 h-5 text-violet-600" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    {listTab === FORUM_LIST_TABS.LIKED ? FORUM_MESSAGES.NO_LIKED_THREADS : FORUM_MESSAGES.NO_THREADS_FOUND}
                  </p>
                  <p className="text-sm text-text-muted mt-1">{listTab === FORUM_LIST_TABS.LIKED ? 'Like a thread to see it here.' : 'Try changing filters or search.'}</p>
                </div> : <>
                  {visibleThreads.map(t => <ThreadCard key={t?.id} thread={t} isSelected={forum.selectedThreadId === t?.id} onSelect={forum.selectThread} reaction={forum.getEffectiveThreadReaction?.(t) || null} />)}
                  {forum.threadsHasMore && listTab !== FORUM_LIST_TABS.LIKED && <div className="flex justify-center pt-3 pb-1">
                      <button type="button" onClick={forum.loadMoreThreads} disabled={forum.threadsLoading} className="px-5 py-2.5 rounded-xl border border-border-light bg-background-primary text-sm font-semibold text-text-secondary hover:bg-secondary hover:border-border-DEFAULT transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        {forum.threadsLoading ? 'Loading...' : FORUM_MESSAGES.LOAD_MORE}
                      </button>
                    </div>}
                </>}
            </div>
          </div>

          {/* ── Thread Detail (Right) ──────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="lg:sticky lg:top-6">
              {forum.threadLoading ? <ThreadDetailSkeleton /> : <ThreadDetail thread={forum.selectedThread} threadId={forum.selectedThreadId} currentUserId={user?.id || null} threadReaction={forum.selectedThread ? forum.getEffectiveThreadReaction?.(forum.selectedThread) || null : null} commentsTree={forum.commentTree} commentsLoading={forum.commentsLoading} commentsError={forum.commentsError} commentsHasMore={forum.commentsHasMore} onLoadMoreComments={forum.loadMoreComments} draftComment={forum.draftComment} onDraftChange={forum.updateDraftContent} onReplyTarget={forum.setReplyTarget} onSubmitComment={forum.submitComment} onReactThread={forum.reactToThread} onReactComment={forum.reactToComment} onChangeThreadStatus={forum.changeThreadStatus} onDeleteThread={forum.deleteThread} />}
            </div>
          </div>
        </div>
      </PageContainer>

      <ThreadComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} category={forum.category} onSubmit={forum.publishThread} />

      <ForumVisibilitySettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>;
};
export default ForumPage;