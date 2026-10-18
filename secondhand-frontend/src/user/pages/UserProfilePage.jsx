import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Heart, Package, Plus, Star } from 'lucide-react';
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
import Button from '../../common/components/ui/Button.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { useGreatSellerStatus } from '../hooks/useGreatSellerStatus.js';
import Skeleton, { SkeletonGrid } from '../../common/components/ui/Skeleton.jsx';

const TABS = [
  { key: 'listings', labelKey: 'listings', defaultLabel: 'İlanlar', icon: Package },
  { key: 'lists', labelKey: 'lists', defaultLabel: 'Listeler', icon: Heart },
  { key: 'reviews', labelKey: 'reviews', defaultLabel: 'Değerlendirmeler', icon: Star }
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
    error: error ? error.message || null : null
  };
};

const UserProfilePage = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthState();
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

  const { stats: reviewStats } = useUserReviewStats(userId, {
    enabled: true
  });

  const isOwnProfile = currentUser && String(currentUser.id) === String(userId);

  const { data: greatSeller } = useGreatSellerStatus(userId, {
    enabled: Boolean(userId)
  });

  const {
    data: favoriteLists = [],
    isLoading: listsLoading,
    refetch: refetchLists
  } = useUserFavoriteLists(userId, isOwnProfile, {
    enabled: activeTab === 'lists'
  });

  const handlePageChange = (page) => loadPage(page);

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-background-secondary">
        <PageContainer className="py-8 space-y-6" aria-busy="true" aria-label={t("loading_profile", "Profil yükleniyor")}>
          <div className="rounded border border-border bg-background-primary p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-4 w-64 rounded" />
              </div>
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded" />
          <SkeletonGrid count={8} columns="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" />
        </PageContainer>
      </div>
    );
  }

  // Error state
  if (userError || !user) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded border border-border bg-background-primary p-6 text-center shadow-xs">
          <AlertCircle className="mx-auto mb-3 h-6 w-6 text-status-error" strokeWidth={1.5} aria-hidden />
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            {t("user_not_found", "Kullanıcı Bulunamadı")}
          </h2>
          <p className="text-xs text-text-muted mb-5 leading-relaxed">
            {userError || t("profile_not_exist", "Görüntülemek istediğiniz profil bulunamadı veya silinmiş olabilir.")}
          </p>
          <Button variant="primary" onClick={() => navigate(-1)} className="w-full">
            {t("go_back", "Geri Dön")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* ── Profile Header (integrated with PageContainer) ──────────── */}
      <UserProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        reviewStats={reviewStats}
        greatSeller={greatSeller}
        greatSellerEligible={greatSeller?.eligible}
      />

      {/* ── Tab Bar (clean segmented navigation) ────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-border bg-background-primary/95 backdrop-blur-xs">
        <PageContainer>
          <nav className="flex items-center gap-1.5 overflow-x-auto py-2.5 [scrollbar-width:none]">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              let count = null;
              if (tab.key === 'listings' && pagination.totalElements > 0) count = pagination.totalElements;
              if (tab.key === 'lists' && favoriteLists.length > 0) count = favoriteLists.length;
              if (tab.key === 'reviews' && reviewStats?.totalReviews > 0) count = reviewStats.totalReviews;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded text-sm font-medium transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-background-secondary text-text-primary font-semibold border border-border'
                      : 'text-text-muted hover:text-text-primary hover:bg-background-secondary/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span>{t(tab.labelKey, tab.defaultLabel)}</span>
                  {count !== null && (
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-sm text-xs tabular-nums ${
                        isActive
                          ? 'bg-background-primary text-text-secondary border border-border'
                          : 'bg-background-secondary text-text-muted'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </PageContainer>
      </div>

      {/* ── Tab Content ─────────────────────────────────── */}
      <PageContainer className="py-6 sm:py-8">
        <div key={activeTab} className="min-w-0">
          {/* ── Listings Tab ─────────────────────────── */}
          {activeTab === 'listings' && (
            <div>
              {/* Header and Controls */}
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
                    {t("listings", "İlanlar")}
                    {!listingsLoading && pagination.totalElements > 0 && (
                      <span className="ml-2 text-xs font-normal text-text-muted tabular-nums">
                        ({pagination.totalElements})
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    {isOwnProfile
                      ? t("your_active_listings", "Satışta olan aktif ilanlarınız")
                      : t("all_active_listings_by_user", "Kullanıcının satışta olan tüm ilanları")}
                  </p>
                </div>

                {!listingsLoading && pagination.totalElements > 0 && (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <label className="flex items-center gap-2 text-xs text-text-muted">
                      <span>{t("per_page", "Sayfa başı:")}</span>
                      <select
                        value={pagination.size}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        aria-label={t("per_page", "Sayfa başı ilan sayısı")}
                        className="h-8 rounded border border-border bg-background-primary px-2.5 text-xs font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                      </select>
                    </label>
                  </div>
                )}
              </div>

              {listingsLoading ? (
                <SkeletonGrid count={8} columns="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" />
              ) : listingsError ? (
                <EmptyState
                  icon={AlertCircle}
                  title={t("failed_to_load_listings", "İlanlar yüklenemedi")}
                  description={t("please_try_again_later", "Lütfen daha sonra tekrar deneyin.")}
                />
              ) : listings.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title={t("no_listings_yet", "Henüz ilan bulunmuyor")}
                  description={
                    isOwnProfile
                      ? t("no_listings_created_yet", "Henüz bir ilan oluşturmadınız.")
                      : t("user_no_listings_yet", "Bu kullanıcının henüz aktif bir ilanı bulunmuyor.")
                  }
                  primaryAction={
                    isOwnProfile
                      ? {
                          label: t("create_listing", "İlan Oluştur"),
                          onClick: () => navigate(ROUTES.CREATE_LISTING)
                        }
                      : null
                  }
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {listings.map((listing, index) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        showActions={false}
                        isOwner={currentUser?.id === listing.sellerId}
                        currentUserId={currentUser?.id}
                        priorityImage={index === 0}
                      />
                    ))}
                  </div>
                  {!listingsLoading && pagination.totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        page={pagination.number}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Lists Tab ────────────────────────────── */}
          {activeTab === 'lists' && (
            <div>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
                    {t("lists", "Listeler")}
                    {favoriteLists.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-text-muted tabular-nums">
                        ({favoriteLists.length})
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    {isOwnProfile
                      ? t("your_favorite_lists", "Oluşturduğunuz favori listeleriniz")
                      : t("public_favorite_lists", "Kullanıcının paylaştığı herkese açık listeler")}
                  </p>
                </div>

                {isOwnProfile && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCreateListModal(true)}
                    className="self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                    <span>{t("new_list", "Yeni Liste")}</span>
                  </Button>
                )}
              </div>

              {listsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded border border-border bg-background-primary p-4 space-y-3 animate-pulse">
                      <div className="aspect-4/3 rounded bg-background-secondary" />
                      <div className="h-4 bg-background-secondary rounded w-3/4" />
                      <div className="h-3 bg-background-secondary rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : favoriteLists.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title={t("no_lists_yet", "Henüz liste bulunmuyor")}
                  description={
                    isOwnProfile
                      ? t("no_lists_created_yet", "Henüz bir favori listesi oluşturmadınız.")
                      : t("user_no_lists_yet", "Bu kullanıcının herkese açık bir listesi bulunmuyor.")
                  }
                  primaryAction={
                    isOwnProfile
                      ? {
                          label: t("create_list", "Liste Oluştur"),
                          onClick: () => setShowCreateListModal(true)
                        }
                      : null
                  }
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteLists.map((list) => (
                    <FavoriteListCard key={list.id} list={list} />
                  ))}
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowCreateListModal(true)}
                      className="aspect-4/3 rounded border-2 border-dashed border-border hover:border-text-secondary bg-background-primary hover:bg-background-secondary flex flex-col items-center justify-center transition-colors group cursor-pointer"
                    >
                      <Plus className="mb-2 h-5 w-5 text-text-muted group-hover:text-text-primary transition-colors" strokeWidth={1.5} />
                      <span className="text-xs font-semibold text-text-muted group-hover:text-text-primary transition-colors">
                        {t("new_list", "Yeni Liste")}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Reviews Tab ──────────────────────────── */}
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
        </div>
      </PageContainer>

      <FavoriteListModal
        isOpen={showCreateListModal}
        onClose={() => setShowCreateListModal(false)}
        onSuccess={() => {
          refetchLists();
          setShowCreateListModal(false);
        }}
      />
    </div>
  );
};

export default UserProfilePage;