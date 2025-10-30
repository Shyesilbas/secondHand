import React from 'react';

const ListingsSearch = React.memo(({
    titleSearchTerm,
    setTitleSearchTerm,
    filteredListings,
    allPagesLoaded,
    loadingAllPages,
    loadAllPages
}) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    );
});

export default ListingsSearch;
