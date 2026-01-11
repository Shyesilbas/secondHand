import React, { useMemo, useState } from 'react';
import { useMyListings } from '../hooks/useMyListings.js';
import ListingGrid from '../../listing/components/ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import PageHeader from '../../listing/components/PageHeader.jsx';
import { listingService } from '../services/listingService.js';
import { useEnums } from '../../common/hooks/useEnums.js';

const MyListingsPage = () => {
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [pageSize, setPageSize] = useState(10);
    const [titleSearchTerm, setTitleSearchTerm] = useState('');
    const [allPagesLoaded, setAllPagesLoaded] = useState(false);
    const [allListings, setAllListings] = useState([]);
    const [loadingAllPages, setLoadingAllPages] = useState(false);
    const [isLowStockOpen, setIsLowStockOpen] = useState(false);
    const { enums } = useEnums();
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
    } = useMyListings(selectedStatus, 0, pageSize, selectedCategory);


    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        handleSizeChange(newSize);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category === selectedCategory ? null : category);
        handlePageChange(0);
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
                const response = await listingService.getMyListings(currentPage, 50);
                
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

    const lowStockListings = useMemo(() => {
        const source = allPagesLoaded ? allListings : (listings || []);
        if (!Array.isArray(source)) {
            return [];
        }
        return source.filter((listing) => {
            if (!listing) return false;
            if (['VEHICLE', 'REAL_ESTATE'].includes(listing.type)) return false;
            if (listing.quantity == null) return false;
            const qty = Number(listing.quantity);
            if (!Number.isFinite(qty)) return false;
            return qty > 0 && qty < 10;
        });
    }, [allPagesLoaded, allListings, listings]);

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <PageHeader
                    title="My Listings"
                    subtitle="You can manage your listings here."
                    onRefresh={refetch}
                    createButtonText="New Listing"
                    createButtonRoute={ROUTES.CREATE_LISTING}
                />

                <div className="mb-6 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                        <div className="p-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={titleSearchTerm}
                                    onChange={(e) => setTitleSearchTerm(e.target.value)}
                                    placeholder="Search by title or listing number..."
                                    className="w-full px-4 py-2.5 pl-11 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl transition-all tracking-tight text-sm"
                                />
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                {titleSearchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setTitleSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        {titleSearchTerm && (
                            <div className="px-4 pb-4">
                                <div className="p-3 bg-indigo-50/80 border border-indigo-200/60 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-xs font-medium text-indigo-900 tracking-tight">
                                                {allPagesLoaded ? (
                                                    <>Found {filteredListings.length} result{filteredListings.length !== 1 ? 's' : ''} in all pages</>
                                                ) : (
                                                    <>Found {filteredListings.length} result{filteredListings.length !== 1 ? 's' : ''} on current page</>
                                                )}
                                            </p>
                                        </div>
                                        {!allPagesLoaded && !loadingAllPages && (
                                            <button
                                                onClick={loadAllPages}
                                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors font-medium tracking-tight"
                                            >
                                                {filteredListings.length === 0 ? 'Search All Pages' : 'Find More'}
                                            </button>
                                        )}
                                        {loadingAllPages && (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-indigo-600"></div>
                                                <span className="text-xs text-indigo-700 font-medium tracking-tight">Loading...</span>
                                            </div>
                                        )}
                                    </div>
                                    {!allPagesLoaded && (
                                        <p className="mt-2 text-[11px] text-indigo-700 tracking-tight">
                                            More results may be available on other pages
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mb-6">
                    <div className="p-4">
                        <h3 className="text-xs font-semibold text-slate-900 mb-3 tracking-tight uppercase">Filter by Category</h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleCategoryChange(null)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all tracking-tight ${
                                    selectedCategory === null
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                                }`}
                            >
                                All Categories
                            </button>
                            {enums?.listingTypes?.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => handleCategoryChange(type.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 tracking-tight ${
                                        selectedCategory === type.value
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                                    }`}
                                >
                                    <span className="text-[10px]">{type.icon || '📦'}</span>
                                    <span>{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            {lowStockListings.length > 0 && (
                <div className="mb-8">
                    {!isLowStockOpen ? (
                        <button
                            onClick={() => setIsLowStockOpen(true)}
                            className="w-full bg-white rounded-2xl border border-amber-200/60 shadow-sm hover:shadow-md transition-all overflow-hidden"
                        >
                            <div className="px-5 py-4 bg-gradient-to-r from-amber-50/80 to-orange-50/60 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100/80 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L3.82 16a1.75 1.75 0 001.53 2.56h13.3A1.75 1.75 0 0020.18 16l-6.47-12.14a1.75 1.75 0 00-3.42 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-amber-900 tracking-tight">Low Stock</h3>
                                        <p className="text-[11px] text-amber-800 tracking-tight">
                                            {lowStockListings.length} listing{lowStockListings.length === 1 ? '' : 's'} have less than 10 items in stock.
                                        </p>
                                    </div>
                                </div>
                                <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>
                    ) : (
                        <div className="bg-white rounded-2xl border border-amber-200/60 shadow-md overflow-hidden">
                            <div className="px-5 py-4 border-b border-amber-200/60 bg-gradient-to-r from-amber-50/80 to-orange-50/60 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100/80 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L3.82 16a1.75 1.75 0 001.53 2.56h13.3A1.75 1.75 0 0020.18 16l-6.47-12.14a1.75 1.75 0 00-3.42 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-amber-900 tracking-tight">Stock is running low</h3>
                                        <p className="text-[11px] text-amber-800 tracking-tight">
                                            {lowStockListings.length} listing{lowStockListings.length === 1 ? '' : 's'} have less than 10 items in stock.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsLowStockOpen(false)}
                                    className="p-1.5 hover:bg-amber-100/60 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                            </div>
                            <div className="px-5 py-4">
                                <div className="space-y-2">
                                    {lowStockListings.slice(0, 6).map((listing) => (
                                        <button
                                            key={listing.id}
                                            type="button"
                                            onClick={() => window.location.assign(`/listings/${listing.id}`)}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-amber-50/50 text-left transition-colors"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 tracking-tight">
                                                    {listing.title?.charAt(0)?.toUpperCase() || 'L'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-slate-900 truncate tracking-tight">
                                                        {listing.title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 truncate tracking-tight">
                                                        {listing.listingNo}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200/60 tracking-tight">
                                                    In stock: {Number(listing.quantity)}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {lowStockListings.length > 6 && (
                                    <p className="mt-3 text-[11px] text-amber-800 tracking-tight">
                                        And {lowStockListings.length - 6} more listing{lowStockListings.length - 6 === 1 ? '' : 's'} with low stock.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Page Size Selector */}
            <div className="flex justify-between items-center mb-6">
                <div className="text-slate-600 text-xs tracking-tight">
                    {!isLoading && (
                        <span>
                            Showing {listings.length} of <span className="font-semibold text-slate-900">{totalElements}</span> total listings
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 tracking-tight">Show:</span>
                    <select 
                        value={pageSize} 
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="border border-slate-200/60 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-900 tracking-tight"
                    >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </select>
                    <span className="text-xs text-slate-600 tracking-tight">per page</span>
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
                <div className="mt-8 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                    <Pagination
                        page={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
            </div>
        </div>
    );
};

export default MyListingsPage;