import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Heart, Package, Plus } from 'lucide-react';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { useUserListings } from '../hooks/useUserListings.js';
import { usePagedUserReceivedReviews, useUserReviewStats } from '../../reviews/index.js';
import { useUserFavoriteLists, FavoriteListCard, FavoriteListModal } from '../../favoritelist/index.js';
import ListingCard from '../../listing/components/ListingCard.jsx';
import UserProfileHeader, { UserProfileHeaderSkeleton } from '../components/UserProfileHeader.jsx';
import UserReviews from '../components/UserReviews.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import Button, { buttonClasses } from '../../common/components/ui/Button.jsx';
import Skeleton, { SkeletonGrid } from '../../common/components/ui/Skeleton.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { useGreatSellerStatus } from '../hooks/useGreatSellerStatus.js';

// 12 fills the 2, 3 and 4 column grids without a ragged last row.
const LISTINGS_PAGE_SIZE = 12;
const LISTING_GRID = 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4';
const LIST_SKELETON_KEYS = ['a', 'b', 'c'];

const TABS = [
 { key: 'listings', labelKey: 'listings', defaultLabel: 'İlanlar' },
 { key: 'reviews', labelKey: 'reviews', defaultLabel: 'Değerlendirmeler' },
 { key: 'lists', labelKey: 'lists', defaultLabel: 'Listeler' }
];

const useUserProfile = (userId) => {
 const { data, isLoading, error } = useQuery({
 queryKey: ['users', 'profile', userId],
 queryFn: () => userService.getUserById(userId),
 enabled: !!userId
 });
 return {
 user: data?.id ? data : null,
 isLoading: !!userId && isLoading,
 error: error ? error.response?.data?.message || error.message || null : null
 };
};

const ProfileTabs = ({ activeTab, onChange, counts }) => {
 const { t } = useTranslation();
 return (
 <div className="mb-5 flex overflow-x-auto border-b border-border-light" role="tablist" aria-label={t('profile_sections', 'Profil bölümleri')}>
 {TABS.map(tab => {
 const active = activeTab === tab.key;
 const count = counts[tab.key];
 return (
 <button
 key={tab.key}
 type="button"
 role="tab"
 aria-selected={active}
 onClick={() => onChange(tab.key)}
 className={`-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors duration-150 ${
 active ? 'border-primary font-medium text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
 }`}
 >
 {t(tab.labelKey, tab.defaultLabel)}
 {count > 0 && (
 <span className="rounded-sm bg-background-tertiary px-1.5 text-xs font-medium tabular-nums text-text-secondary">{count}</span>
 )}
 </button>
 );
 })}
 </div>
 );
};

