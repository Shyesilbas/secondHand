import React, { memo } from 'react';
import ListingCard from './ListingCard.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { PhotoIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const ListingGrid = memo(({ listings, isLoading, error, onDeleted }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
                        <div className="aspect-video bg-slate-200"></div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-16 h-4 bg-slate-200 rounded"></div>
                                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                            </div>
                            <div className="w-3/4 h-5 bg-slate-200 rounded mb-3"></div>
                            <div className="w-full h-4 bg-slate-200 rounded mb-4"></div>
                            <div className="w-1/2 h-6 bg-slate-200 rounded mb-4"></div>
                            <div className="flex justify-between items-center">
                                <div className="w-20 h-4 bg-slate-200 rounded"></div>
                                <div className="w-16 h-4 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[320px]">
                <div className="max-w-md w-full">
                    <EmptyState
                        icon={ExclamationCircleIcon}
                        title="Listings did not load"
                        description={error}
                        primaryAction={{
                            label: 'Try Again',
                            onClick: () => window.location.reload()
                        }}
                        variant="error"
                        className="w-full"
                    />
                </div>
            </div>
        );
    }

    if (!listings || listings.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[320px]">
                <div className="max-w-md w-full">
                    <EmptyState
                        icon={PhotoIcon}
                        title="No listings found"
                        description="No listings found for the criteria."
                        className="w-full"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {listings.map((listing) => (
                <ListingCard
                    key={listing.id}
                    listing={listing}
                    onDeleted={onDeleted}
                />
            ))}
        </div>
    );
});

ListingGrid.displayName = 'ListingGrid';

export default ListingGrid;
