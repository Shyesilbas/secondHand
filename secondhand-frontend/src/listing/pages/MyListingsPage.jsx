import React, { useState } from 'react';
import { useMyListings } from '../hooks/useMyListings.js';
import ListingGrid from '../../listing/components/ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import PageHeader from '../../listing/components/PageHeader.jsx';
import ListingStats from '../../listing/components/ListingStats.jsx';

const MyListingsPage = () => {
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [pageSize, setPageSize] = useState(10);
    const { 
        listings, 
        totalPages, 
        totalElements, 
        currentPage, 
        isLoading, 
        error, 
        refetch, 
        handlePageChange, 
        handleSizeChange 
    } = useMyListings(selectedStatus, 0, pageSize);

    const handleStatusClick = (status) => {
        setSelectedStatus(selectedStatus === status ? null : status);
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        handleSizeChange(newSize);
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
                listings={!isLoading ? listings : null}
                selectedStatus={selectedStatus}
                onStatusClick={handleStatusClick}
            />

            {/* Page Size Selector */}
            <div className="flex justify-between items-center mb-6">
                <div className="text-text-secondary text-sm">
                    {!isLoading && (
                        <span>
                            Showing {listings.length} of <span className="font-semibold text-text-primary">{totalElements}</span> total listings
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">Show:</span>
                    <select 
                        value={pageSize} 
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </select>
                    <span className="text-sm text-text-secondary">per page</span>
                </div>
            </div>

            <ListingGrid
                listings={listings}
                isLoading={isLoading}
                error={error}
                onDeleted={() => refetch()}
            />

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <div className="mt-8 bg-white border border-gray-200 rounded">
                    <Pagination
                        page={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default MyListingsPage;