import React from 'react';
import { Filter, X, RefreshCw } from 'lucide-react';

const FiltersHeader = ({ isExpanded, onToggle, onReset, selectedCategory }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-6">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
        <Filter className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 leading-none">Filters</h3>
        {selectedCategory && (
          <span className="text-xs font-medium text-indigo-600 mt-1 block">
            {selectedCategory.replace('_', ' ')}
          </span>
        )}
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <button
        onClick={onReset}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
        title="Reset Filters"
      >
        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform" />
      </button>
      
      <button
        onClick={onToggle}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
          ${isExpanded 
            ? 'bg-gray-900 text-white shadow-md' 
            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
        <Filter className={`w-3.5 h-3.5 ${isExpanded ? 'fill-current' : ''}`} />
      </button>
    </div>
  </div>
);

export default FiltersHeader;
