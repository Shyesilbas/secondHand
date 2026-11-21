import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useMemo, useState } from 'react';
import { Heart, MessageCircle, Plus, Search, Settings2, ArrowUpDown } from 'lucide-react';
import { useForum } from '../hooks/useForum.js';
import { ThreadCard, ThreadCardSkeleton } from '../components/ThreadCard.jsx';
import { ThreadDetail, ThreadDetailSkeleton } from '../components/ThreadDetail.jsx';
import { ThreadComposerModal } from '../components/ThreadComposerModal.jsx';
import { ForumVisibilitySettingsModal } from '../components/ForumVisibilitySettingsModal.jsx';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { PageHeader } from '../../common/components/ui/index.js';
import { FORUM_CATEGORY_OPTIONS, FORUM_LIST_TABS, FORUM_MESSAGES, FORUM_REACTIONS, FORUM_SORT_OPTIONS } from '../forumConstants.js';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
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
    const showListSkeleton = forum.threadsLoading && forum.threads.length === 0;
    const { threads, getEffectiveThreadReaction } = forum;
    const visibleThreads = useMemo(() => {
        if (!isAuthenticated || listTab !== FORUM_LIST_TABS.LIKED) return threads;
        return threads.filter(t => getEffectiveThreadReaction(t) === FORUM_REACTIONS.LIKE);
    }, [getEffectiveThreadReaction, threads, isAuthenticated, listTab]);
    const threadCount = visibleThreads.length;
    return <div className="min-h-screen bg-background-page">
        {/* ── Header: on the page canvas like every other page ──── */}
        <div>
            <PageContainer>
                <div className="pt-8">
                    <PageHeader
                        title={t("community_forum")}
                        subtitle={t("share_ideas_report_issues_and_discuss_wi")}
                        actions={isAuthenticated ? <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setSettingsOpen(true)} className="h-10 w-10 rounded border border-border-light bg-background-primary text-text-muted hover:text-text-secondary hover:bg-background-tertiary hover:border-border inline-flex items-center justify-center transition-colors duration-150" title={t("forum_settings")}>
                                <Settings2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                            <button type="button" onClick={() => setComposerOpen(true)} className={buttonClasses()}>
                                <Plus className="w-4 h-4" strokeWidth={1.5} />
                                <span className="hidden sm:inline">{t("new_thread")}</span>
                            </button>
                        </div> : null}
                    />

                    {/* Search + Filters Row */}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search */}
                        <div className={`relative w-full sm:max-w-sm transition-colors duration-150 ${searchFocused ? 'sm:max-w-md' : ''}`}>
                            <Search className={`h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${searchFocused ? 'text-text-primary' : 'text-text-muted'}`} strokeWidth={1.5} />
                            <input value={forum.search} onChange={e => forum.setSearch(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} placeholder={t("search_threads")} className="w-full h-10 pl-10 pr-4 rounded border border-border-light bg-background-secondary text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-card-border-hover focus:bg-background-primary transition duration-150" />
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.5} />
                            <select value={forum.sort} onChange={e => forum.setSort(e.target.value)} className="rounded border border-border-light bg-background-primary px-3 py-2 text-sm text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-card-border-hover cursor-pointer transition duration-150">
                                {FORUM_SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Category Chips + Liked Tab */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {FORUM_CATEGORY_OPTIONS.map(c => {
                            const active = forum.category === c.id;
                            return <button key={c.id} type="button" onClick={() => forum.setCategory(c.id)} className={`inline-flex items-center gap-1.5 rounded border px-4 py-2 text-sm font-medium transition-colors duration-150 ${active ? 'border-accent-teal bg-accent-teal-50 text-accent-teal-800' : 'bg-background-primary text-text-secondary border-border hover:text-text-primary hover:bg-background-tertiary'}`}>
                                {c.label}
                            </button>;
                        })}

                        {isAuthenticated && <>
                            <div className="mx-1 hidden h-6 w-px bg-border-light sm:block" aria-hidden />
                            <button type="button" onClick={() => setListTab(listTab === FORUM_LIST_TABS.LIKED ? FORUM_LIST_TABS.ALL : FORUM_LIST_TABS.LIKED)} aria-pressed={listTab === FORUM_LIST_TABS.LIKED} className={`inline-flex items-center gap-1.5 rounded border px-4 py-2 text-sm font-medium transition-colors duration-150 ${listTab === FORUM_LIST_TABS.LIKED ? 'border-accent-teal bg-accent-teal-50 text-accent-teal-800' : 'border-border bg-background-primary text-text-secondary hover:bg-background-tertiary hover:text-text-primary'}`}>
                                <Heart className={`w-3.5 h-3.5 ${listTab === FORUM_LIST_TABS.LIKED ? 'fill-status-error' : ''}`} strokeWidth={1.5} />{t("liked")}</button>
                        </>}

                        {/* Thread count badge */}
                        <span className="ml-auto hidden text-sm tabular-nums text-text-tertiary sm:inline">
                            {t("forum_thread_count", { count: threadCount })}
                        </span>
                    </div>
                </div>
            </PageContainer>
        </div>

        {/* ── Main Content ───────────────────────────────────────── */}
        <PageContainer className="pb-8 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ── Thread List (Left) ─────────────────────────────── */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <div className="rounded border border-border-light bg-background-primary p-2 lg:sticky lg:top-24 space-y-2 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1 [scrollbar-width:thin]">
                        {forum.threadsError && <div className="rounded border border-border bg-background-secondary px-4 py-3 text-sm text-status-error-text font-medium">
                            {forum.threadsError}
                        </div>}

                        {showListSkeleton ? <>
                            <ThreadCardSkeleton />
                            <ThreadCardSkeleton />
                            <ThreadCardSkeleton />
                            <ThreadCardSkeleton />
                        </> : visibleThreads.length === 0 ? <div className="rounded border border-border-light bg-background-primary shadow-sm p-12 text-center mx-0.5">
                            <MessageCircle className="mx-auto mb-4 block h-5 w-5 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
                            <p className="text-sm font-semibold text-text-primary">
                                {listTab === FORUM_LIST_TABS.LIKED ? FORUM_MESSAGES.NO_LIKED_THREADS : FORUM_MESSAGES.NO_THREADS_FOUND}
                            </p>
                            <p className="text-sm text-text-muted mt-1">{listTab === FORUM_LIST_TABS.LIKED ? 'Like a thread to see it here.' : 'Try changing filters or search.'}</p>
                        </div> : <>
                            {visibleThreads.map(t => <ThreadCard key={t?.id} thread={t} isSelected={forum.selectedThreadId === t?.id} onSelect={forum.selectThread} reaction={forum.getEffectiveThreadReaction?.(t) || null} />)}
                            {forum.threadsHasMore && listTab !== FORUM_LIST_TABS.LIKED && <div className="flex justify-center pt-3 pb-1">
                                <button type="button" onClick={forum.loadMoreThreads} disabled={forum.threadsLoading} className={buttonClasses('secondary')}>
                                    {forum.threadsLoading ? 'Loading...' : FORUM_MESSAGES.LOAD_MORE}
                                </button>
                            </div>}
                        </>}
                    </div>
                </div>

                {/* ── Thread Detail (Right) ──────────────────────────── */}
                <div className="lg:col-span-7 xl:col-span-8">
                    <div className="lg:sticky lg:top-24">
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