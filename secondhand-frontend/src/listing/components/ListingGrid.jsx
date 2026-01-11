import React, { memo } from 'react';
import ListingCard from './ListingCard.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { PhotoIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const ListingGrid = memo(({ listings, isLoading, error, onDeleted }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden animate-pulse">
                        <div className="aspect-video bg-slate-200"></div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-16 h-4 bg-slate-200 rounded"></div>
                                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                            </div>
                            <div className="w-3/4 h-5 bg-slate-200 rounded mb-2"></div>
                            <div className="w-full h-4 bg-slate-200 rounded mb-3"></div>
                            <div className="w-1/2 h-6 bg-slate-200 rounded mb-3"></div>
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
            <EmptyState
                icon={ExclamationCircleIcon}
                title="Listings did not load"
                description={error}
                primaryAction={{
                    label: 'Try Again',
                    onClick: () => window.location.reload()
                }}
                variant="error"
            />
        );
    }

    if (!listings || listings.length === 0) {
        return (
            <EmptyState
                icon={PhotoIcon}
                title="No listings found"
                description="No listings found for the criteria."
            />
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onDeleted={onDeleted} />
            ))}
        </div>
    );
});

ListingGrid.displayName = 'ListingGrid';

export default ListingGrid;
