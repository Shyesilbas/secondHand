import React from 'react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="p-4 border-t border-sidebar-border">
      <div className="flex justify-between items-center">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="px-4 py-2 text-sm font-medium text-text-secondary bg-white border border-header-border rounded-md hover:bg-app-bg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-text-secondary">
          Page {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="px-4 py-2 text-sm font-medium text-text-secondary bg-white border border-header-border rounded-md hover:bg-app-bg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;