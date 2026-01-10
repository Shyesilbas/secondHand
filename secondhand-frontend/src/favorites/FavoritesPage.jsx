import React, { useMemo, useCallback, useState } from 'react';
import { Plus, List, RefreshCw } from 'lucide-react';
import { useFavorites } from './hooks/useFavorites.js';
import { useMyFavoriteLists, FavoriteListModal, FavoriteListCard } from '../favoritelist/index.js';
import ListingGrid from '../listing/components/ListingGrid.jsx';
import Pagination from '../common/components/ui/Pagination.jsx';
import { formatDate } from '../common/formatters.js';

const FavoritesPage = () => {
    const [activeTab, setActiveTab] = useState('favorites');
    const [showCreateListModal, setShowCreateListModal] = useState(false);

    const {
        favorites = [],
        isLoading = false,
        error = null,
        pagination = { number: 0, size: 20, totalPages: 0, totalElements: 0 },
        fetchFavorites,
        loadPage
    } = useFavorites();

    const { data: myLists = [], isLoading: listsLoading, refetch: refetchLists } = useMyFavoriteLists();

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
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Favorilerim</h1>
                <p className="text-slate-600 mt-1">
                    Beğendiğin ürünleri ve listelerini yönet
                </p>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'favorites'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Favoriler ({pagination.totalElements})
                    </button>
                    <button
                        onClick={() => setActiveTab('lists')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'lists'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Listelerim ({myLists.length})
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {activeTab === 'lists' && (
                        <button
                            onClick={() => setShowCreateListModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Yeni Liste
                        </button>
                    )}
                    {activeTab === 'favorites' && (
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Yenile
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'favorites' && (
                <>
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
                </>
            )}

            {activeTab === 'lists' && (
                <div>
                    {listsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse">
                                    <div className="aspect-[4/3] bg-slate-200"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : myLists.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <List className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz listen yok</h3>
                            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                Beğendiğin ürünleri kategorize etmek için listeler oluştur
                            </p>
                            <button
                                onClick={() => setShowCreateListModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                İlk Listeni Oluştur
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {myLists.map(list => (
                                <FavoriteListCard key={list.id} list={list} />
                            ))}
                        </div>
                    )}
                </div>
            )}

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

export default FavoritesPage;
