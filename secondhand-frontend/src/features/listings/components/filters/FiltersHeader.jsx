import React from 'react';

const FiltersHeader = ({ isExpanded, onToggle, onReset, selectedCategory }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-800">Advanced Filters</h3>
      </div>
      {selectedCategory && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>•</span>
        </div>
      )}
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
      >
        {isExpanded ? 'Hide' : 'Show'} Filters
        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <button
        onClick={onReset}
        className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 underline transition-colors"
      >
        Reset
      </button>
    </div>
  </div>
);

export default FiltersHeader;


