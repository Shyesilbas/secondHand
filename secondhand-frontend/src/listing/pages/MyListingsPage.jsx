import React, { useMemo, useState } from 'react';
import { useMyListings } from '../hooks/useMyListings.js';
import ListingGrid from '../../listing/components/ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import PageHeader from '../../listing/components/PageHeader.jsx';
import ListingStats from '../../listing/components/ListingStats.jsx';
import { listingService } from '../services/listingService.js';

const MyListingsPage = () => {
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [pageSize, setPageSize] = useState(10);
    const [titleSearchTerm, setTitleSearchTerm] = useState('');
    const [allPagesLoaded, setAllPagesLoaded] = useState(false);
    const [allListings, setAllListings] = useState([]);
    const [loadingAllPages, setLoadingAllPages] = useState(false);
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

    // Frontend filtering for title and listingNo
    const filteredListings = useMemo(() => {
        if (!titleSearchTerm.trim()) {
            return listings || [];
        }

        const searchLower = titleSearchTerm.toLowerCase().trim();
        const listingsToSearch = allPagesLoaded ? allListings : (listings || []);
        
        return listingsToSearch.filter(listing => {
            const titleMatch = listing.title?.toLowerCase().includes(searchLower);
            const listingNoMatch = listing.listingNo?.toLowerCase().includes(searchLower);
            return titleMatch || listingNoMatch;
        });
    }, [listings, titleSearchTerm, allPagesLoaded, allListings]);

    const clearSearch = () => {
        setTitleSearchTerm('');
        setAllPagesLoaded(false);
        setAllListings([]);
    };

    const loadAllPages = async () => {
        setLoadingAllPages(true);
        try {
            // My listings için tüm sayfaları yükle
            const allListingsData = [];
            let currentPage = 0;
            let hasMorePages = true;
            
            while (hasMorePages) {
                const response = await listingService.getMyListings(currentPage, 100); // Daha büyük sayfa boyutu
                
                if (response.content && response.content.length > 0) {
                    allListingsData.push(...response.content);
                    currentPage++;
                    
                    // Son sayfaya ulaştıysak döngüyü sonlandır
                    if (response.content.length < 100 || currentPage >= response.totalPages) {
                        hasMorePages = false;
                    }
                } else {
                    hasMorePages = false;
                }
            }
            
            setAllListings(allListingsData);
            setAllPagesLoaded(true);
        } catch (error) {
            console.error('Error loading all pages:', error);
        } finally {
            setLoadingAllPages(false);
        }
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

            {/* Modern Search Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Search My Listings</h3>
                            <p className="text-sm text-gray-600">Find exactly what you're looking for</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                
                <div className="space-y-6">
                    {/* Title and ListingNo Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quick Search
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={titleSearchTerm}
                                onChange={(e) => setTitleSearchTerm(e.target.value)}
                                placeholder="Search by title or listing number (e.g., MacBook, ABC12345)"
                                className="w-full px-4 py-3 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-colors"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {titleSearchTerm ? (
                                    <button
                                        type="button"
                                        onClick={() => setTitleSearchTerm('')}
                                        className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {titleSearchTerm && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900">
                                        {allPagesLoaded ? (
                                            <>Found {filteredListings.length} result{filteredListings.length !== 1 ? 's' : ''} in all pages</>
                                        ) : (
                                            <>Found {filteredListings.length} result{filteredListings.length !== 1 ? 's' : ''} on current page</>
                                        )}
                                    </p>
                                    <p className="text-xs text-blue-700">
                                        for "{titleSearchTerm}"
                                        {!allPagesLoaded && " • More results may be available on other pages"}
                                    </p>
                                </div>
                            </div>
                            
                            {!allPagesLoaded && !loadingAllPages && (
                                <button
                                    onClick={loadAllPages}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    {filteredListings.length === 0 ? 'Search All Pages' : 'Find More Results'}
                                </button>
                            )}
                            
                            {loadingAllPages && (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-sm text-blue-700 font-medium">Loading all pages...</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </div>
            </div>

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
                listings={filteredListings}
                isLoading={isLoading}
                error={error}
                onDeleted={() => refetch()}
            />

            {/* Pagination */}
            {!isLoading && !titleSearchTerm && totalPages > 1 && (
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