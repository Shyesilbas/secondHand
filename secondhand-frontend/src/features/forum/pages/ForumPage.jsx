import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Plus, Search, Settings2 } from 'lucide-react';
import { useForum } from '../hooks/useForum.js';
import { ThreadCard, ThreadCardSkeleton } from '../components/ThreadCard.jsx';
import { ThreadDetail, ThreadDetailSkeleton } from '../components/ThreadDetail.jsx';
import { ThreadComposerModal } from '../components/ThreadComposerModal.jsx';
import { ForumVisibilitySettingsModal } from '../components/ForumVisibilitySettingsModal.jsx';
import { useAuth } from '../../../auth/AuthContext.jsx';

const categories = [
  { id: 'SUGGESTIONS', label: 'Öneriler' },
  { id: 'COMPLAINTS', label: 'Şikayetler' },
];

const sorts = [
  { id: 'NEW', label: 'En yeni' },
  { id: 'TOP', label: 'En çok oy alan' },
];

const ForumPage = () => {
  const forum = useForum();
  const { isAuthenticated, user } = useAuth();
  const [composerOpen, setComposerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [listTab, setListTab] = useState('ALL');

  useEffect(() => {
    forum.resetThreads();
    forum.loadThreads({ reset: true });
  }, [forum.category, forum.sort, forum.search]);

  const showListSkeleton = forum.threadsLoading && forum.threads.length === 0;
  const visibleThreads = useMemo(() => {
    if (!isAuthenticated || listTab !== 'LIKED') return forum.threads;
    return (forum.threads || []).filter((t) => forum.threadReactions?.[t?.id] === 'LIKE');
  }, [forum.threadReactions, forum.threads, isAuthenticated, listTab]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Forum</h1>
                {isAuthenticated && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(true)}
                      className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                      title="Forum settings"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposerOpen(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      New thread
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full lg:max-w-md">
                <div className="relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={forum.search}
                    onChange={(e) => forum.setSearch(e.target.value)}
                    placeholder="Search threads..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const active = forum.category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => forum.setCategory(c.id)}
                      className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold tracking-tight border transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {c.label}
                    </button>
                  );
                })}
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => setListTab(listTab === 'LIKED' ? 'ALL' : 'LIKED')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold tracking-tight border transition-colors ${listTab === 'LIKED' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Heart className="w-4 h-4" />
                    Beğendiklerim
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 tracking-tight">Sort</span>
                <select
                  value={forum.sort}
                  onChange={(e) => forum.setSort(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {sorts.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            {forum.threadsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{listTab === 'LIKED' ? 'No liked threads' : 'No threads found'}</p>
                <p className="text-sm text-slate-500 mt-1">{listTab === 'LIKED' ? 'Like a thread to see it here.' : 'Try changing filters or search.'}</p>
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
                {forum.threadsHasMore && listTab !== 'LIKED' && (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={forum.loadMoreThreads}
                      disabled={forum.threadsLoading}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-7">
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


