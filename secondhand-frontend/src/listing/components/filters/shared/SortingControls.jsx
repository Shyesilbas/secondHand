import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const SortingControls = ({ filters, onChange, sortOptions = [] }) => (
  <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100 mt-8">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 bg-white rounded-md shadow-sm text-gray-600">
        <ArrowUpDown className="w-4 h-4" />
      </div>
      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sorting</h4>
    </div>
    
    <div className="flex gap-4">
      <div className="relative flex-1">
        <select
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => onChange('sortBy', e.target.value)}
          className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer hover:border-gray-300 transition-colors"
        >
          <option value="createdAt">Date Added</option>
          <option value="price">Price</option>
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
          <ArrowUpDown className="w-4 h-4" />
        </div>
      </div>

      <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
        <button
          onClick={() => onChange('sortDirection', 'ASC')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
            filters.sortDirection === 'ASC' 
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ArrowUp className="w-3.5 h-3.5" />
          Asc
        </button>
        <button
          onClick={() => onChange('sortDirection', 'DESC')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
            filters.sortDirection === 'DESC' || !filters.sortDirection
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ArrowDown className="w-3.5 h-3.5" />
          Desc
        </button>
      </div>
    </div>
  </div>
);

export default SortingControls;
