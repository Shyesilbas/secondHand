import React from 'react';
import ListingCard from './ListingCard';

const ListingGrid = ({ listings, isLoading, error, onDeleted }) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-sidebar-border overflow-hidden animate-pulse">
                        <div className="flex h-32">
                            <div className="w-48 bg-gray-200 flex-shrink-0"></div>
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="w-24 h-4 bg-gray-200 rounded"></div>
                                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="w-3/4 h-5 bg-gray-200 rounded mb-2"></div>
                                    <div className="w-full h-4 bg-gray-200 rounded"></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                    Listings did not load
                </h3>
                <p className="text-text-secondary mb-4">
                    {error}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!listings || listings.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                    No listings yet
                </h3>
                <p className="text-text-secondary">
                    No Listing found for the criteria.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onDeleted={onDeleted} />
            ))}
        </div>
    );
};

export default ListingGrid;