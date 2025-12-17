import React, { useMemo, useCallback } from 'react';
import { useFavorites } from './hooks/useFavorites.js';
import ListingGrid from '../listing/components/ListingGrid.jsx';
import Pagination from '../common/components/ui/Pagination.jsx';
import { formatDate } from '../common/formatters.js';

const FavoritesPage = () => {
    const {
        favorites = [],
        isLoading = false,
        error = null,
        pagination = { number: 0, size: 20, totalPages: 0, totalElements: 0 },
        fetchFavorites,
        loadPage
    } = useFavorites();

    const handlePageChange = useCallback((page) => {
        loadPage(page);
    }, [loadPage]);

    const favoritedListings = useMemo(() => {
        return favorites.map(fav => {
            const listing = fav?.listing;
            if (!listing) return null;

            return {
                ...listing,
                createdAt: formatDate(fav.createdAt),
                favoriteStats: listing.favoriteStats
            };
        }).filter(Boolean);
    }, [favorites]);

    const handleRefresh = useCallback(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Favorites</h1>
                    <p className="text-slate-600 mt-2">
                        {pagination.totalElements} Favorites found
                    </p>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                    <svg
                        className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            <div className="mb-8">
                <ListingGrid
                    listings={favoritedListings}
                    isLoading={isLoading}
                    error={null}
                />
            </div>

            {!isLoading && pagination.totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <Pagination
                        currentPage={pagination.number}
                        totalPages={pagination.totalPages}
                        totalElements={pagination.totalElements}
                        onPageChange={handlePageChange}
                        itemsPerPage={pagination.size}
                    />
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
