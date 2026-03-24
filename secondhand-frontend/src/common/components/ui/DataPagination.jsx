import React from 'react';

const DataPagination = ({
  shouldShowPagination,
  currentPage,
  totalPages,
  startItem,
  endItem,
  totalItems,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}) => {
  if (!shouldShowPagination || totalPages <= 1) return null;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white p-3 flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <span className="text-xs text-slate-500 tabular-nums">
          Page {currentPage + 1} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-xs text-slate-500 tabular-nums">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="pageSize" className="text-xs text-slate-500">
            Per page:
          </label>
          <select
            id="pageSize"
            className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {(pageSizeOptions ?? []).map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DataPagination;

