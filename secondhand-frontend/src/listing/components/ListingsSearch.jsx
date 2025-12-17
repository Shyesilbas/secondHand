import React from 'react';
import { Search, Loader2 } from 'lucide-react';

const ListingsSearch = React.memo(({
    titleSearchTerm,
    setTitleSearchTerm,
    filteredListings,
    allPagesLoaded,
    loadingAllPages,
    loadAllPages
}) => {
    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="relative max-w-2xl">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={titleSearchTerm}
                            onChange={(e) => setTitleSearchTerm(e.target.value)}
                            placeholder="Search listings by title..."
                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white rounded-xl transition-all font-medium"
                        />
                        {titleSearchTerm && (
                            <button
                                onClick={() => setTitleSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <span className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded-md">ESC</span>
                            </button>
                        )}
                    </div>
                </div>
                
                {titleSearchTerm && (
                    <div className="mt-4 flex items-center justify-between bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-indigo-900">
                                    {loadingAllPages ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Searching everywhere...
                                        </span>
                                    ) : (
                                        <>
                                            Found <span className="font-bold">{filteredListings.length}</span> result{filteredListings.length !== 1 ? 's' : ''}
                                            {allPagesLoaded ? ' in all pages' : ' on this page'}
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                        
                        {!allPagesLoaded && !loadingAllPages && (
                            <button
                                onClick={loadAllPages}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-indigo-100 hover:border-indigo-200 transition-all"
                            >
                                Search All Pages
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

export default ListingsSearch;