const UserProfilePage = () => {
 const { t } = useTranslation();
 const { userId } = useParams();
 const navigate = useNavigate();
 const { user: currentUser } = useAuthState();
 const [activeTab, setActiveTab] = useState('listings');
 const [showCreateListModal, setShowCreateListModal] = useState(false);
 const isOwnProfile = Boolean(currentUser && String(currentUser.id) === String(userId));

 const { user, isLoading: userLoading, error: userError } = useUserProfile(userId);

 // Listing and list counts are shown on the tabs and in the header, so these load up front.
 const {
 listings,
 isLoading: listingsLoading,
 error: listingsError,
 pagination,
 loadPage,
 refetch: refetchListings
 } = useUserListings(userId, { page: 0, size: LISTINGS_PAGE_SIZE });

 const {
 reviews: receivedReviews,
 loading: receivedReviewsLoading,
 isFetching: receivedReviewsFetching,
 error: receivedReviewsError,
 pagination: reviewsPagination,
 loadPage: loadReviewsPage,
 handlePageSizeChange: handleReviewsPageSizeChange
 } = usePagedUserReceivedReviews(userId, { enabled: activeTab === 'reviews', size: 10 });

 const { stats: reviewStats } = useUserReviewStats(userId, { enabled: Boolean(userId) });
 const { data: greatSeller } = useGreatSellerStatus(userId, { enabled: Boolean(userId) });
 const {
 data: favoriteLists = [],
 isLoading: listsLoading,
 refetch: refetchLists
 } = useUserFavoriteLists(userId, isOwnProfile, { enabled: Boolean(userId) });

 if (userLoading) {
 return (
 <div className="min-h-screen bg-background-secondary">
 <PageContainer className="space-y-6 py-6 sm:py-8" aria-busy="true" aria-label={t("loading_profile", "Profil yükleniyor")}>
 <UserProfileHeaderSkeleton />
 <Skeleton className="h-11 w-full" />
 <SkeletonGrid count={LISTINGS_PAGE_SIZE} columns={LISTING_GRID} />
 </PageContainer>
 </div>
 );
 }

 if (userError || !user) {
 return (
 <div className="flex min-h-screen items-center justify-center bg-background-secondary p-4">
 <div className="w-full max-w-sm rounded border border-border bg-background-primary p-6 text-center">
 <AlertCircle className="mx-auto mb-3 h-5 w-5 text-status-error" strokeWidth={1.5} aria-hidden />
 <h1 className="mb-1 text-lg font-semibold text-text-primary">
 {t("user_not_found", "Kullanıcı bulunamadı")}
 </h1>
 <p className="mb-5 text-sm text-text-secondary">
 {userError || t("profile_not_exist", "Görüntülemek istediğin profil bulunamadı veya silinmiş olabilir.")}
 </p>
 <Link to={ROUTES.LISTINGS} className={`${buttonClasses()} w-full`}>
 {t("back_to_listings", "İlanlara dön")}
 </Link>
 </div>
 </div>
 );
 }

 const activeListingCount = listingsLoading ? null : pagination.totalElements;
 const tabCounts = {
 listings: activeListingCount ?? 0,
 reviews: Number(reviewStats?.totalReviews ?? 0),
 lists: favoriteLists.length
 };

 return (
 <div className="min-h-screen bg-background-secondary pb-16">
 <PageContainer className="py-6 sm:py-8">
 <UserProfileHeader
 user={user}
 isOwnProfile={isOwnProfile}
 reviewStats={reviewStats}
 greatSeller={greatSeller}
 activeListingCount={activeListingCount}
 />

 <div className="mt-8">
 <ProfileTabs activeTab={activeTab} onChange={setActiveTab} counts={tabCounts} />

 {activeTab === 'listings' && (
 listingsLoading ? (
 <SkeletonGrid count={LISTINGS_PAGE_SIZE} columns={LISTING_GRID} />
 ) : listingsError ? (
 <Alert
 type="error"
 message={t("failed_to_load_listings", "İlanlar yüklenemedi.")}
 action={<Button variant="secondary" size="sm" onClick={() => refetchListings()}>{t("try_again", "Tekrar dene")}</Button>}
 />
 ) : listings.length === 0 ? (
 <EmptyState
 icon={Package}
 title={t("no_active_listings", "Yayında ilan yok")}
 description={isOwnProfile
 ? t("own_no_active_listings", "Yayındaki ilanların burada görünür.")
 : t("user_no_listings_yet", "Bu kullanıcının şu an yayında ilanı yok.")}
 primaryAction={isOwnProfile ? { label: t("create_listing", "İlan oluştur"), onClick: () => navigate(ROUTES.CREATE_LISTING) } : null}
 />
 ) : (
 <>
 <div className={LISTING_GRID}>
 {listings.map((listing, index) => (
 <ListingCard
 key={listing.id}
 listing={listing}
 showActions={isOwnProfile}
 isOwner={isOwnProfile}
 currentUserId={currentUser?.id}
 priorityImage={index === 0}
 onDeleted={() => refetchListings()}
 />
 ))}
 </div>
 {pagination.totalPages > 1 && (
 <div className="mt-6">
 <Pagination page={pagination.number} totalPages={pagination.totalPages} onPageChange={loadPage} />
 </div>
 )}
 </>
 )
 )}

 {activeTab === 'reviews' && (
 <UserReviews
 profileUserId={user.id ?? userId}
 receivedReviews={receivedReviews}
 receivedReviewsLoading={receivedReviewsLoading}
 receivedReviewsFetching={receivedReviewsFetching}
 receivedReviewsError={receivedReviewsError}
 pagination={reviewsPagination}
 loadPage={loadReviewsPage}
 handlePageSizeChange={handleReviewsPageSizeChange}
 reviewStats={reviewStats}
 isOwnProfile={isOwnProfile}
 />
 )}

 {activeTab === 'lists' && (
 <>
 {isOwnProfile && favoriteLists.length > 0 && (
 <div className="mb-4 flex justify-end">
 <Button variant="secondary" size="sm" onClick={() => setShowCreateListModal(true)}>
 <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 <span>{t("new_list", "Yeni liste")}</span>
 </Button>
 </div>
 )}
 {listsLoading ? (
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {LIST_SKELETON_KEYS.map(k => (
 <div key={k} className="space-y-3 rounded border border-border bg-background-primary p-4">
 <Skeleton className="aspect-4/3 w-full" />
 <Skeleton className="h-4 w-3/4" />
 <Skeleton className="h-4 w-1/2" />
 </div>
 ))}
 </div>
 ) : favoriteLists.length === 0 ? (
 <EmptyState
 icon={Heart}
 title={t("no_lists_yet", "Henüz liste yok")}
 description={isOwnProfile
 ? t("no_lists_created_yet", "Beğendiğin ilanları listelerde toplayabilirsin.")
 : t("user_no_lists_yet", "Bu kullanıcının herkese açık bir listesi yok.")}
 primaryAction={isOwnProfile ? { label: t("create_list", "Liste oluştur"), onClick: () => setShowCreateListModal(true) } : null}
 />
 ) : (
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {favoriteLists.map(list => <FavoriteListCard key={list.id} list={list} />)}
 </div>
 )}
 </>
 )}
 </div>
 </PageContainer>

 {isOwnProfile && (
 <FavoriteListModal
 isOpen={showCreateListModal}
 onClose={() => setShowCreateListModal(false)}
 onSuccess={() => {
 refetchLists();
 setShowCreateListModal(false);
 }}
 />
 )}
 </div>
 );
};

export default UserProfilePage;
