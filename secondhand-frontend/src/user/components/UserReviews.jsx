import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Loader2, Star } from 'lucide-react';
import Alert from '../../common/components/ui/Alert.jsx';
import Card from '../../common/components/ui/Card.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
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
      <p className="text-sm font-medium text-text-tertiary">{t("rating_mix", "Puan Dağılımı")}</p>
      <ul className="space-y-1.5">
        {BREAKDOWN.map(({ key, label, bar }) => {
          const count = Number(stats[key]) || 0;
          const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
          return (
            <li key={key} className="flex items-center gap-3">
              <span className="inline-flex w-7 shrink-0 items-center gap-0.5 font-medium tabular-nums text-text-secondary text-sm">
                {label}
                <Star className="h-3 w-3 text-text-muted" strokeWidth={1.5} aria-hidden />
              </span>
              <div className="flex-1 min-w-0 h-1.5 rounded-full bg-background-tertiary overflow-hidden">
                <div
                  className={`h-full rounded-full ${bar} transition-colors duration-150 ease-out`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right tabular-nums text-text-tertiary text-sm shrink-0">
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

const CHIP = 'inline-flex flex-none cursor-pointer items-center gap-2 rounded border px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus';
const CHIP_ACTIVE = 'border-accent-teal bg-background-primary text-text-primary ring-1 ring-accent-teal';
const CHIP_IDLE = 'border-transparent bg-background-primary text-text-secondary shadow-sm hover:text-text-primary';

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
  const navigate = useNavigate();
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


  return (
    <div className="min-w-0 max-w-full space-y-6">
      <Card as="section" shadow={false} className="sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-text-primary">{t("reputation", "Satıcı İtibarı")}</h2>
            <p className="mt-1 max-w-md text-sm text-text-tertiary">
              {isOwnProfile
                ? t('reviews_own_hint', 'Tamamlanan siparişlerin ardından alıcıların bıraktığı değerlendirmeler.')
                : t('reviews_public_hint', 'Bu üyenin satıcı olarak aldığı tüm geri bildirimler.')}
            </p>
          </div>

          {totalReviewsStat > 0 ? (
            <div className="flex shrink-0 flex-col sm:items-end">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tabular-nums tracking-tight text-text-primary">
                  {roundedDisplay?.toFixed(1)}
                </span>
                <span className="text-sm text-text-tertiary">/{REVIEW_LIMITS.MAX_RATING}</span>
              </div>
              <div className="mt-1 flex items-center gap-0.5" aria-label={`${roundedDisplay} / 5`}>
                <RatingStarsDisplay value={averageRating} iconClassName="w-4 h-4" mode="round" />
              </div>
              <p className="mt-1 text-sm tabular-nums text-text-tertiary">
                {totalReviewsStat} {t("reviews", "değerlendirme")}
              </p>
            </div>
          ) : (
            <p className="text-sm text-text-tertiary">
              {t("no_reviews_yet_average_will_show_after_t", "Henüz değerlendirme bulunmuyor")}
            </p>
          )}
        </div>

        {reviewStats && totalReviewsStat > 0 ? <StarBreakdown stats={reviewStats} /> : null}
        {totalReviewsStat > 0 && (
          <div className="mt-5">
            <AuraSummary type="user" id={profileUserId} title={t('aura_review_summary_title', 'Aura yorum özeti')} />
          </div>
        )}
      </Card>

      <section className="min-w-0 space-y-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-text-primary">
              {t("reviews_received", "Alınan Değerlendirmeler")}
              {!filterActive && pagination?.totalElements > 0 ? (
                <span className="ml-1.5 font-normal tabular-nums text-text-tertiary">({pagination.totalElements})</span>
              ) : null}
              {filterActive ? (
                <span className="ml-1.5 font-normal tabular-nums text-text-tertiary">
                  ({filteredAll.length} {t("for_selected_listing", "seçili ilan için")})
                </span>
              ) : null}
            </h3>
          </div>

          {!initialListLoading && !filterActive && pagination?.totalElements > 0 ? (
            <label className="inline-flex shrink-0 items-center gap-2 text-sm text-text-secondary">
              <span>{t("per_page", "Sayfa başı:")}</span>
              <select
                value={pagination.size}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                aria-label={t("per_page", "Sayfa başı değerlendirme")}
                className="h-9 cursor-pointer rounded border border-border bg-background-primary px-2.5 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </label>
          ) : null}
        </div>

        {totalReviewsStat > 0 && listingOptions.length > 1 ? (
          <div
            className="-mx-1 min-w-0 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
            role="group"
            aria-label={t("listing_filter_chips", "İlan filtreleri")}
          >
            <div className="flex w-max flex-row flex-nowrap gap-2 pr-1">
              <button
                type="button"
                onClick={() => setListingFilter(ALL_LISTINGS)}
                aria-pressed={!filterActive}
                className={`${CHIP} ${!filterActive ? CHIP_ACTIVE : CHIP_IDLE}`}
              >
                <span>{t("all_listings", "Tüm İlanlar")}</span>
                <span className="tabular-nums text-text-tertiary">{totalReviewsStat}</span>
              </button>
              {listingOptions.map((opt) => {
                const active = listingFilter === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setListingFilter(opt.key)}
                    aria-pressed={active}
                    title={opt.title}
                    className={`${CHIP} max-w-64 ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
                  >
                    <span className="min-w-0 truncate">{opt.title}</span>
                    <span className="shrink-0 tabular-nums text-text-tertiary">{opt.count}</span>
                  </button>
                );
              })}
              {indexFetching ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin self-center text-text-tertiary" aria-hidden strokeWidth={1.5} />
              ) : null}
            </div>
          </div>
        ) : null}
        {indexLoadError ? (
          <p className="text-sm text-status-warning-text">{t("listing_filter_incomplete", "Filtre verisi eksik:")} {indexLoadError}</p>
        ) : null}

        <div className="relative" aria-busy={initialListLoading}>
          {initialListLoading ? (
            <ul className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <li key={i}><Skeleton className="h-32 w-full" /></li>
              ))}
            </ul>
          ) : receivedReviewsError ? (
            <Alert type="error" message={`${t("couldn_t_load_reviews", "Değerlendirmeler yüklenemedi")}: ${receivedReviewsError}`} />
          ) : receivedReviews.length === 0 && !filterActive ? (
            <EmptyState
              icon={Star}
              title={t("no_reviews_received_yet", "Henüz değerlendirme bulunmuyor")}
              description={isOwnProfile
                ? t('no_reviews_own_desc', 'Alıcılar siparişleri tamamlayıp geri bildirim bıraktığında değerlendirmeler burada görünecektir.')
                : t('no_reviews_public_desc', 'Bu üye henüz herkese açık bir değerlendirme almadı.')}
              primaryAction={isOwnProfile ? { label: t("go_to_my_listings", "İlanlarıma Git"), onClick: () => navigate(ROUTES.MY_LISTINGS) } : null}
            />
          ) : (
            <>
              <ul className={`space-y-3 ${!filterActive && pagingLoading ? 'opacity-50 transition-opacity duration-150' : ''}`}>
                {displayReviews.length === 0 && filterActive ? (
                  <li>
                    <EmptyState
                      size="compact"
                      icon={Star}
                      title={t("no_reviews_matched_this_listing_try_relo", "Bu ilan için henüz bir değerlendirme bulunmuyor.")}
                    />
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
                <div className="mt-6">
                  <Pagination page={page} totalPages={totalPages} onPageChange={loadPage} />
                </div>
              ) : null}

              {filterActive && filteredAll.length > 0 && filterTotalPages > 1 ? (
                <div className="mt-6">
                  <Pagination page={filterPage} totalPages={filterTotalPages} onPageChange={setFilterPage} />
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserReviews;