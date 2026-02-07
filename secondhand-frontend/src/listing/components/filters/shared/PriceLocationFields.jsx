import EnumDropdown from '../../../../common/components/ui/EnumDropdown.jsx';
import { MapPin, DollarSign, Building2, Map } from 'lucide-react';

const PriceLocationFields = ({ filters, onPriceChange, onInputChange, compact = false }) => {
  if (compact) {
    return (
      <div className="space-y-5 min-w-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Price Range</h3>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="number"
              value={filters.minPrice ?? ''}
              onChange={(e) => onPriceChange('minPrice', e.target.value)}
              placeholder="Min"
              min="0"
              className="min-w-0 flex-1 w-0 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
            <span className="flex-shrink-0 text-slate-300 text-sm">–</span>
            <input
              type="number"
              value={filters.maxPrice ?? ''}
              onChange={(e) => onPriceChange('maxPrice', e.target.value)}
              placeholder="Max"
              min="0"
              className="min-w-0 flex-1 w-0 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>
          <EnumDropdown
            label="Currency"
            enumKey="currencies"
            value={filters.currency ?? ''}
            onChange={(v) => onInputChange('currency', v)}
            multiple={false}
            placeholder="Currency"
            className="w-full"
            usePortal={true}
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Location</h3>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={filters.city ?? ''}
                onChange={(e) => onInputChange('city', e.target.value)}
                placeholder="City"
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <div className="relative">
              <input
                type="text"
                value={filters.district ?? ''}
                onChange={(e) => onInputChange('district', e.target.value)}
                placeholder="District"
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
              <Map className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Price Range</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={filters.minPrice ?? ''}
              onChange={(e) => onPriceChange('minPrice', e.target.value)}
              placeholder="Min"
              min="0"
              className="flex-1 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
            <span className="text-slate-300">–</span>
            <input
              type="number"
              value={filters.maxPrice ?? ''}
              onChange={(e) => onPriceChange('maxPrice', e.target.value)}
              placeholder="Max"
              min="0"
              className="flex-1 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>
          <EnumDropdown
            label="Currency"
            enumKey="currencies"
            value={filters.currency ?? ''}
            onChange={(v) => onInputChange('currency', v)}
            multiple={false}
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Location</h3>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={filters.city ?? ''}
              onChange={(e) => onInputChange('city', e.target.value)}
              placeholder="City"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
          <div className="relative">
            <input
              type="text"
              value={filters.district ?? ''}
              onChange={(e) => onInputChange('district', e.target.value)}
              placeholder="District"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
            <Map className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceLocationFields;
