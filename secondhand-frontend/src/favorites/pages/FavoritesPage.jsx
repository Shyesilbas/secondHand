import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useMemo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, List, Plus, RefreshCw } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites.js';
import { useMyFavoriteLists, FavoriteListModal, FavoriteListCard } from '../../favoritelist/index.js';
import ListingGrid from '../../listing/components/ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import { SkeletonGrid, EmptyState } from '../../common/components/ui/index.js';
import { formatDate } from '../../common/formatters.js';
import { FAVORITE_DEFAULTS, FAVORITES_PAGE_TABS } from '../favoriteConstants.js';
import { ROUTES } from '../../common/constants/routes.js';
const FavoritesPage = () => {
  const {
    t
  } = useTranslation();
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
    refetch: refetchLists
  } = useMyFavoriteLists();
  const handlePageChange = useCallback(nextPage => {
    loadPage(nextPage);
  }, [loadPage]);
  const favoritedListings = useMemo(() => {
    return favorites.map(fav => {
      const listing = fav?.listing;
      if (!listing) return null;
      const favoriteCount = listing?.favoriteCount ?? listing?.favoriteStats?.favoriteCount ?? 0;
      const isFavorited = true;
      return {
        ...listing,
        createdAt: formatDate(fav.createdAt),
        favoriteStats: {
          ...listing.favoriteStats,
          favoriteCount,
          isFavorited,
          favorited: isFavorited
        },
        reviewStats: listing.reviewStats ?? {
          totalReviews: 0,
          averageRating: listing?.averageRating ?? 0
        }
      };
    }).filter(Boolean);
  }, [favorites]);
  const handleRefresh = useCallback(() => {
    fetchFavorites();
  }, [fetchFavorites]);
  return <div className="min-h-screen bg-slate-50/90">
      <PageContainer className="py-6 sm:py-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/5">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0 border-l-[3px] border-teal-700 pl-3">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("favorites")}</h1>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{t("saved_listings_and_your_curated_lists_in")}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1">
              <button type="button" onClick={() => setActiveTab(FAVORITES_PAGE_TABS.FAVORITES)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition sm:px-4 ${activeTab === FAVORITES_PAGE_TABS.FAVORITES ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                <Heart className="h-4 w-4 opacity-70" />{t("saved")}<span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-bold text-slate-600">
                  {pagination.totalElements}
                </span>
              </button>
              <button type="button" onClick={() => setActiveTab(FAVORITES_PAGE_TABS.LISTS)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition sm:px-4 ${activeTab === FAVORITES_PAGE_TABS.LISTS ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                <List className="h-4 w-4 opacity-70" />{t("lists")}<span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-bold text-slate-600">
                  {myLists.length}
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeTab === FAVORITES_PAGE_TABS.LISTS && <button type="button" onClick={() => setShowCreateListModal(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-800 sm:text-sm">
                  <Plus className="h-4 w-4" />{t("new_list")}</button>}
              {activeTab === FAVORITES_PAGE_TABS.FAVORITES && <button type="button" onClick={handleRefresh} disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:text-sm">
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />{t("refresh")}</button>}
            </div>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === FAVORITES_PAGE_TABS.FAVORITES && <>
              {isLoading ? <ListingGrid listings={[]} isLoading error={null} /> : error ? <ListingGrid listings={[]} isLoading={false} error={String(error)} /> : favoritedListings.length === 0 ? <EmptyState
                  icon={Heart}
                  title={t("no_saved_listings_yet")}
                  description={t("tap_the_heart_on_a_listing_to_save_it_he")}
                >
                  <Link to={ROUTES.LISTINGS} className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">{t("browse_listings")}</Link>
                </EmptyState> : <>
                  <div className="mb-6">
                    <ListingGrid listings={favoritedListings} isLoading={false} error={null} />
                  </div>
                  {pagination.totalPages > 1 ? <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <Pagination page={pagination.number} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                    </div> : null}
                </>}
            </>}

          {activeTab === FAVORITES_PAGE_TABS.LISTS && <div>
              {listsLoading ? <SkeletonGrid count={4} columns="grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" /> : myLists.length === 0 ? <EmptyState
                  icon={List}
                  title={t("no_lists_yet")}
                  description={t("create_a_list_to_group_favorites_by_them")}
                >
                  <button type="button" onClick={() => setShowCreateListModal(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800">
                    <Plus className="h-5 w-5" />{t("create_your_first_list")}</button>
                </EmptyState> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {myLists.map(list => <FavoriteListCard key={list.id} list={list} />)}
                </div>}
            </div>}
        </div>

        <FavoriteListModal isOpen={showCreateListModal} onClose={() => setShowCreateListModal(false)} onSuccess={() => {
        refetchLists();
        setShowCreateListModal(false);
      }} />
      </PageContainer>
    </div>;
};
export default FavoritesPage;