import React from 'react';
import EnumDropdown from '../../../components/ui/EnumDropdown';

const RealEstateFilters = ({ filters, onChange }) => {
  const handleNum = (field, value) => onChange(field, value === '' ? null : parseInt(value));
  return (
    <div className="border-t border-slate-200 pt-6">
      <h4 className="text-md font-medium text-slate-800 mb-4">Real Estate Filters</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <EnumDropdown label="Ad Type" enumKey="realEstateAdTypes" value={filters.adType || ''} onChange={(v) => onChange('adType', v)} multiple={false} />
        </div>
        <div>
          <EnumDropdown label="Owner Type" enumKey="ownerTypes" value={filters.ownerType || ''} onChange={(v) => onChange('ownerType', v)} multiple={false} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <EnumDropdown label="Property Type" enumKey="realEstateTypes" value={filters.realEstateTypes || []} onChange={(v) => onChange('realEstateTypes', v)} multiple={true} />
        </div>
        <div>
          <EnumDropdown label="Heating Type" enumKey="heatingTypes" value={filters.heatingTypes || []} onChange={(v) => onChange('heatingTypes', v)} multiple={true} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Min Square Meters</label>
          <input type="number" min="0" value={filters.minSquareMeters || ''} onChange={(e) => handleNum('minSquareMeters', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder="50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Square Meters</label>
          <input type="number" min="0" value={filters.maxSquareMeters || ''} onChange={(e) => handleNum('maxSquareMeters', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder="200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Min Room Count</label>
          <input type="number" min="0" value={filters.minRoomCount || ''} onChange={(e) => handleNum('minRoomCount', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder="1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Room Count</label>
          <input type="number" min="0" value={filters.maxRoomCount || ''} onChange={(e) => handleNum('maxRoomCount', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder="5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Min Bathroom Count</label>
          <input type="number" min="0" value={filters.minBathroomCount || ''} onChange={(e) => handleNum('minBathroomCount', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder="1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Bathroom Count</label>
          <input type="number" min="0" value={filters.maxBathroomCount || ''} onChange={(e) => handleNum('maxBathroomCount', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder="3" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Floor</label>
          <input type="number" min="0" value={filters.floor || ''} onChange={(e) => handleNum('floor', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder="3" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Min Building Age</label>
          <input type="number" min="0" value={filters.minBuildingAge || ''} onChange={(e) => handleNum('minBuildingAge', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder="0" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Building Age</label>
          <input type="number" min="0" value={filters.maxBuildingAge || ''} onChange={(e) => handleNum('maxBuildingAge', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder="20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Furnished</label>
          <select value={filters.furnished ? 'true' : 'false'} onChange={(e) => onChange('furnished', e.target.value === 'true')} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
            <option value="">Any</option>
            <option value="true">Furnished</option>
            <option value="false">Not Furnished</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RealEstateFilters;


