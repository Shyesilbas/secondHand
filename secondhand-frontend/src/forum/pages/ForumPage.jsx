import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from 'react-i18next';
import { useEffect, useId, useMemo, useState } from 'react';
import { Heart, MessageCircle, Plus, Search, Settings2, X } from 'lucide-react';
import { useForum } from '../hooks/useForum.js';
import { ThreadCard, ThreadCardSkeleton } from '../components/ThreadCard.jsx';
import { ThreadDetail, ThreadDetailSkeleton } from '../components/ThreadDetail.jsx';
import { ThreadComposerModal } from '../components/ThreadComposerModal.jsx';
import { ForumVisibilitySettingsModal } from '../components/ForumVisibilitySettingsModal.jsx';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { Button, Card, EmptyState, ErrorState, PageHeader, Tabs } from '../../common/components/ui/index.js';
import { inputNormal, selectCompact } from '../../common/components/forms/inputStyles.js';
import {
  FORUM_CATEGORY_OPTIONS,
  FORUM_LIST_TABS,
  FORUM_REACTIONS,
  FORUM_SORT_OPTIONS,
} from '../forumConstants.js';

const ForumPage = () => {
  const { t } = useTranslation();
  const searchId = useId();
  const forum = useForum();
  const { isAuthenticated, user } = useAuthState();
  const [composerOpen, setComposerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [listTab, setListTab] = useState(FORUM_LIST_TABS.ALL);

  const showListSkeleton = forum.threadsLoading && forum.threads.length === 0;
  const { threads, getEffectiveThreadReaction, selectedThreadId, selectThread } = forum;

  const visibleThreads = useMemo(() => {
    if (!isAuthenticated || listTab !== FORUM_LIST_TABS.LIKED) return threads;
    return threads.filter((item) => getEffectiveThreadReaction(item) === FORUM_REACTIONS.LIKE);
  }, [getEffectiveThreadReaction, threads, isAuthenticated, listTab]);

  // Auto-select the first visible thread on desktop so the detail pane opens with real content.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;
    if (visibleThreads.length === 0) return;

    const exists = visibleThreads.some((item) => item?.id === selectedThreadId);
    if (!exists) {
      selectThread(visibleThreads[0].id);
    }
  }, [visibleThreads, selectedThreadId, selectThread]);

  const threadCount = visibleThreads.length;
  const isLikedTab = listTab === FORUM_LIST_TABS.LIKED;

  const categoryTabItems = useMemo(
    () =>
      FORUM_CATEGORY_OPTIONS.map((c) => ({
        key: c.id,
        label: t(c.labelKey, c.label),
      })),
    [t]
  );

  return (
    <div className="min-h-screen bg-background-page">
      <PageContainer className="py-5 lg:py-6">
        <PageHeader
          className="mb-4"
          title={t('community_forum', 'Topluluk forumu')}
          subtitle={t('share_ideas_report_issues_and_discuss_wi', 'Fikir paylaşın, sorun bildirin ve toplulukla tartışın.')}
          actions={
            isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setSettingsOpen(true)}
                  title={t('forum_settings', 'Forum ayarları')}
                  aria-label={t('forum_settings', 'Forum ayarları')}
                  className="h-10 w-10"
                >
                  <Settings2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </Button>
                <Button onClick={() => setComposerOpen(true)}>
                  <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  <span>{t('new_thread', 'Yeni konu')}</span>
                </Button>
              </div>
            ) : null
          }
        />

        {/* Compact single-row filter bar */}
        <div className="mb-5 flex flex-col gap-3 border-b border-border-light pb-2 lg:flex-row lg:items-center lg:justify-between lg:pb-0">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Tabs
              items={categoryTabItems}
              activeKey={forum.category}
              onChange={forum.setCategory}
              ariaLabel={t('forum_category_label', 'Kategori')}
              variant="underline"
              borderBottom={false}
            />

            {isAuthenticated && (
              <>
                <span className="h-4 w-px shrink-0 bg-border-light" aria-hidden />
                <button
                  type="button"
                  onClick={() => setListTab(isLikedTab ? FORUM_LIST_TABS.ALL : FORUM_LIST_TABS.LIKED)}
                  aria-pressed={isLikedTab}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
                    isLikedTab
                      ? 'bg-accent-teal-50 text-accent-teal-800'
                      : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                  }`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${isLikedTab ? 'fill-accent-teal text-accent-teal' : ''}`}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span>{t('liked', 'Beğenilen')}</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:pb-2">
            <div className="relative min-w-0 flex-1 sm:w-52 sm:flex-initial">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
                strokeWidth={1.5}
                aria-hidden
              />
              <input
                id={searchId}
                type="search"
                value={forum.search}
                onChange={(e) => forum.setSearch(e.target.value)}
                aria-label={t('search_threads', 'Konularda ara')}
                placeholder={t('search_threads', 'Konularda ara...')}
                className={`${inputNormal} h-9 bg-background-primary pl-9 pr-8`}
              />
              {forum.search && (
                <button
                  type="button"
                  onClick={() => forum.setSearch('')}
                  aria-label={t('clear_search', 'Aramayı temizle')}
                  className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-text-tertiary transition-colors duration-150 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                </button>
              )}
            </div>

            <select
              aria-label={t('forum_sort_label', 'Sıralama')}
              value={forum.sort}
              onChange={(e) => forum.setSort(e.target.value)}
              className={selectCompact}
            >
              {FORUM_SORT_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {t(s.labelKey, s.label)}
                </option>
              ))}
            </select>

            <span className="hidden whitespace-nowrap pl-1 text-sm tabular-nums text-text-tertiary sm:inline">
              {t('forum_thread_count', { defaultValue: '{{count}} konu', count: threadCount })}
            </span>
          </div>
        </div>

        {/* Main Two-Column Content */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Thread List (Left) */}
          <div className="lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4">
            <Card padding="none" className="overflow-hidden">
              {forum.threadsError ? (
                <ErrorState
                  size="compact"
                  bordered={false}
                  title={t('forum_load_threads_failed', 'Konular yüklenemedi')}
                  description={forum.threadsError}
                  onRetry={forum.refetchThreads}
                />
              ) : showListSkeleton ? (
                <div className="divide-y divide-border-light" aria-busy="true">
                  <ThreadCardSkeleton />
                  <ThreadCardSkeleton />
                  <ThreadCardSkeleton />
                  <ThreadCardSkeleton />
                </div>
              ) : visibleThreads.length === 0 ? (
                <EmptyState
                  icon={MessageCircle}
                  size="compact"
                  className="border-0 py-12"
                  title={
                    isLikedTab
                      ? t('forum_no_liked_threads', 'Beğenilen konu yok')
                      : t('forum_no_threads', 'Henüz konu bulunmuyor')
                  }
                  description={
                    isLikedTab
                      ? t('forum_no_liked_threads_desc', 'Beğendiğiniz konular burada listelenir.')
                      : t('forum_no_threads_desc', 'Filtreleri veya arama terimini değiştirmeyi deneyin.')
                  }
                />
              ) : (
                <>
                  <ul className="divide-y divide-border-light overflow-y-auto overscroll-contain lg:max-h-screen">
                    {visibleThreads.map((item) => (
                      <ThreadCard
                        key={item?.id}
                        thread={item}
                        isSelected={selectedThreadId === item?.id}
                        onSelect={selectThread}
                        reaction={getEffectiveThreadReaction?.(item) || null}
                      />
                    ))}
                  </ul>
                  {forum.threadsHasMore && !isLikedTab && (
                    <div className="flex justify-center border-t border-border-light p-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={forum.loadMoreThreads}
                        disabled={forum.threadsLoading}
                      >
                        {forum.threadsLoading ? t('loading', 'Yükleniyor...') : t('load_more', 'Daha fazla yükle')}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>

          {/* Thread Detail (Right) */}
          <div className="lg:sticky lg:top-24 lg:col-span-7 xl:col-span-8">
            {forum.threadLoading ? (
              <ThreadDetailSkeleton />
            ) : (
              <ThreadDetail
                thread={forum.selectedThread}
                threadId={selectedThreadId}
                currentUserId={user?.id || null}
                threadReaction={
                  forum.selectedThread ? getEffectiveThreadReaction?.(forum.selectedThread) || null : null
                }
                commentsTree={forum.commentTree}
                commentsLoading={forum.commentsLoading}
                commentsError={forum.commentsError}
                commentsHasMore={forum.commentsHasMore}
                onLoadMoreComments={forum.loadMoreComments}
                onRetryComments={forum.refetchComments}
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
      </PageContainer>

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
