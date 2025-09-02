import React from 'react';

const SortingControls = ({ filters, onChange, sortOptions = [] }) => (
  <div className="border-t border-slate-200 pt-6">
    <h4 className="text-md font-medium text-slate-800 mb-4">Sorting</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
        <select
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => onChange('sortBy', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
        >
          <option value="createdAt">Date</option>
          <option value="price">Price</option>
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Sort Direction</label>
        <select
          value={filters.sortDirection || 'DESC'}
          onChange={(e) => onChange('sortDirection', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
        >
          <option value="DESC">Desc</option>
          <option value="ASC">Asc</option>
        </select>
      </div>
    </div>
  </div>
);

export default SortingControls;


