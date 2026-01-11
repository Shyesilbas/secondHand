import React from 'react';

const OrdersPagination = React.memo(({
    pagination,
    isSearchMode,
    loading,
    onPageChange,
    onPageSizeChange
}) => {
    if (isSearchMode || loading) {
        return null;
    }

    if (!pagination || pagination.totalPages === 0) {
        return null;
    }

    const currentPage = pagination.number || 0;
    const totalPages = pagination.totalPages || 1;
    const pageSize = pagination.size || 5;
    const totalElements = pagination.totalElements || 0;

    const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0 || totalPages <= 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>

                    <span className="text-sm text-gray-600 px-3">
                        Page {currentPage + 1} of {totalPages}
                    </span>

                    <button
                        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-sm text-gray-600">
                        Showing {startItem} to {endItem} of {totalElements} {totalElements === 1 ? 'order' : 'orders'}
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="pageSize" className="text-sm text-gray-600">Per page:</label>
                        <select
                            id="pageSize"
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
});

OrdersPagination.displayName = 'OrdersPagination';

export default OrdersPagination;
