import React from 'react';
import EnumDropdown from '../../../../common/components/ui/EnumDropdown.jsx';

const PriceLocationFields = ({ filters, onPriceChange, onInputChange }) => (
  <div className="space-y-6">
    {/* Price Section */}
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">💰</span>
        <h3 className="text-lg font-semibold text-gray-900">Price Range</h3>
      </div>
      
      <div className="space-y-4">
        {/* Price Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center space-x-1">
                <span>Min Price</span>
                <span className="text-gray-400">(₺)</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => onPriceChange('minPrice', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="0"
                min="0"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-400 text-sm">₺</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center space-x-1">
                <span>Max Price</span>
                <span className="text-gray-400">(₺)</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => onPriceChange('maxPrice', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="No limit"
                min="0"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-400 text-sm">₺</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center space-x-1">
              <span>Currency</span>
              <span className="text-gray-400">(Optional)</span>
            </span>
          </label>
          <EnumDropdown 
            label="" 
            enumKey="currencies" 
            value={filters.currency || ''} 
            onChange={(value) => onInputChange('currency', value)} 
            multiple={false} 
          />
        </div>
      </div>
    </div>

    {/* Location Section */}
    <div className="bg-blue-50 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">📍</span>
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center space-x-1">
              <span>City</span>
              <span className="text-gray-400">(Optional)</span>
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.city || ''}
              onChange={(e) => onInputChange('city', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter city name..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-400">🏙️</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center space-x-1">
              <span>District</span>
              <span className="text-gray-400">(Optional)</span>
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.district || ''}
              onChange={(e) => onInputChange('district', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter district name..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-400">🏘️</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Location Tips */}
      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> You can search by city or district. Leave empty to search all locations.
        </p>
      </div>
    </div>
  </div>
);

export default PriceLocationFields;


