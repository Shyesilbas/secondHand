import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight, LayoutGrid, Loader2, Sparkles, Star } from 'lucide-react';
import ReviewCard from '../../reviews/components/ReviewCard.jsx';
import AuraSummary from '../../common/components/AuraSummary.jsx';
import { RatingStarsDisplay } from '../../reviews/components/RatingStarsDisplay.jsx';
import { reviewService } from '../../reviews/services/reviewService.js';
import { REVIEW_LIMITS } from '../../reviews/reviewConstants.js';
import { ROUTES } from '../../common/constants/routes.js';
import { reviewListingGroupKey } from '../../reviews/utils/reviewListingGrouping.js';
const BREAKDOWN = [{
 key: 'fiveStarReviews',
 label: '5',
 bar: 'bg-primary'
}, {
 key: 'fourStarReviews',
 label: '4',
 bar: 'bg-primary'
}, {
 key: 'threeStarReviews',
 label: '3',
 bar: 'bg-primary'
}, {
 key: 'twoStarReviews',
 label: '2',
 bar: 'bg-primary'
}, {
 key: 'oneStarReviews',
 label: '1',
 bar: 'bg-primary'
}];
const ALL_LISTINGS = 'all';
const FETCH_PAGE_SIZE = 100;
const StarBreakdown = ({
 stats
}) => {
 const {
 t
 } = useTranslation();
 const total = Number(stats?.totalReviews) || 0;
 if (total <= 0) return null;
 return <div className="space-y-2.5 mt-6">
 <p className="text-xs font-semibold text-text-muted">{t("rating_mix")}</p>
 <ul className="space-y-2">
 {BREAKDOWN.map(({
 key,
 label,
 bar
 }) => {
 const count = Number(stats[key]) || 0;
 const pct = total > 0 ? Math.round(count / total * 1000) / 10 : 0;
 return <li key={key} className="flex items-center gap-3 text-body">
 <span className="inline-flex w-8 shrink-0 items-center gap-0.5 font-medium tabular-nums text-text-secondary">{label}<Star className="h-3 w-3 text-text-muted" strokeWidth={1.5} aria-hidden /></span>
 <div className="flex-1 min-w-0 h-2 rounded-full bg-secondary-light overflow-hidden">
 <div className={`h-full rounded-full ${bar} transition-all duration-500 ease-out`} style={{
 width: `${pct}%`
 }} />
 </div>
 <span className="w-12 text-right tabular-nums text-text-muted shrink-0">{count}</span>
 </li>;
 })}
 </ul>
 </div>;
};
const NO_REVIEWS = [];
const UserReviews = ({
 profileUserId,
 receivedReviews,
 receivedReviewsLoading,
 receivedReviewsFetching = false,
 receivedReviewsError,
 pagination,
 loadPage,
 handlePageSizeChange,
 reviewStats,
 isOwnProfile = false
}) => {
 const {
 t
 } = useTranslation();
 const totalReviewsStat = Number(reviewStats?.totalReviews) || 0;
 const avgRaw = Number(reviewStats?.averageRating);
 const averageRating = Number.isFinite(avgRaw) ? avgRaw : 0;
 const roundedDisplay = totalReviewsStat > 0 ? Math.round(averageRating * 10) / 10 : null;
 const [listingFilter, setListingFilter] = useState(ALL_LISTINGS);
 const [filterPage, setFilterPage] = useState(0);
 const page = pagination?.number ?? 0;
 const totalPages = Math.max(1, pagination?.totalPages ?? 1);
 const initialListLoading = receivedReviewsLoading && receivedReviews.length === 0;
 const pagingLoading = Boolean(receivedReviewsFetching && receivedReviews.length > 0);
 const filterActive = listingFilter !== ALL_LISTINGS;

 // The listing filter needs every received review; pages are merged into one cached list.
 const { data: indexReviews = NO_REVIEWS, isFetching: indexFetching, error: indexError } = useQuery({
 queryKey: ['reviews', 'received', 'all', profileUserId],
 queryFn: async () => {
 const merged = new Map();
 for (let p = 0, totalPagesRemote = 1; p < totalPagesRemote && p < 60; p += 1) {
 const res = await reviewService.getReviewsReceivedByUser(profileUserId, p, FETCH_PAGE_SIZE);
 const content = Array.isArray(res?.content) ? res.content : [];
 content.forEach(r => merged.set(r.id, r));
 if (content.length === 0) break;
 totalPagesRemote = Math.max(1, Number(res?.totalPages) || 1);
 }
 return [...merged.values()];
 },
 enabled: !!profileUserId && totalReviewsStat > 0,
 staleTime: 60 * 1000
 });
 const indexLoadError = indexError?.message || null;
 const listingOptions = useMemo(() => {
 const map = new Map();
 for (const r of indexReviews) {
 const key = reviewListingGroupKey(r);
 const cur = map.get(key);
 if (!cur) {
 map.set(key, {
 key,
 title: r.listingTitle || 'Untitled listing',
 listingNo: r.listingNo ?? null,
 count: 1
 });
 } else {
 cur.count += 1;
 }
 }
 return [...map.values()].sort((a, b) => b.count - a.count || String(a.title).localeCompare(String(b.title)));
 }, [indexReviews]);
 const filteredAll = useMemo(() => {
 if (!filterActive) return [];
 return indexReviews.filter(r => reviewListingGroupKey(r) === listingFilter);
 }, [indexReviews, filterActive, listingFilter]);
 const clientPerPage = Math.min(50, Math.max(5, Number(pagination?.size) || 10));
 const filterTotalPages = filteredAll.length > 0 ? Math.max(1, Math.ceil(filteredAll.length / clientPerPage)) : 1;
 useEffect(() => {
 setFilterPage(0);
 }, [listingFilter, clientPerPage]);
 const displayReviews = useMemo(() => {
 if (!filterActive) return receivedReviews;
 return filteredAll.slice(filterPage * clientPerPage, (filterPage + 1) * clientPerPage);
 }, [filterActive, receivedReviews, filteredAll, filterPage, clientPerPage]);
 const cycleFilterPrev = useCallback(() => setFilterPage(fp => Math.max(0, fp - 1)), []);
 const cycleFilterNext = useCallback(() => setFilterPage(fp => Math.min(filterTotalPages - 1, fp + 1)), [filterTotalPages]);
 return <div className="space-y-6 min-w-0 max-w-full">
 <section className="flex min-w-0 max-w-full flex-col overflow-visible rounded-md border border-border-light/90 bg-background-primary">
 <div className="shrink-0 min-w-0 p-5 sm:p-7 bg-background-secondary border-b border-border-light">
 <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-10 min-w-0 w-full">
 <div className="min-w-0">
 <div className="flex items-center gap-2 text-xs font-semibold text-status-warning-text/90 mb-2">
 <Sparkles className="w-4 h-4" aria-hidden />{t("buyer_feedback")}</div>
 <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("reputation")}</h2>
 <p className="text-sm text-text-muted mt-2 max-w-md leading-relaxed">
 {isOwnProfile ? 'Ratings left by buyers after completed orders. Build trust with clear communication and accurate listings.' : 'Aggregated from reviews this member received as a seller.'}
 </p>
 </div>

 <div className="shrink-0 flex flex-col items-start sm:items-end gap-2 w-full min-w-0 lg:w-auto lg:min-w-56 rounded-md border border-border-light/80 bg-background-primary px-5 py-4">
 {totalReviewsStat > 0 ? <>
 <div className="flex items-baseline gap-2">
 <span className="text-4xl sm:text-5xl font-semibold text-text-primary tabular-nums tracking-tight">
 {roundedDisplay?.toFixed(1)}
 </span>
 <span className="text-sm font-semibold text-text-muted">/{REVIEW_LIMITS.MAX_RATING}</span>
 </div>
 <div className="flex items-center gap-0.5 justify-end" aria-label={`${roundedDisplay} out of 5 average`}>
 <RatingStarsDisplay value={averageRating} iconClassName="w-5 h-5" mode="round" />
 </div>
 <p className="text-sm text-text-muted mt-1 tabular-nums">{t("based_on")}<strong className="text-text-primary font-semibold">{totalReviewsStat}</strong>{' '}
 {totalReviewsStat === 1 ? 'review' : 'reviews'}
 </p>
 </> : <p className="text-sm text-text-muted py-2">{t("no_reviews_yet_average_will_show_after_t")}</p>}
 </div>
 </div>

 {reviewStats && totalReviewsStat > 0 ? <StarBreakdown stats={reviewStats} /> : null}
 {totalReviewsStat > 0 && <div className="mt-6">
 <AuraSummary type="user" id={profileUserId} />
 </div>}
 </div>

 <div className="shrink-0 min-w-0 w-full px-5 sm:px-7 py-4 border-b border-border-light bg-background-primary/60 space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 min-w-0">
 <div className="min-w-0 flex-1">
 <h3 className="text-sm font-medium text-text-primary tracking-tight">{t("reviews_received")}{!filterActive && pagination?.totalElements > 0 ? <span className="font-normal text-text-muted ml-2 tabular-nums">({pagination.totalElements})</span> : null}
 {filterActive ? <span className="font-normal text-text-muted ml-2 tabular-nums">
 ({filteredAll.length}{t("for_selected_listing")}</span> : null}
 </h3>
 <p className="text-xs text-text-muted mt-1">
 {filterActive ? 'Filtered on this browser · Scroll down for reviews' : 'Newest first • Public to profile visitors'}
 </p>
 </div>
 {!initialListLoading && !filterActive && pagination?.totalElements > 0 ? <label className="inline-flex items-center gap-2 text-sm text-text-secondary shrink-0">
 <span className="hidden sm:inline">{t("per_page")}</span>
 <select value={pagination.size} onChange={e => handlePageSizeChange(Number(e.target.value))} className="h-10 min-w-20 rounded border border-border-light bg-background-primary px-3 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-border-DEFAULT cursor-pointer">
 <option value={10}>10</option>
 <option value={15}>15</option>
 <option value={20}>20</option>
 </select>
 </label> : null}
 </div>

 {totalReviewsStat > 0 ? <div className="min-w-0">
 <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1.5">
 <LayoutGrid className="w-3.5 h-3.5" aria-hidden />{t("filter_by_listing")}{indexFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin text-status-warning-text" aria-hidden /> : null}
 </p>
 <div className="min-w-0 w-full overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch] touch-pan-x pb-2 -mx-1 px-1 [scrollbar-width:thin]" role="group" aria-label={t("listing_filter_chips")}>
 <div className="flex flex-row flex-nowrap gap-2 w-max max-w-none pr-1">
 <button type="button" onClick={() => setListingFilter(ALL_LISTINGS)} className={`flex-none inline-flex items-center gap-2 rounded border px-3 py-2 text-xs font-semibold transition-colors max-w-[min(240px,calc(100vw-120px))] ${!filterActive ? 'border-primary bg-primary text-white' : 'border-border-light bg-background-primary text-text-secondary hover:border-border-DEFAULT'}`}>{t("all_listings")}{totalReviewsStat > 0 ? <span className={`tabular-nums px-2 py-0.5 rounded-md text-xs ${!filterActive ? 'bg-background-primary/15' : 'bg-secondary-light'}`}>
 {totalReviewsStat}
 </span> : null}
 </button>
 {listingOptions.map(opt => {
 const active = listingFilter === opt.key;
 return <button key={opt.key} type="button" onClick={() => setListingFilter(opt.key)} title={opt.title} className={`flex-none max-w-none text-left inline-flex flex-col rounded border px-3 py-2 text-xs font-semibold transition-colors min-w-40 max-w-[min(288px,calc(100vw-6rem))] ${active ? 'border-status-warning bg-background-secondary text-status-warning-text ring-2 ring-status-warning' : 'border-border-light bg-background-primary text-text-primary hover:border-border'}`}>
 <span className="block w-full min-w-0 overflow-x-auto overscroll-x-contain whitespace-nowrap [scrollbar-width:thin] [-webkit-overflow-scrolling:touch] touch-pan-x leading-snug py-px">
 {opt.title}
 </span>
 <span className="mt-1 flex flex-wrap items-center gap-1 text-xs font-semibold text-text-muted">
 {opt.listingNo ? <span className="tabular-nums">#{opt.listingNo}</span> : null}
 <span className={`tabular-nums px-2 py-0.5 rounded-md ${active ? 'bg-background-primary/70 text-status-warning-text' : 'bg-secondary-light text-text-muted'}`}>
 {opt.count}{t("reviews")}</span>
 </span>
 </button>;
 })}
 </div>
 </div>
 {indexLoadError ? <p className="mt-2 text-xs text-status-warning-text">{t("listing_filter_incomplete")}{indexLoadError}</p> : null}
 </div> : null}
 </div>

 {/* Liste: viewport içi iç içe overflow yerine doğal akış — window ile kayar (kısa ekranda grid 1fr=0 sorunu biter). */}
 <div className="relative bg-secondary-light/40">
 {pagingLoading && !filterActive ? <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 opacity-80 animate-pulse" aria-hidden /> : null}

 {initialListLoading ? <div className="p-5 sm:p-7" aria-busy="true">
 <ul className="space-y-4">
 {[...Array(4)].map((_, i) => <li key={i} className="rounded-md border border-border-light/80 bg-background-primary p-5 animate-pulse">
 <div className="flex gap-4">
 <div className="h-12 w-12 shrink-0 rounded bg-secondary-light" />
 <div className="flex-1 space-y-3">
 <div className="h-4 w-1/3 rounded bg-secondary-light" />
 <div className="h-4 w-full rounded bg-secondary-light" />
 <div className="h-4 w-5/6 rounded bg-secondary-light" />
 </div>
 </div>
 </li>)}
 </ul>
 </div> : receivedReviewsError ? <div className="p-5 sm:p-7">
 <div className="rounded-md border border-border bg-background-secondary px-6 py-14 text-center">
 <AlertCircle className="mx-auto mb-4 block h-5 w-5 shrink-0 text-status-error" strokeWidth={1.5} aria-hidden />
 <p className="mb-1 text-base font-semibold text-text-primary">{t("couldn_t_load_reviews")}</p>
 <p className="text-sm text-text-secondary">{receivedReviewsError}</p>
 </div>
 </div> : receivedReviews.length === 0 && !filterActive ? <div className="p-5 sm:p-7">
 <div className="rounded-md border border-dashed border-border-light bg-background-primary px-6 py-16 text-center">
 <Star className="mx-auto mb-4 block h-5 w-5 shrink-0 text-secondary-300" strokeWidth={1.5} aria-hidden />
 <h4 className="mb-2 text-lg font-semibold text-text-primary">{t("no_reviews_received_yet")}</h4>
 <p className="mx-auto max-w-sm text-sm leading-relaxed text-text-muted">
 {isOwnProfile ? 'When buyers complete orders and leave feedback, ratings will appear here.' : 'This member has not received any public reviews.'}
 </p>
 {isOwnProfile ? <Link to={ROUTES.MY_LISTINGS} className="mt-6 inline-flex text-sm font-semibold text-text-primary underline underline-offset-4 hover:text-status-warning-text">{t("go_to_my_listings")}</Link> : null}
 </div>
 </div> : <div className="p-5 sm:p-7">
 <ul className={`space-y-4 pb-1 ${filterActive ? '' : pagingLoading ? 'opacity-70 transition-opacity duration-150' : ''}`}>
 {displayReviews.length === 0 && filterActive ? <li className="rounded-md border border-dashed border-border-light bg-background-primary px-6 py-12 text-center text-sm text-text-secondary">{t("no_reviews_matched_this_listing_try_relo")}</li> : displayReviews.map(review => <li key={review.id}>
 <ReviewCard review={review} variant="profile" />
 </li>)}
 </ul>

 {!filterActive && pagination && pagination.totalPages > 1 ? <nav className="mt-6 flex shrink-0 flex-col gap-4 border-t border-border-light/90 bg-secondary-light/40 pb-6 pt-4 sm:flex-row sm:items-center sm:justify-between" aria-label={t("reviews_pagination")}>
 <p className="order-2 text-xs tabular-nums text-text-muted sm:order-1">{t("page")}{page + 1}{t("of")}{pagination.totalPages}
 {pagination.totalElements ? <span className="text-text-muted"> · {pagination.totalElements}{t("total")}</span> : null}
 </p>
 <div className="order-1 flex items-center justify-center gap-2 sm:order-2">
 <button type="button" onClick={() => loadPage(page - 1)} disabled={page <= 0 || pagingLoading} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4">
 <ChevronLeft className="h-4 w-4" />{t("previous")}</button>
 <button type="button" onClick={() => loadPage(page + 1)} disabled={page >= totalPages - 1 || pagingLoading} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4">{t("next")}<ChevronRight className="h-4 w-4" />
 </button>
 {pagingLoading ? <Loader2 className="ml-2 h-5 w-5 animate-spin text-status-warning" aria-label={t("loading")} /> : null}
 </div>
 </nav> : null}

 {filterActive && filteredAll.length > 0 && filterTotalPages > 1 ? <nav className="mt-6 flex shrink-0 flex-col gap-4 border-t border-border-light/90 bg-background-secondary px-0 pb-6 pt-4 sm:flex-row sm:items-center sm:justify-between" aria-label={t("filtered_reviews_pagination")}>
 <p className="text-xs tabular-nums text-text-muted">{t("listing_filter_page")}{filterPage + 1}{t("of")}{filterTotalPages} · {filteredAll.length}{t("reviews")}</p>
 <div className="flex items-center justify-center gap-2">
 <button type="button" onClick={cycleFilterPrev} disabled={filterPage <= 0} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4">
 <ChevronLeft className="h-4 w-4" />{t("previous")}</button>
 <button type="button" onClick={cycleFilterNext} disabled={filterPage >= filterTotalPages - 1} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4">{t("next")}<ChevronRight className="h-4 w-4" />
 </button>
 </div>
 </nav> : null}
 </div>}
 </div>
 </section>
 </div>;
};
export default UserReviews;