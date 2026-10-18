import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { useGreatSellerStatus } from '../hooks/useGreatSellerStatus.js';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
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
 <div className={`h-full rounded-full transition-all ${done ? 'bg-status-success' : 'bg-primary'}`} style={{
 width: `${Math.min(100, pct)}%`
 }} />
 </div>;
 return <PageContainer className="pb-5">
 <div className="bg-background-primary rounded-md border border-border/80 p-5">
 <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
 <div className="flex items-center gap-2">
 <Award className="h-5 w-5 shrink-0 text-status-warning-text" strokeWidth={1.5} aria-hidden />
 <div>
 <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("great_seller_milestones")}</h2>
 <p className="text-xs font-medium text-text-muted">{t("progress_is_calculated_from_completed_ma")}</p>
 </div>
 </div>
 {gs.eligible ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-primary bg-background-secondary px-2 py-0.5 rounded-sm border border-border">
 <CheckCircle2 className="w-3.5 h-3.5" />{t("completed")}</span> : null}
 </div>

 <div className="grid gap-4 md:grid-cols-3">
 <div className="rounded border border-border-light bg-secondary-light p-4">
 <div className="flex justify-between items-baseline gap-2">
 <p className="text-body font-semibold text-text-primary">{t("paid_order_lines")} ({days} {t("days")})</p>
 <span className="text-xs font-semibold tabular-nums text-text-muted">
 {gs.qualifyingSalesLastWindow}&nbsp;/&nbsp;{gs.qualifyingSalesTarget}
 {gs.salesMet ? <CheckCircle2 className="inline w-3.5 h-3.5 text-text-secondary ml-1 align-text-bottom" /> : null}
 </span>
 </div>
 <p className="text-xs text-text-muted mt-0.5 leading-snug">{t("completed_checkout_try_lines_with_unit_p")}{minTry.toLocaleString('tr-TR')}
 </p>
 <Bar pct={salesPct} done={gs.salesMet} />
 </div>

 <div className="rounded border border-border-light bg-secondary-light p-4">
 <div className="flex justify-between items-baseline gap-2">
 <p className="text-body font-semibold text-text-primary">{t("unique_buyer_reviews")}</p>
 <span className="text-xs font-semibold tabular-nums text-text-muted">
 {gs.distinctReviewerCount}&nbsp;/&nbsp;{gs.distinctReviewerTarget}
 {gs.reviewersMet ? <CheckCircle2 className="inline w-3.5 h-3.5 text-text-secondary ml-1 align-text-bottom" /> : null}
 </span>
 </div>
 <Bar pct={revPct} done={gs.reviewersMet} />
 </div>

 <div className="rounded border border-border-light bg-secondary-light p-4">
 <div className="flex justify-between items-baseline gap-2">
 <p className="text-body font-semibold text-text-primary">{t("average_rating")}</p>
 <span className="text-xs font-semibold tabular-nums text-text-muted">
 {(avg ?? 0).toFixed(2)}
 {' / '}
 {minRating.toFixed(1)}
 {gs.ratingMet ? <CheckCircle2 className="inline w-3.5 h-3.5 text-text-secondary ml-1 align-text-bottom" /> : null}
 </span>
 </div>
 <Bar pct={ratingPct} done={gs.ratingMet} />
 </div>
 </div>
 </div>
 </PageContainer>;
};
const useUserProfile = userId => {
 const { data, isLoading, error } = useQuery({
 queryKey: ['users', 'profile', userId],
 queryFn: () => userService.getUserById(userId),
 enabled: !!userId
 });
 return {
 user: data?.id ? data : null,
 isLoading: !!userId && isLoading,
 error: error ? error.message || 'Unable to load this profile.' : null
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
 return <PageContainer className="space-y-4 py-8" aria-busy="true" aria-label={t("loading_profile")}>
 <Skeleton className="h-32 w-full" />
 <Skeleton className="h-64 w-full" />
 </PageContainer>;
 }

 // Error state
 if (userError || !user) {
 return <div className="min-h-screen bg-background-secondary flex items-center justify-center">
 <div className="text-center max-w-sm">
 <AlertCircle className="mx-auto mb-4 block h-5 w-5 shrink-0 text-status-error" strokeWidth={1.5} aria-hidden />
 <p className="text-lg font-semibold text-text-primary mb-1">{t("user_not_found")}</p>
 <p className="text-sm text-text-muted mb-6">{userError || 'The profile you\'re looking for doesn\'t exist.'}</p>
 <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4">{t("go_back")}</button>
 </div>
 </div>;
 }
 return <div className="min-h-screen bg-background-secondary">
 {/* ── Profile Header (full-width banner) ──────────── */}
 <UserProfileHeader user={user} isOwnProfile={isOwnProfile} reviewStats={reviewStats} greatSellerEligible={greatSeller?.eligible} />

 {isOwnProfile && greatSeller ? <GreatSellerProgressCard gs={greatSeller} /> : null}

 {/* ── Tab Bar ─────────────────────────────────────── */}
 <div className="sticky top-0 z-10 border-y border-border-light/80 bg-background-primary">
 <PageContainer>
 <div className="flex items-center gap-2 overflow-x-auto py-3">
 {TABS.map(tab => {
 const Icon = tab.icon;
 const isActive = activeTab === tab.key;
 let count = null;
 if (tab.key === 'listings' && pagination.totalElements > 0) count = pagination.totalElements;
 if (tab.key === 'lists' && favoriteLists.length > 0) count = favoriteLists.length;
 if (tab.key === 'reviews' && reviewStats?.totalReviews > 0) count = reviewStats.totalReviews;
 return <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`relative flex h-10 shrink-0 items-center gap-2 rounded px-4 text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-primary text-white' : 'bg-secondary-light text-text-secondary hover:bg-secondary-light hover:text-text-primary'}`}>
 <Icon className="w-4 h-4" />
 {tab.label}
 {count !== null && <span className={`inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-sm text-xs font-semibold tabular-nums ${isActive ? 'bg-background-primary/15 text-white' : 'bg-background-primary text-text-muted'}`}>
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
 <div className="mb-1 inline-flex items-center gap-2 text-xs font-semibold text-text-muted">
 <Grid3X3 className="h-3.5 w-3.5" />{t("marketplace")}</div>
 <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("listings")}</h2>
 <p className="text-sm text-text-muted mt-0.5">
 {isOwnProfile ? 'Your active listings' : 'All active listings by this user'}
 </p>
 </div>
 {!listingsLoading && pagination.totalElements > 0 && <div className="flex items-center gap-2 rounded border border-border-light bg-background-primary p-1.5">
 <select value={pagination.size} onChange={e => handlePageSizeChange(Number(e.target.value))} className="h-9 border border-border-light rounded px-3 text-sm font-semibold text-text-secondary bg-background-primary focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border-DEFAULT cursor-pointer">
 <option value={10}>10</option>
 <option value={15}>15</option>
 <option value={20}>20</option>
 </select>
 <span className="text-xs text-text-muted font-medium">{t("per_page")}</span>
 </div>}
 </div>

 {listingsLoading ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
 {[...Array(8)].map((_, i) => <div key={i} className="bg-background-primary border border-border-light rounded-md overflow-hidden animate-pulse">
 <div className="aspect-square bg-secondary-light" />
 <div className="p-3.5 space-y-2">
 <div className="h-4 bg-secondary-light rounded w-3/4" />
 <div className="h-3 bg-secondary-light rounded w-1/2" />
 </div>
 </div>)}
 </div> : listingsError ? <EmptyState icon={AlertCircle} title={t("failed_to_load_listings")} description="Please try again later" /> : listings.length === 0 ? <EmptyState icon={Package} title={t("no_listings_yet")} description={isOwnProfile ? "You haven't created any listings yet" : "This user hasn't created any listings yet"} primaryAction={isOwnProfile ? {
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
 <div className="mb-1 inline-flex items-center gap-2 text-xs font-semibold text-text-muted">
 <Sparkles className="h-3.5 w-3.5" />{t("curated")}</div>
 <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("lists")}</h2>
 <p className="text-sm text-text-muted mt-0.5">
 {isOwnProfile ? 'Your favorite lists' : 'Public favorite lists'}
 </p>
 </div>
 {isOwnProfile && <button onClick={() => setShowCreateListModal(true)} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4">
 <Plus className="w-4 h-4" />{t("new_list")}</button>}
 </div>

 {listsLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {[...Array(3)].map((_, i) => <div key={i} className="bg-background-primary border border-border-light rounded-md overflow-hidden animate-pulse">
 <div className="aspect-4/3 bg-secondary-light" />
 <div className="p-4 space-y-2">
 <div className="h-4 bg-secondary-light rounded w-3/4" />
 <div className="h-3 bg-secondary-light rounded w-1/2" />
 </div>
 </div>)}
 </div> : favoriteLists.length === 0 ? <EmptyState icon={Heart} title={t("no_lists_yet")} description={isOwnProfile ? "You haven't created any lists yet" : "This user hasn't shared any public lists yet"} primaryAction={isOwnProfile ? {
 label: 'Create List',
 onClick: () => setShowCreateListModal(true)
 } : null} /> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {favoriteLists.map(list => <FavoriteListCard key={list.id} list={list} />)}
 {isOwnProfile && <button onClick={() => setShowCreateListModal(true)} className="aspect-4/3 bg-background-primary border-2 border-dashed border-border-light rounded-md flex flex-col items-center justify-center hover:border-border-DEFAULT hover:bg-secondary-light transition-all duration-200 group">
 <Plus className="mb-3 h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
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

export default UserProfilePage;