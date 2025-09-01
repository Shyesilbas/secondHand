import React from 'react';
import EnumDropdown from '../../../../common/components/ui/EnumDropdown.jsx';

const PriceLocationFields = ({ filters, onPriceChange, onInputChange }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Min Price</label>
        <input
          type="number"
          value={filters.minPrice || ''}
          onChange={(e) => onPriceChange('minPrice', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          placeholder="0"
          min="0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Max Price</label>
        <input
          type="number"
          value={filters.maxPrice || ''}
          onChange={(e) => onPriceChange('maxPrice', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          placeholder="∞"
          min="0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
        <EnumDropdown 
          label="" 
          enumKey="currencies" 
          value={filters.currency || ''} 
          onChange={(value) => onInputChange('currency', value)} 
          multiple={false} 
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
        <input
          type="text"
          value={filters.city || ''}
          onChange={(e) => onInputChange('city', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          placeholder="Istanbul"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">District</label>
        <input
          type="text"
          value={filters.district || ''}
          onChange={(e) => onInputChange('district', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          placeholder="Kadikoy"
        />
      </div>
    </div>
  </>
);

export default PriceLocationFields;


