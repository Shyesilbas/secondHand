import React from 'react';
import EnumDropdown from '../../../../common/components/ui/EnumDropdown.jsx';
import { MapPin, DollarSign, Building2, Map } from 'lucide-react';

const PriceLocationFields = ({ filters, onPriceChange, onInputChange, compact = false }) => {
  if (compact) {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-gray-900">Price Range</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => onPriceChange('minPrice', e.target.value)}
                  className="w-full pl-2 pr-6 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="Min"
                  min="0"
                />
                <span className="absolute right-2 top-2 text-gray-400 text-xs">₺</span>
              </div>
              <span className="text-gray-300 text-xs">-</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => onPriceChange('maxPrice', e.target.value)}
                  className="w-full pl-2 pr-6 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="Max"
                  min="0"
                />
                <span className="absolute right-2 top-2 text-gray-400 text-xs">₺</span>
              </div>
            </div>
            <EnumDropdown 
              label="Currency" 
              enumKey="currencies" 
              value={filters.currency || ''} 
              onChange={(value) => onInputChange('currency', value)} 
              multiple={false} 
              className="w-full"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Location</h3>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={filters.city || ''}
                onChange={(e) => onInputChange('city', e.target.value)}
                className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                placeholder="City"
              />
              <Building2 className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2.5" />
            </div>
            <div className="relative">
              <input
                type="text"
                value={filters.district || ''}
                onChange={(e) => onInputChange('district', e.target.value)}
                className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                placeholder="District"
              />
              <Map className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600">
            <DollarSign className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Price Range</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => onPriceChange('minPrice', e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all font-medium"
                placeholder="Min"
                min="0"
              />
              <span className="absolute right-3 top-2.5 text-gray-400 text-xs font-bold">₺</span>
            </div>
            <span className="text-gray-300 font-medium">-</span>
            <div className="relative flex-1">
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => onPriceChange('maxPrice', e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all font-medium"
                placeholder="Max"
                min="0"
              />
              <span className="absolute right-3 top-2.5 text-gray-400 text-xs font-bold">₺</span>
            </div>
          </div>
          
          <EnumDropdown 
            label="Currency" 
            enumKey="currencies" 
            value={filters.currency || ''} 
            onChange={(value) => onInputChange('currency', value)} 
            multiple={false} 
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-blue-50 rounded-md text-blue-600">
            <MapPin className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Location</h3>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={filters.city || ''}
              onChange={(e) => onInputChange('city', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
              placeholder="City (e.g. Istanbul)"
            />
            <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={filters.district || ''}
              onChange={(e) => onInputChange('district', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
              placeholder="District (e.g. Kadikoy)"
            />
            <Map className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceLocationFields;
