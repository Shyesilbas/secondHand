import React from 'react';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    totalElements, 
    onPageChange,
    itemsPerPage = 20 
}) => {
    if (totalPages <= 1) return null;

    const generatePageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); 
             i <= Math.min(totalPages - 1, currentPage + delta); 
             i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const pageNumbers = generatePageNumbers();

    return (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-slate-200">
            {/* Results Info */}
            <div className="flex items-center text-sm text-slate-700">
                <span>
                    <span className="font-medium">{(currentPage * itemsPerPage) + 1}</span>
                    {' - '}
                    <span className="font-medium">
                        {Math.min((currentPage + 1) * itemsPerPage, totalElements)}
                    </span>
                    {' / '}
                    <span className="font-medium">{totalElements}</span>
                    {' sonuç gösteriliyor'}
                </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === 0
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                    {pageNumbers.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`dots-${index}`}
                                    className="px-3 py-2 text-slate-400"
                                >
                                    ...
                                </span>
                            );
                        }

                        const pageIndex = page - 1; // Convert to 0-based index
                        const isCurrentPage = pageIndex === currentPage;

                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(pageIndex)}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                    isCurrentPage
                                        ? 'bg-slate-600 text-white'
                                        : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage >= totalPages - 1
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Pagination;