import React from 'react';
import { useMyListings } from '../../features/listings/hooks/useMyListings.js';
import ListingGrid from '../../features/listings/components/ListingGrid.jsx';
import { ROUTES } from '../../constants/routes';
import PageHeader from '../../features/listings/components/PageHeader';
import ListingStats from '../../features/listings/components/ListingStats';

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