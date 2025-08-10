import React from 'react';
import { useMyListings } from '../../features/listings/hooks/useMyListings';
import ListingGrid from '../../features/listings/components/ListingGrid';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const MyListingsPage = () => {
    const { listings, isLoading, error, refetch } = useMyListings();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        İlanlarım
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Oluşturduğunuz tüm ilanları buradan yönetebilirsiniz
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={refetch}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Yenile"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <Link
                        to={ROUTES.CREATE_LISTING}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Yeni İlan</span>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            {!isLoading && listings && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="text-2xl font-bold text-blue-600">
                            {listings.length}
                        </div>
                        <div className="text-sm text-gray-600">
                            Toplam İlan
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="text-2xl font-bold text-green-600">
                            {listings.filter(l => l.status === 'ACTIVE').length}
                        </div>
                        <div className="text-sm text-gray-600">
                            Aktif İlan
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="text-2xl font-bold text-yellow-600">
                            {listings.filter(l => l.status === 'DRAFT').length}
                        </div>
                        <div className="text-sm text-gray-600">
                            Taslak İlan
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="text-2xl font-bold text-red-600">
                            {listings.filter(l => l.status === 'SOLD').length}
                        </div>
                        <div className="text-sm text-gray-600">
                            Satılan İlan
                        </div>
                    </div>
                </div>
            )}

            <ListingGrid 
                listings={listings} 
                isLoading={isLoading} 
                error={error}
                showActions={true}
            />
        </div>
    );
};

export default MyListingsPage;