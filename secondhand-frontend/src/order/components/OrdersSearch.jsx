import React from 'react';

const OrdersSearch = React.memo(({
    searchTerm,
    setSearchTerm,
    searchLoading,
    searchError,
    isSearchMode,
    onSearch,
    onClearSearch
}) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <form onSubmit={onSearch} className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by order number"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                        disabled={searchLoading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={searchLoading || !searchTerm.trim()}
                    className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {searchLoading ? 'Searching...' : 'Search'}
                </button>
                {isSearchMode && (
                    <button
                        type="button"
                        onClick={onClearSearch}
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Show All
                    </button>
                )}
            </form>
            {searchError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{searchError}</p>
                </div>
            )}
        </div>
    );
});

export default OrdersSearch;
