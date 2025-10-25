import React from 'react';

const OrdersPagination = React.memo(({
    pagination,
    isSearchMode,
    loading,
    onPageChange,
    onPageSizeChange
}) => {
    if (isSearchMode || loading || pagination.totalPages <= 1) {
        return null;
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(0, pagination.number - 1))}
                        disabled={pagination.number === 0}
                        className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600 px-3">
                        Page {pagination.number + 1} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => onPageChange(Math.min(pagination.totalPages - 1, pagination.number + 1))}
                        disabled={pagination.number >= pagination.totalPages - 1}
                        className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        Showing {pagination.totalElements === 0 ? 0 : pagination.number * pagination.size + 1} to {Math.min((pagination.number + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements}
                    </span>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Per page:</label>
                        <select
                            className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white"
                            value={pagination.size || 5}
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

export default OrdersPagination;
