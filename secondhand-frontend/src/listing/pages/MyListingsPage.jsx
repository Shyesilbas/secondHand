import React, { useState } from 'react';
import { useMyListings } from '../hooks/useMyListings.js';
import ListingGrid from '../../listing/components/ListingGrid.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import PageHeader from '../../listing/components/PageHeader.jsx';
import ListingStats from '../../listing/components/ListingStats.jsx';

const MyListingsPage = () => {
    const [selectedStatus, setSelectedStatus] = useState(null);
    const { allListings, listings, isLoading, error, refetch } = useMyListings(selectedStatus);

    const handleStatusClick = (status) => {
        setSelectedStatus(selectedStatus === status ? null : status);
    };

    return (
        <div className="container mx-auto px-4 py-8">
                    <PageHeader
            title="My Listings"
            subtitle="You can manage your listings here."
            onRefresh={refetch}
            createButtonText="New Listing"
            createButtonRoute={ROUTES.CREATE_LISTING}
        />

            <ListingStats
                listings={!isLoading ? allListings : null}
                selectedStatus={selectedStatus}
                onStatusClick={handleStatusClick}
            />

            {!isLoading && allListings && (
                <div className="text-center mb-4">
                    <p className="text-text-secondary text-sm">
                        You have <span className="font-semibold text-text-primary">{allListings.length}</span> total listings
                    </p>
                </div>
            )}

            <ListingGrid
                listings={listings}
                isLoading={isLoading}
                error={error}
                onDeleted={() => refetch()}
            />
        </div>
    );
};

export default MyListingsPage;