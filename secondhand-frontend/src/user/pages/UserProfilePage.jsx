import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Ban, Heart, Package, Plus } from 'lucide-react';
import { getErrorMessage } from '../../common/utils/errorUtils.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { useUserListings } from '../hooks/useUserListings.js';
import { usePagedUserReceivedReviews, useUserReviewStats } from '../../reviews/index.js';
import { useUserFavoriteLists, FavoriteListCard, FavoriteListModal } from '../../favoritelist/index.js';
import ListingCard from '../../listing/components/ListingCard.jsx';
import { LISTING_GRID_COLUMNS, LISTING_GRID_GAP } from '../../listing/components/listingGridLayout.js';
import UserProfileHeader, { UserProfileHeaderSkeleton } from '../components/UserProfileHeader.jsx';
import UserReviews from '../components/UserReviews.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import ErrorState from '../../common/components/ui/ErrorState.jsx';
import Button, { buttonClasses } from '../../common/components/ui/Button.jsx';
import Skeleton, { SkeletonGrid } from '../../common/components/ui/Skeleton.jsx';
import Tabs from '../../common/components/ui/Tabs.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { useBlockStatus, useBlockUser, useUnblockUser } from '../hooks/useBlocking.js';
import { useGreatSellerStatus } from '../hooks/useGreatSellerStatus.js';

// 12 fills the 2, 3 and 4 column grids without a ragged last row.
const LISTINGS_PAGE_SIZE = 12;
const LISTING_GRID = `grid ${LISTING_GRID_COLUMNS} ${LISTING_GRID_GAP}`;
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
 error: error ? getErrorMessage(error, null) : null
 };
};

const ProfileTabs = ({ activeTab, onChange, counts }) => {
 const { t } = useTranslation();
 return (
 <Tabs
  className="mb-6"
  activeKey={activeTab}
  onChange={onChange}
  ariaLabel={t('profile_sections', 'Profil bölümleri')}
  items={TABS.map(tab => ({
   key: tab.key,
   label: t(tab.labelKey, tab.defaultLabel),
   count: counts[tab.key],
   hideZeroCount: true,
  }))}
 />
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

 const { data: blockStatus, isLoading: blockLoading } = useBlockStatus(userId, { enabled: !isOwnProfile });
 const blockUser = useBlockUser();
 const unblockUser = useUnblockUser();
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

 if (userLoading || (!isOwnProfile && blockLoading)) {
 return (
 <div className="bg-background-page">
 <PageContainer className="space-y-6 py-8" aria-busy="true" aria-label={t("loading_profile", "Profil yükleniyor")}>
 <UserProfileHeaderSkeleton />
 <Skeleton className="h-11 w-full" />
 <SkeletonGrid count={LISTINGS_PAGE_SIZE} columns={LISTING_GRID_COLUMNS} gap={LISTING_GRID_GAP} />
 </PageContainer>
 </div>
 );
 }

 if (!isOwnProfile && blockStatus?.blockedMe) {
 return (
 <div className="bg-background-page">
 <PageContainer className="py-10">
 <div className="mx-auto max-w-md rounded border border-border-light bg-background-primary p-6 text-center shadow-sm">
 <Ban className="mx-auto h-8 w-8 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <p className="mt-3 text-base font-medium text-text-primary">
 {t('user_blocked_you', 'Bu kullanıcı sizi engelledi.')}
 </p>
 <div className="mt-4">
 {blockStatus.blockedByMe ? (
 <Button variant="secondary" disabled={unblockUser.isPending} onClick={() => unblockUser.mutate(userId)}>{t('unblock', 'Engeli Kaldır')}</Button>
 ) : (
 <Button variant="secondary" disabled={blockUser.isPending} onClick={() => blockUser.mutate(userId)}>{t('block_this_user', 'Bu Kullanıcıyı Engelle')}</Button>
 )}
 </div>
 </div>
 </PageContainer>
 </div>
 );
 }

 if (userError || !user) {
 return (
 <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background-page p-4">
 <ErrorState
 title={t("user_not_found", "Kullanıcı bulunamadı")}
 description={userError || t("profile_not_exist", "Görüntülemek istediğin profil bulunamadı veya silinmiş olabilir.")}
 className="w-full max-w-md"
 />
 <Link to={ROUTES.LISTINGS} className={buttonClasses('secondary', 'sm')}>
 {t("back_to_listings", "İlanlara dön")}
 </Link>
 </div>
 );
 }

 const isBlocked = !isOwnProfile && Boolean(blockStatus?.eitherBlocked);
 const blockedMe = Boolean(blockStatus?.blockedMe);
 const blockedByMe = Boolean(blockStatus?.blockedByMe);
 const activeListingCount = listingsLoading ? null : pagination.totalElements;
 const tabCounts = {
 listings: activeListingCount ?? 0,
 reviews: Number(reviewStats?.totalReviews ?? 0),
 lists: favoriteLists.length
 };

 return (
 <div className="bg-background-page pb-16">
 <PageContainer className="py-6 sm:py-8">
 <UserProfileHeader
 user={user}
 isOwnProfile={isOwnProfile}
 reviewStats={reviewStats}
 greatSeller={greatSeller}
 activeListingCount={activeListingCount}
 />

 <div className="mt-8">
 {isBlocked ? (
 <div className="rounded border border-border-light bg-background-primary p-8 text-center shadow-sm">
 <Ban className="mx-auto h-8 w-8 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <p className="mt-3 text-base font-medium text-text-primary">
 {blockedMe ? t('user_blocked_you', 'Bu kullanıcı sizi engelledi.') : t('you_blocked_user', 'Bu kullanıcıyı engellediniz.')}
 </p>
 <div className="mt-4">
 {blockedByMe ? (
 <Button variant="secondary" disabled={unblockUser.isPending} onClick={() => unblockUser.mutate(userId)}>{t('unblock', 'Engeli Kaldır')}</Button>
 ) : (
 <Button variant="secondary" disabled={blockUser.isPending} onClick={() => blockUser.mutate(userId)}>{t('block_this_user', 'Bu Kullanıcıyı Engelle')}</Button>
 )}
 </div>
 </div>
 ) : (
 <>
 <ProfileTabs activeTab={activeTab} onChange={setActiveTab} counts={tabCounts} />

 {activeTab === 'listings' && (
 listingsLoading ? (
 <SkeletonGrid count={LISTINGS_PAGE_SIZE} columns={LISTING_GRID_COLUMNS} gap={LISTING_GRID_GAP} />
 ) : listingsError ? (
 <ErrorState title={t("failed_to_load_listings", "İlanlar yüklenemedi")} onRetry={refetchListings} />
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
 <div key={k} className="space-y-3 rounded border border-border-light bg-background-primary p-4 shadow-sm">
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
