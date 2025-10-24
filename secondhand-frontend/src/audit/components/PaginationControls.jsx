import React from 'react';

const PaginationControls = ({
    shouldShowPagination,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalElements,
    pageSize,
    goToPreviousPage,
    goToNextPage,
    changePageSize
}) => {
    if (!shouldShowPagination) {
        return null;
    }

    return (
        <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 0}
                    className="px-4 py-2 text-sm font-medium text-text-secondary bg-card-bg border border-header-border rounded-lg hover:bg-app-bg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>

                <span className="text-sm text-text-secondary">
                    Page {currentPage + 1} of {totalPages}
                </span>

                <button
                    onClick={goToNextPage}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 text-sm font-medium text-text-secondary bg-card-bg border border-header-border rounded-lg hover:bg-app-bg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="text-sm text-text-secondary">
                    Showing {startIndex} to {endIndex} of {totalElements} results
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="pageSize" className="text-sm text-text-secondary">Per page:</label>
                    <select
                        id="pageSize"
                        className="px-2 py-1 text-sm border border-header-border rounded-md bg-card-bg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={pageSize}
                        onChange={(e) => changePageSize(Number(e.target.value))}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default PaginationControls;
