import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Award, CheckCircle2, Grid3X3, Heart, Package, Plus, Sparkles, Star } from 'lucide-react';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { useUserListings } from '../hooks/useUserListings.js';
import { usePagedUserReceivedReviews, useUserReviewStats } from '../../reviews/index.js';
import { useUserFavoriteLists, FavoriteListCard, FavoriteListModal } from '../../favoritelist/index.js';
import ListingCard from '../../listing/components/ListingCard.jsx';
import UserProfileHeader from '../components/UserProfileHeader.jsx';
import UserReviews from '../components/UserReviews.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { useGreatSellerStatus } from '../hooks/useGreatSellerStatus.js';
const TABS = [{
  key: 'listings',
  label: 'Listings',
  icon: Package
}, {
  key: 'lists',
  label: 'Lists',
  icon: Heart
}, {
  key: 'reviews',
  label: 'Reviews',
  icon: Star
}];

/** Own profile — Great Seller dört ölçüt (tek satış metriği fiyat filtresini içerir). */
const GreatSellerProgressCard = ({
  gs
}) => {
  const {
    t
  } = useTranslation();
  if (!gs) return null;
  const minTry = Number(gs.minUnitPriceThreshold ?? 1500);
  const days = gs.rollingWindowDays ?? 60;
  const salesTarget = gs.qualifyingSalesTarget || 1;
  const revTarget = gs.distinctReviewerTarget || 1;
  const salesPct = Math.min(100, gs.qualifyingSalesLastWindow / salesTarget * 100);
  const revPct = Math.min(100, gs.distinctReviewerCount / revTarget * 100);
  const minRating = gs.minimumAverageRating ?? 4.7;
  const avg = gs.averageRating ?? 0;
  const ratingPct = gs.ratingMet ? 100 : Math.min(100, minRating ? avg / minRating * 100 : 0);
  const Bar = ({
    pct,
    done
  }) => <div className="h-1.5 bg-secondary-light rounded-full overflow-hidden mt-1.5">
            <div className={`h-full rounded-full transition-all ${done ? 'bg-status-success-bg' : 'bg-gray-900'}`} style={{
      width: `${Math.min(100, pct)}%`
    }} />
        </div>;
  return <PageContainer className="pb-5">
            <div className="bg-background-primary rounded-2xl border border-amber-200/80 p-5 shadow-sm shadow-amber-900/5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-status-warning-bg text-amber-700 ring-1 ring-amber-100">
                            <Award className="w-5 h-5 shrink-0" />
                        </span>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("great_seller_milestones")}</h2>
                            <p className="text-xs font-medium text-text-muted">{t("progress_is_calculated_from_completed_ma")}</p>
                        </div>
                    </div>
                    {gs.eligible ? <span className="inline-flex items-center gap-1 text-caption font-semibold text-emerald-800 bg-status-success-bg px-2 py-0.5 rounded-full border border-emerald-100">
                            <CheckCircle2 className="w-3.5 h-3.5" />{t("completed")}</span> : null}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-gray-100 bg-secondary-light p-4">
                        <div className="flex justify-between items-baseline gap-2">
                            <p className="text-body font-semibold text-gray-800">{t("paid_order_lines")} ({days} {t("days")})</p>
                            <span className="text-caption font-bold tabular-nums text-text-muted">
                                {gs.qualifyingSalesLastWindow}&nbsp;/&nbsp;{gs.qualifyingSalesTarget}
                                {gs.salesMet ? <CheckCircle2 className="inline w-3.5 h-3.5 text-emerald-500 ml-1 align-text-bottom" /> : null}
                            </span>
                        </div>
                        <p className="text-caption text-text-muted mt-0.5 leading-snug">{t("completed_checkout_try_lines_with_unit_p")}{minTry.toLocaleString('tr-TR')}
                        </p>
                        <Bar pct={salesPct} done={gs.salesMet} />
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-secondary-light p-4">
                        <div className="flex justify-between items-baseline gap-2">
                            <p className="text-body font-semibold text-gray-800">{t("unique_buyer_reviews")}</p>
                            <span className="text-caption font-bold tabular-nums text-text-muted">
                                {gs.distinctReviewerCount}&nbsp;/&nbsp;{gs.distinctReviewerTarget}
                                {gs.reviewersMet ? <CheckCircle2 className="inline w-3.5 h-3.5 text-emerald-500 ml-1 align-text-bottom" /> : null}
                            </span>
                        </div>
                        <Bar pct={revPct} done={gs.reviewersMet} />
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-secondary-light p-4">
                        <div className="flex justify-between items-baseline gap-2">
                            <p className="text-body font-semibold text-gray-800">{t("average_rating")}</p>
                            <span className="text-caption font-bold tabular-nums text-text-muted">
                                {(avg ?? 0).toFixed(2)}
                                {' / '}
                                {minRating.toFixed(1)}
                                {gs.ratingMet ? <CheckCircle2 className="inline w-3.5 h-3.5 text-emerald-500 ml-1 align-text-bottom" /> : null}
                            </span>
                        </div>
                        <Bar pct={ratingPct} done={gs.ratingMet} />
                    </div>
                </div>
            </div>
        </PageContainer>;
};
const useUserProfile = userId => {
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  React.useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await userService.getUserById(userId);
        if (response && response.id) {
          setUser(response);
        }
      } catch (err) {
        setError(err?.message || 'Unable to load this profile.');
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) fetchUser();else setIsLoading(false);
  }, [userId]);
  return {
    user,
    isLoading,
    error
  };
};
const UserProfilePage = () => {
  const {
    t
  } = useTranslation();
  const {
    userId
  } = useParams();
  const navigate = useNavigate();
  const {
    user: currentUser
  } = useAuthState();
  const [activeTab, setActiveTab] = useState('listings');
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const {
    user,
    isLoading: userLoading,
    error: userError
  } = useUserProfile(userId);
  const {
    listings,
    isLoading: listingsLoading,
    error: listingsError,
    pagination,
    loadPage,
    handlePageSizeChange
  } = useUserListings(userId, {
    enabled: activeTab === 'listings',
    page: 0,
    size: 12
  });
  const {
    reviews: receivedReviews,
    loading: receivedReviewsLoading,
    isFetching: receivedReviewsFetching,
    error: receivedReviewsError,
    pagination: reviewsPagination,
    loadPage: loadReviewsPage,
    handlePageSizeChange: handleReviewsPageSizeChange
  } = usePagedUserReceivedReviews(userId, {
    enabled: activeTab === 'reviews',
    size: 10
  });
  const {
    stats: reviewStats
  } = useUserReviewStats(userId, {
    enabled: true
  });
  const isOwnProfile = currentUser && String(currentUser.id) === String(userId);
  const {
    data: greatSeller
  } = useGreatSellerStatus(userId, {
    enabled: Boolean(userId)
  });
  const {
    data: favoriteLists = [],
    isLoading: listsLoading,
    refetch: refetchLists
  } = useUserFavoriteLists(userId, isOwnProfile, {
    enabled: activeTab === 'lists'
  });
  const handlePageChange = page => loadPage(page);

  // Loading state
  if (userLoading) {
    return <div className="min-h-screen bg-background-secondary flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-border-DEFAULT border-t-gray-800 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-text-muted font-medium">{t("loading_profile")}</p>
                </div>
            </div>;
  }

  // Error state
  if (userError || !user) {
    return <div className="min-h-screen bg-background-secondary flex items-center justify-center">
                <div className="text-center max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-status-error-bg flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-status-error" />
                    </div>
                    <p className="text-lg font-semibold text-text-primary mb-1">{t("user_not_found")}</p>
                    <p className="text-sm text-text-muted mb-6">{userError || 'The profile you\'re looking for doesn\'t exist.'}</p>
                    <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">{t("go_back")}</button>
                </div>
            </div>;
  }
  return <div className="min-h-screen bg-[#f8faf8]">
            {/* ── Profile Header (full-width banner) ──────────── */}
            <UserProfileHeader user={user} isOwnProfile={isOwnProfile} reviewStats={reviewStats} greatSellerEligible={greatSeller?.eligible} />

            {isOwnProfile && greatSeller ? <GreatSellerProgressCard gs={greatSeller} /> : null}

            {/* ── Tab Bar ─────────────────────────────────────── */}
            <div className="sticky top-0 z-10 border-y border-border-light/80 bg-background-primary/90 backdrop-blur">
                <PageContainer>
                    <div className="flex items-center gap-2 overflow-x-auto py-3">
                        {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            let count = null;
            if (tab.key === 'listings' && pagination.totalElements > 0) count = pagination.totalElements;
            if (tab.key === 'lists' && favoriteLists.length > 0) count = favoriteLists.length;
            if (tab.key === 'reviews' && reviewStats?.totalReviews > 0) count = reviewStats.totalReviews;
            return <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`relative flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-all duration-200 ${isActive ? 'bg-gray-950 text-white shadow-sm' : 'bg-secondary-light text-text-secondary hover:bg-secondary-light hover:text-text-primary'}`}>
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    {count !== null && <span className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-caption font-bold tabular-nums ${isActive ? 'bg-background-primary/15 text-white' : 'bg-background-primary text-text-muted'}`}>
                                            {count}
                                        </span>}
                                </button>;
          })}
                    </div>
                </PageContainer>
            </div>

            {/* ── Tab Content ─────────────────────────────────── */}
            <PageContainer className="py-7">
                <div key={activeTab} className="animate-fadeIn min-w-0">

                    {/* ── Listings Tab ─────────────────────────── */}
                    {activeTab === 'listings' && <div>
                            {/* Controls row */}
                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-muted">
                                        <Grid3X3 className="h-3.5 w-3.5" />{t("marketplace")}</div>
                                    <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("listings")}</h2>
                                    <p className="text-sm text-text-muted mt-0.5">
                                        {isOwnProfile ? 'Your active listings' : 'All active listings by this user'}
                                    </p>
                                </div>
                                {!listingsLoading && pagination.totalElements > 0 && <div className="flex items-center gap-2 rounded-xl border border-border-light bg-background-primary p-1.5 shadow-sm">
                                        <select value={pagination.size} onChange={e => handlePageSizeChange(Number(e.target.value))} className="h-9 border border-border-light rounded-lg px-3 text-sm font-semibold text-text-secondary bg-background-primary focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-border-DEFAULT cursor-pointer">
                                            <option value={10}>10</option>
                                            <option value={15}>15</option>
                                            <option value={20}>20</option>
                                        </select>
                                        <span className="text-xs text-text-muted font-medium">{t("per_page")}</span>
                                    </div>}
                            </div>

                            {listingsLoading ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                     {[...Array(8)].map((_, i) => <div key={i} className="bg-background-primary border border-border-light rounded-2xl overflow-hidden animate-pulse">
                                             <div className="aspect-square bg-secondary-light" />
                                             <div className="p-3.5 space-y-2">
                                                 <div className="h-4 bg-secondary-light rounded w-3/4" />
                                                 <div className="h-3 bg-secondary-light rounded w-1/2" />
                                             </div>
                                         </div>)}
                                </div> : listingsError ? <EmptyState icon={AlertCircle} iconColor="text-status-error" iconBg="bg-status-error-bg" title={t("failed_to_load_listings")} description="Please try again later" /> : listings.length === 0 ? <EmptyState icon={Package} title={t("no_listings_yet")} description={isOwnProfile ? "You haven't created any listings yet" : "This user hasn't created any listings yet"} action={isOwnProfile ? {
            label: 'Create Listing',
            onClick: () => navigate(ROUTES.CREATE_LISTING)
          } : null} /> : <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {listings.map((listing, index) => <ListingCard key={listing.id} listing={listing} showActions={false} isOwner={currentUser?.id === listing.sellerId} currentUserId={currentUser?.id} priorityImage={index === 0} />)}
                                    </div>
                                    {!listingsLoading && pagination.totalPages > 1 && <div className="mt-6">
                                            <Pagination page={pagination.number} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                                        </div>}
                                </>}
                        </div>}

                    {/* ── Lists Tab ────────────────────────────── */}
                    {activeTab === 'lists' && <div>
                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-muted">
                                        <Sparkles className="h-3.5 w-3.5" />{t("curated")}</div>
                                    <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("lists")}</h2>
                                    <p className="text-sm text-text-muted mt-0.5">
                                        {isOwnProfile ? 'Your favorite lists' : 'Public favorite lists'}
                                    </p>
                                </div>
                                {isOwnProfile && <button onClick={() => setShowCreateListModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 text-sm font-semibold transition-all duration-200 shadow-sm">
                                        <Plus className="w-4 h-4" />{t("new_list")}</button>}
                            </div>

                             {listsLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                     {[...Array(3)].map((_, i) => <div key={i} className="bg-background-primary border border-border-light rounded-2xl overflow-hidden animate-pulse">
                                             <div className="aspect-[4/3] bg-secondary-light" />
                                             <div className="p-4 space-y-2">
                                                 <div className="h-4 bg-secondary-light rounded w-3/4" />
                                                 <div className="h-3 bg-secondary-light rounded w-1/2" />
                                             </div>
                                         </div>)}
                                </div> : favoriteLists.length === 0 ? <EmptyState icon={Heart} title={t("no_lists_yet")} description={isOwnProfile ? "You haven't created any lists yet" : "This user hasn't shared any public lists yet"} action={isOwnProfile ? {
            label: 'Create List',
            onClick: () => setShowCreateListModal(true)
          } : null} /> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {favoriteLists.map(list => <FavoriteListCard key={list.id} list={list} />)}
                                     {isOwnProfile && <button onClick={() => setShowCreateListModal(true)} className="aspect-[4/3] bg-background-primary border-2 border-dashed border-border-light rounded-2xl flex flex-col items-center justify-center hover:border-border-DEFAULT hover:bg-secondary-light transition-all duration-200 group">
                                             <div className="w-12 h-12 rounded-xl bg-secondary-light flex items-center justify-center mb-3 group-hover:bg-secondary-light transition-colors">
                                                 <Plus className="w-5 h-5 text-text-muted" />
                                             </div>
                                             <span className="text-sm font-semibold text-text-muted group-hover:text-text-secondary">{t("new_list")}</span>
                                         </button>}
                                </div>}
                        </div>}

                    {/* ── Reviews Tab ──────────────────────────── */}
                    {activeTab === 'reviews' && <UserReviews profileUserId={user.id ?? userId} receivedReviews={receivedReviews} receivedReviewsLoading={receivedReviewsLoading} receivedReviewsFetching={receivedReviewsFetching} receivedReviewsError={receivedReviewsError} pagination={reviewsPagination} loadPage={loadReviewsPage} handlePageSizeChange={handleReviewsPageSizeChange} reviewStats={reviewStats} isOwnProfile={isOwnProfile} />}
                </div>
            </PageContainer>

            <FavoriteListModal isOpen={showCreateListModal} onClose={() => setShowCreateListModal(false)} onSuccess={() => {
      refetchLists();
      setShowCreateListModal(false);
    }} />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
            `}</style>
        </div>;
};

/* ── Reusable Empty State ──────────────────────────────── */
const EmptyState = ({
  icon: Icon,
  iconColor = 'text-text-muted',
  iconBg = 'bg-secondary-light',
  title,
  description,
  action
}) => <div className="rounded-2xl border border-border-light bg-background-primary py-16 px-8 text-center">
        <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-medium text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-muted max-w-xs mx-auto">{description}</p>
        {action && <button onClick={action.onClick} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
                {action.label}
            </button>}
    </div>;
export default UserProfilePage;