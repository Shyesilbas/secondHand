import React, { useEffect, useMemo, useState } from 'react';
import { useAdvancedListingsQuery } from '../hooks/useAdvancedListingsQuery.js';
import ListingGrid from '../components/ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import FilterStatus from '../components/FilterStatus.jsx';
import FilterModal from '../components/FilterModal.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { listingService } from '../services/listingService.js';

const ListingsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [titleSearchTerm, setTitleSearchTerm] = useState('');
    const [allPagesLoaded, setAllPagesLoaded] = useState(false);
    const [allListings, setAllListings] = useState([]);
    const [loadingAllPages, setLoadingAllPages] = useState(false);

    const navState = useMemo(() => window.history.state && window.history.state.usr, []);
    const initialListingType = navState?.listingType || null;
    const {
        listings,
        totalPages,
        totalElements,
        currentPage,
        isLoading,
        error,
        filters,
        updateFilters,
        updatePage,
        resetFilters
    } = useAdvancedListingsQuery(initialListingType ? { listingType: initialListingType } : { listingType: 'VEHICLE' });

    const { getListingTypeLabel } = useEnums();

    useEffect(() => {
        if (initialListingType) {
            setSelectedCategory(initialListingType);
        }
    }, [initialListingType]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        updateFilters({ listingType: category });
    };

    const handleResetFilters = () => {
        setSelectedCategory('VEHICLE');
        resetFilters();
    };

    const handleOpenFilterModal = () => {
        setShowFilterModal(true);
    };

    const handleCloseFilterModal = () => {
        setShowFilterModal(false);
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
            // Mevcut filtreleri kullanarak tüm sayfaları yükle
            const allListingsData = [];
            let currentPage = 0;
            let hasMorePages = true;
            
            while (hasMorePages) {
                const response = await listingService.filterListings({
                    ...filters,
                    listingType: selectedCategory || filters.listingType, // Seçili kategoriyi kullan
                    page: currentPage,
                    size: 100 // Daha büyük sayfa boyutu
                });
                
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
            setSearchError('Error loading all listings. Please try again.');
        } finally {
            setLoadingAllPages(false);
        }
    };

    const hasActiveFilters = () => {
        if (!filters) return false;
        
        const defaultFilters = {
            listingType: 'VEHICLE',
            page: 0,
            size: 20
        };
        
        return Object.keys(filters).some(key => {
            if (key === 'page' || key === 'size') return false;
            return filters[key] !== defaultFilters[key] && filters[key] !== null && filters[key] !== undefined && filters[key] !== '';
        });
    };

    const mainContent = (
        <div className="min-h-screen bg-gray-50">
            {/* Modern Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Title Section */}
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                        Browse Listings
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-600 text-sm">
                                            {totalElements?.toLocaleString()} items available
                                        </span>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <span className="text-gray-500 text-sm">
                                            {getListingTypeLabel(selectedCategory || filters?.listingType) || 'All Categories'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Button */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleOpenFilterModal}
                                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 rounded-lg shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                </svg>
                                <span className="text-sm font-medium">Filters</span>
                                {hasActiveFilters() && (
                                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                <h3 className="text-lg font-semibold text-gray-900">Search Listings</h3>
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


                {/* Filter Status */}
                {!isLoading && !titleSearchTerm && (
                    <div className="mb-6">
                        <FilterStatus
                            totalElements={totalElements}
                            filters={filters}
                            getListingTypeLabel={getListingTypeLabel}
                            onResetFilters={resetFilters}
                            updateFilters={updateFilters}
                        />
                    </div>
                )}

                {/* Listings Grid */}
                <>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingIndicator />
                        </div>
                    ) : (
                        <div className="mb-8">
                            <ListingGrid listings={filteredListings} isLoading={isLoading} error={error} />
                        </div>
                    )}
                    {!isLoading && !titleSearchTerm && totalPages > 1 && (
                        <div className="bg-white border border-gray-200 rounded">
                            <Pagination
                                page={currentPage || 0}
                                totalPages={totalPages || 0}
                                onPageChange={updatePage}
                            />
                        </div>
                    )}
                </>
            </div>
        </div>
    );

    return (
        <>
            {mainContent}
            <FilterModal
                isOpen={showFilterModal}
                onClose={handleCloseFilterModal}
                filters={filters}
                onFiltersChange={updateFilters}
                onReset={handleResetFilters}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
            />
        </>
    );
};

export default ListingsPage;
