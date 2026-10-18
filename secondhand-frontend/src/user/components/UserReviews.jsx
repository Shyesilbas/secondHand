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

const BREAKDOWN = [
  { key: 'fiveStarReviews', label: '5', bar: 'bg-primary' },
  { key: 'fourStarReviews', label: '4', bar: 'bg-primary' },
  { key: 'threeStarReviews', label: '3', bar: 'bg-primary' },
  { key: 'twoStarReviews', label: '2', bar: 'bg-primary' },
  { key: 'oneStarReviews', label: '1', bar: 'bg-primary' }
];

const ALL_LISTINGS = 'all';
const FETCH_PAGE_SIZE = 100;

const StarBreakdown = ({ stats }) => {
  const { t } = useTranslation();
  const total = Number(stats?.totalReviews) || 0;
  if (total <= 0) return null;

  return (
    <div className="space-y-2 mt-5">
      <p className="text-xs font-semibold text-text-muted">{t("rating_mix", "Puan Dağılımı")}</p>
      <ul className="space-y-1.5">
        {BREAKDOWN.map(({ key, label, bar }) => {
          const count = Number(stats[key]) || 0;
          const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
          return (
            <li key={key} className="flex items-center gap-3 text-body">
              <span className="inline-flex w-7 shrink-0 items-center gap-0.5 font-medium tabular-nums text-text-secondary text-xs">
                {label}
                <Star className="h-3 w-3 text-text-muted" strokeWidth={1.5} aria-hidden />
              </span>
              <div className="flex-1 min-w-0 h-1.5 rounded-full bg-background-tertiary overflow-hidden">
                <div
                  className={`h-full rounded-full ${bar} transition-all duration-300 ease-out`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right tabular-nums text-text-muted text-xs shrink-0">
                {count}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
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
  const { t } = useTranslation();
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
        content.forEach((r) => merged.set(r.id, r));
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
          title: r.listingTitle || t('untitled_listing', 'İsimsiz İlan'),
          listingNo: r.listingNo ?? null,
          count: 1
        });
      } else {
        cur.count += 1;
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count || String(a.title).localeCompare(String(b.title)));
  }, [indexReviews, t]);

  const filteredAll = useMemo(() => {
    if (!filterActive) return [];
    return indexReviews.filter((r) => reviewListingGroupKey(r) === listingFilter);
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

  const cycleFilterPrev = useCallback(() => setFilterPage((fp) => Math.max(0, fp - 1)), []);
  const cycleFilterNext = useCallback(() => setFilterPage((fp) => Math.min(filterTotalPages - 1, fp + 1)), [filterTotalPages]);

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <section className="flex min-w-0 max-w-full flex-col rounded border border-border bg-background-primary overflow-hidden">
        {/* Rating summary banner */}
        <div className="shrink-0 min-w-0 p-5 sm:p-6 bg-background-secondary/60 border-b border-border">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 min-w-0 w-full">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-status-warning mb-1.5">
                <Sparkles className="w-3.5 h-3.5" aria-hidden />
                <span>{t("buyer_feedback", "Alıcı Geri Bildirimleri")}</span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
                {t("reputation", "Satıcı İtibarı")}
              </h2>
              <p className="text-xs text-text-muted mt-1 max-w-md leading-relaxed">
                {isOwnProfile
                  ? t('reviews_own_hint', 'Tamamlanan siparişlerin ardından alıcıların bıraktığı değerlendirmeler.')
                  : t('reviews_public_hint', 'Bu üyenin satıcı olarak aldığı tüm geri bildirimler.')}
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5 w-full min-w-0 lg:w-auto lg:min-w-52 rounded border border-border bg-background-primary px-4 py-3.5">
              {totalReviewsStat > 0 ? (
                <>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-semibold text-text-primary tabular-nums tracking-tight">
                      {roundedDisplay?.toFixed(1)}
                    </span>
                    <span className="text-xs font-semibold text-text-muted">/{REVIEW_LIMITS.MAX_RATING}</span>
                  </div>
                  <div className="flex items-center gap-0.5 justify-end" aria-label={`${roundedDisplay} / 5`}>
                    <RatingStarsDisplay value={averageRating} iconClassName="w-4 h-4" mode="round" />
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 tabular-nums">
                    {t("based_on", "Toplam")}{' '}
                    <strong className="text-text-primary font-semibold">{totalReviewsStat}</strong>{' '}
                    {t("reviews", "değerlendirme")}
                  </p>
                </>
              ) : (
                <p className="text-xs text-text-muted py-2">
                  {t("no_reviews_yet_average_will_show_after_t", "Henüz değerlendirme bulunmuyor")}
                </p>
              )}
            </div>
          </div>

          {reviewStats && totalReviewsStat > 0 ? <StarBreakdown stats={reviewStats} /> : null}
          {totalReviewsStat > 0 && (
            <div className="mt-5">
              <AuraSummary type="user" id={profileUserId} />
            </div>
          )}
        </div>

        {/* Filter bar and controls */}
        <div className="shrink-0 min-w-0 w-full px-5 sm:px-6 py-3.5 border-b border-border bg-background-primary space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-text-primary tracking-tight">
                {t("reviews_received", "Alınan Değerlendirmeler")}
                {!filterActive && pagination?.totalElements > 0 ? (
                  <span className="font-normal text-text-muted ml-1.5 tabular-nums">({pagination.totalElements})</span>
                ) : null}
                {filterActive ? (
                  <span className="font-normal text-text-muted ml-1.5 tabular-nums">
                    ({filteredAll.length} {t("for_selected_listing", "seçili ilan için")})
                  </span>
                ) : null}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                {filterActive
                  ? t("filtered_reviews_hint", "Seçilen ilana göre filtrelendi · İncelemek için aşağı kaydırın")
                  : t("public_reviews_hint", "Yeniden eskiye · Herkese açık değerlendirmeler")}
              </p>
            </div>

            {!initialListLoading && !filterActive && pagination?.totalElements > 0 ? (
              <label className="inline-flex items-center gap-2 text-xs text-text-secondary shrink-0">
                <span>{t("per_page", "Sayfa başı:")}</span>
                <select
                  value={pagination.size}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  aria-label={t("per_page", "Sayfa başı değerlendirme")}
                  className="h-8 rounded border border-border bg-background-primary px-2.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </label>
            ) : null}
          </div>

          {totalReviewsStat > 0 ? (
            <div className="min-w-0 pt-1">
              <p className="text-xs font-medium text-text-muted mb-2 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden />
                <span>{t("filter_by_listing", "İlana Göre Filtrele")}</span>
                {indexFetching ? <Loader2 className="w-3 h-3 animate-spin text-status-warning" aria-hidden /> : null}
              </p>
              <div
                className="min-w-0 w-full overflow-x-auto overflow-y-hidden pb-1 -mx-1 px-1 [scrollbar-width:thin]"
                role="group"
                aria-label={t("listing_filter_chips", "İlan filtreleri")}
              >
                <div className="flex flex-row flex-nowrap gap-2 w-max max-w-none pr-1">
                  <button
                    type="button"
                    onClick={() => setListingFilter(ALL_LISTINGS)}
                    className={`flex-none inline-flex items-center gap-2 rounded border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      !filterActive
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-background-primary text-text-secondary hover:bg-background-secondary'
                    }`}
                  >
                    <span>{t("all_listings", "Tüm İlanlar")}</span>
                    {totalReviewsStat > 0 ? (
                      <span
                        className={`tabular-nums px-1.5 py-0.5 rounded-sm text-xs ${
                          !filterActive ? 'bg-background-primary/20 text-white' : 'bg-background-secondary text-text-muted border border-border'
                        }`}
                      >
                        {totalReviewsStat}
                      </span>
                    ) : null}
                  </button>
                  {listingOptions.map((opt) => {
                    const active = listingFilter === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setListingFilter(opt.key)}
                        title={opt.title}
                        className={`flex-none text-left inline-flex flex-col rounded border px-3 py-1.5 text-xs font-medium transition-colors min-w-36 max-w-[260px] cursor-pointer ${
                          active
                            ? 'border-primary bg-background-secondary text-text-primary'
                            : 'border-border bg-background-primary text-text-secondary hover:bg-background-secondary'
                        }`}
                      >
                        <span className="block w-full min-w-0 truncate leading-snug">
                          {opt.title}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                          {opt.listingNo ? <span className="tabular-nums">#{opt.listingNo}</span> : null}
                          <span
                            className={`tabular-nums px-1.5 py-0.2 rounded-sm text-xs ${
                              active ? 'bg-background-primary text-text-primary border border-border' : 'bg-background-secondary text-text-muted'
                            }`}
                          >
                            {opt.count} {t("reviews", "değerlendirme")}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {indexLoadError ? (
                <p className="mt-1.5 text-xs text-status-warning">{t("listing_filter_incomplete", "Filtre verisi eksik:")} {indexLoadError}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Reviews list */}
        <div className="relative bg-background-secondary/20">
          {pagingLoading && !filterActive ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 bg-primary/20 animate-pulse" aria-hidden />
          ) : null}

          {initialListLoading ? (
            <div className="p-5 sm:p-6" aria-busy="true">
              <ul className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <li key={i} className="rounded border border-border bg-background-primary p-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-background-secondary" />
                      <div className="flex-1 space-y-2.5">
                        <div className="h-3.5 w-1/4 rounded bg-background-secondary" />
                        <div className="h-3.5 w-full rounded bg-background-secondary" />
                        <div className="h-3.5 w-3/4 rounded bg-background-secondary" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : receivedReviewsError ? (
            <div className="p-5 sm:p-6">
              <div className="rounded border border-border bg-background-primary px-6 py-12 text-center">
                <AlertCircle className="mx-auto mb-3 block h-5 w-5 text-status-error" strokeWidth={1.5} aria-hidden />
                <p className="mb-1 text-sm font-semibold text-text-primary">{t("couldn_t_load_reviews", "Değerlendirmeler yüklenemedi")}</p>
                <p className="text-xs text-text-secondary">{receivedReviewsError}</p>
              </div>
            </div>
          ) : receivedReviews.length === 0 && !filterActive ? (
            <div className="p-5 sm:p-6">
              <div className="rounded border border-dashed border-border bg-background-primary px-6 py-14 text-center">
                <Star className="mx-auto mb-3 block h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
                <h4 className="mb-1 text-base font-semibold text-text-primary">{t("no_reviews_received_yet", "Henüz değerlendirme bulunmuyor")}</h4>
                <p className="mx-auto max-w-sm text-xs leading-relaxed text-text-muted">
                  {isOwnProfile
                    ? t('no_reviews_own_desc', 'Alıcılar siparişleri tamamlayıp geri bildirim bıraktığında değerlendirmeler burada görünecektir.')
                    : t('no_reviews_public_desc', 'Bu üye henüz herkese açık bir değerlendirme almadı.')}
                </p>
                {isOwnProfile ? (
                  <Link
                    to={ROUTES.MY_LISTINGS}
                    className="mt-4 inline-flex text-xs font-semibold text-text-primary underline underline-offset-4 hover:text-primary transition-colors"
                  >
                    {t("go_to_my_listings", "İlanlarıma Git")}
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              <ul className={`space-y-3.5 pb-1 ${filterActive ? '' : pagingLoading ? 'opacity-70 transition-opacity duration-150' : ''}`}>
                {displayReviews.length === 0 && filterActive ? (
                  <li className="rounded border border-dashed border-border bg-background-primary px-6 py-10 text-center text-xs text-text-secondary">
                    {t("no_reviews_matched_this_listing_try_relo", "Bu ilan için henüz bir değerlendirme bulunmuyor.")}
                  </li>
                ) : (
                  displayReviews.map((review) => (
                    <li key={review.id}>
                      <ReviewCard review={review} variant="profile" />
                    </li>
                  ))
                )}
              </ul>

              {!filterActive && pagination && pagination.totalPages > 1 ? (
                <nav
                  className="mt-5 flex shrink-0 flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
                  aria-label={t("reviews_pagination", "Değerlendirme sayfalandırma")}
                >
                  <p className="order-2 text-xs tabular-nums text-text-muted sm:order-1">
                    {t("page", "Sayfa")} {page + 1} {t("of", "/")} {pagination.totalPages}
                    {pagination.totalElements ? (
                      <span className="text-text-muted"> · {pagination.totalElements} {t("total", "toplam")}</span>
                    ) : null}
                  </p>
                  <div className="order-1 flex items-center justify-center gap-2 sm:order-2">
                    <button
                      type="button"
                      onClick={() => loadPage(page - 1)}
                      disabled={page <= 0 || pagingLoading}
                      className="inline-flex items-center justify-center gap-1.5 rounded text-xs font-medium transition-colors border border-border bg-background-primary text-text-primary hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-50 h-8 px-3 cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>{t("previous", "Önceki")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPage(page + 1)}
                      disabled={page >= totalPages - 1 || pagingLoading}
                      className="inline-flex items-center justify-center gap-1.5 rounded text-xs font-medium transition-colors border border-border bg-background-primary text-text-primary hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-50 h-8 px-3 cursor-pointer"
                    >
                      <span>{t("next", "Sonraki")}</span>
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    {pagingLoading ? (
                      <Loader2 className="ml-1.5 h-4 w-4 animate-spin text-status-warning" aria-label={t("loading", "Yükleniyor")} />
                    ) : null}
                  </div>
                </nav>
              ) : null}

              {filterActive && filteredAll.length > 0 && filterTotalPages > 1 ? (
                <nav
                  className="mt-5 flex shrink-0 flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
                  aria-label={t("filtered_reviews_pagination", "Filtrelenmiş değerlendirme sayfalandırma")}
                >
                  <p className="text-xs tabular-nums text-text-muted">
                    {t("page", "Sayfa")} {filterPage + 1} {t("of", "/")} {filterTotalPages} · {filteredAll.length} {t("reviews", "değerlendirme")}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={cycleFilterPrev}
                      disabled={filterPage <= 0}
                      className="inline-flex items-center justify-center gap-1.5 rounded text-xs font-medium transition-colors border border-border bg-background-primary text-text-primary hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-50 h-8 px-3 cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>{t("previous", "Önceki")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={cycleFilterNext}
                      disabled={filterPage >= filterTotalPages - 1}
                      className="inline-flex items-center justify-center gap-1.5 rounded text-xs font-medium transition-colors border border-border bg-background-primary text-text-primary hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-50 h-8 px-3 cursor-pointer"
                    >
                      <span>{t("next", "Sonraki")}</span>
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </nav>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserReviews;