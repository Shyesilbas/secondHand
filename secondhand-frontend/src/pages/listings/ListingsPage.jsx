import React from 'react';
import { useListings } from '../../features/listings/hooks/useListings';
import ListingGrid from '../../features/listings/components/ListingGrid';

const ListingsPage = () => {
    const { listings, isLoading, error } = useListings();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    All Listings
                </h1>
                <p className="text-gray-600 mt-2">
                    Display all the Listings on the platform.
                </p>
            </div>

            <ListingGrid
                listings={listings}
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
};

export default ListingsPage;