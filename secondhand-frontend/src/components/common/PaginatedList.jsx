import React from 'react';
import { SkeletonCard } from '../ui/Skeleton';

const PaginatedList = ({
  header,
  items,
  isLoading,
  error,
  emptyState,
  renderItem,
  currentPage,
  totalPages,
  pageSize,
  onPrev,
  onNext,
  right,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(5)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {(header || right) && (
        <div className="flex items-center justify-between mb-4">
          <div>{header}</div>
          <div>{right}</div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error.message}</p>
        </div>
      )}

      {(!items || items.length === 0) ? (
        emptyState || (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-600">
            No data
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrev}
              disabled={currentPage === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>

            <button
              onClick={onNext}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginatedList;

