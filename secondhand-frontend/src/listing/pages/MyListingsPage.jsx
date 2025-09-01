import React from 'react';
import { useMyListings } from '../hooks/useMyListings.js';
import ListingGrid from '../../listing/components/ListingGrid.jsx';
import { ROUTES } from '../../constants/routes.js';
import PageHeader from '../../listing/components/PageHeader.jsx';
import ListingStats from '../../listing/components/ListingStats.jsx';

const MyListingsPage = () => {
    const { listings, isLoading, error, refetch } = useMyListings('ACTIVE','DRAFT','INACTIVE');

    return (
        <div className="container mx-auto px-4 py-8">
                    <PageHeader
            title="My Listings"
            subtitle="You can manage your listings here."
            onRefresh={refetch}
            createButtonText="New Listing"
            createButtonRoute={ROUTES.CREATE_LISTING}
        />

            <ListingStats listings={!isLoading ? listings : null} />

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