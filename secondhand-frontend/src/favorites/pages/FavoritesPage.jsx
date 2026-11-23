import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from 'react-i18next';
import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, List, Plus, RefreshCw } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites.js';
import { useMyFavoriteLists, FavoriteListModal, FavoriteListCard } from '../../favoritelist/index.js';
import ListingGrid from '../../listing/components/ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import { Button, Card, EmptyState, ErrorState, SkeletonGrid, Tabs } from '../../common/components/ui/index.js';
import { formatDate } from '../../common/formatters.js';
import { FAVORITE_DEFAULTS, FAVORITES_PAGE_TABS } from '../favoriteConstants.js';
import { ROUTES } from '../../common/constants/routes.js';
import { getListingFavoriteCount } from '../favorites.js';

const FavoritesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(FAVORITES_PAGE_TABS.FAVORITES);
  const [showCreateListModal, setShowCreateListModal] = useState(false);

  const {
    favorites = [],
    isLoading = false,
    error = null,
    pagination = {
      number: FAVORITE_DEFAULTS.PAGE,
      size: FAVORITE_DEFAULTS.PAGE_SIZE,
      totalPages: 0,
      totalElements: 0
    },
    fetchFavorites,
    loadPage
  } = useFavorites();

  const {
    data: myLists = [],
    isLoading: listsLoading,
    error: listsError,
    refetch: refetchLists
  } = useMyFavoriteLists();

  const handlePageChange = useCallback((nextPage) => {
    loadPage(nextPage);
  }, [loadPage]);

  const favoritedListings = useMemo(() => {
    return favorites
      .map((fav) => {
        const listing = fav?.listing;
        if (!listing) return null;
        const favoriteCount = getListingFavoriteCount(listing);
        return {
          ...listing,
          createdAt: formatDate(fav.createdAt),
          favoriteStats: {
            ...listing.favoriteStats,
            favoriteCount,
            isFavorited: true,
            favorited: true
          },
          reviewStats: listing.reviewStats ?? {
            totalReviews: 0,
            averageRating: listing?.averageRating ?? 0
          }
        };
      })
      .filter(Boolean);
  }, [favorites]);

  const handleRefresh = useCallback(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <div className="min-h-screen bg-background-page">
      <PageContainer className="py-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              {t('favorites', 'Favoriler')}
            </h1>

            <Tabs
              variant="segmented"
              ariaLabel={t('favorites', 'Favoriler')}
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                { key: FAVORITES_PAGE_TABS.FAVORITES, label: t('saved', 'Kaydedilenler'), icon: Heart, count: pagination.totalElements },
                { key: FAVORITES_PAGE_TABS.LISTS, label: t('lists', 'Listeler'), icon: List, count: myLists.length },
              ]}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {activeTab === FAVORITES_PAGE_TABS.LISTS ? (
              <Button size="sm" onClick={() => setShowCreateListModal(true)}>
                <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                <span>{t('new_list', 'Yeni liste')}</span>
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? 'animate-spin motion-reduce:animate-none' : ''}`}
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span>{t('refresh', 'Yenile')}</span>
              </Button>
            )}
          </div>
        </div>

        {activeTab === FAVORITES_PAGE_TABS.FAVORITES && (
          isLoading ? (
            <ListingGrid listings={[]} isLoading error={null} />
          ) : error ? (
            <ErrorState
              title={t('favorites_load_failed', 'Favoriler yüklenemedi')}
              description={String(error)}
              onRetry={handleRefresh}
            />
          ) : favoritedListings.length === 0 ? (
            <EmptyState
              icon={Heart}
              titleAs="h2"
              title={t('no_saved_listings_yet', 'Henüz kayıtlı ilan yok')}
              description={t('tap_the_heart_on_a_listing_to_save_it_he', 'Beğendiğiniz ilanlardaki kalp simgesine dokunarak buraya kaydedebilirsiniz.')}
              primaryAction={{
                label: t('browse_listings', 'İlanlara Gözat'),
                onClick: () => navigate(ROUTES.LISTINGS)
              }}
              className="shadow-sm"
            />
          ) : (
            <>
              <ListingGrid listings={favoritedListings} isLoading={false} error={null} />
              {pagination.totalPages > 1 && (
                <Card padding="none" className="mt-6 overflow-hidden">
                  <Pagination
                    page={pagination.number}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </Card>
              )}
            </>
          )
        )}

        {activeTab === FAVORITES_PAGE_TABS.LISTS && (
          listsLoading ? (
            <SkeletonGrid count={4} columns="grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
          ) : listsError ? (
            <ErrorState
              title={t('lists_load_failed', 'Listeler yüklenemedi')}
              onRetry={refetchLists}
            />
          ) : myLists.length === 0 ? (
            <EmptyState
              icon={List}
              titleAs="h2"
              title={t('no_lists_yet', 'Henüz listeniz yok')}
              description={t('create_a_list_to_group_favorites_by_them', 'Favori ilanlarınızı temalara göre gruplamak için liste oluşturun.')}
              primaryAction={{
                label: t('create_your_first_list', 'İlk listeni oluştur'),
                onClick: () => setShowCreateListModal(true)
              }}
              className="shadow-sm"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myLists.map((list) => (
                <FavoriteListCard key={list.id} list={list} />
              ))}
            </div>
          )
        )}

        <FavoriteListModal
          isOpen={showCreateListModal}
          onClose={() => setShowCreateListModal(false)}
          onSuccess={() => {
            refetchLists();
            setShowCreateListModal(false);
          }}
        />
      </PageContainer>
    </div>
  );
};

export default FavoritesPage;