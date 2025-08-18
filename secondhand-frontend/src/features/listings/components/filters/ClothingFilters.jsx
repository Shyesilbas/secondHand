import React from 'react';
import EnumDropdown from '../../../../components/ui/EnumDropdown';

const ClothingFilters = ({ filters, onChange }) => (
  <div className="border-t border-slate-200 pt-6">
    <h4 className="text-md font-medium text-slate-800 mb-4">Clothing Filters</h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <EnumDropdown label="Brand" enumKey="clothingBrands" value={filters.brands || []} onChange={(v) => onChange('brands', v)} multiple={true} />
      </div>
      <div>
        <EnumDropdown label="Type" enumKey="clothingTypes" value={filters.types || []} onChange={(v) => onChange('types', v)} multiple={true} />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <EnumDropdown label="Color" enumKey="colors" value={filters.colors || []} onChange={(v) => onChange('colors', v)} multiple={true} />
      </div>
      <div>
        <EnumDropdown label="Condition" enumKey="clothingConditions" value={filters.conditions || []} onChange={(v) => onChange('conditions', v)} multiple={true} />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Min Purchase Date</label>
        <input type="date" value={filters.minPurchaseDate || ''} onChange={(e) => onChange('minPurchaseDate', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Max Purchase Date</label>
        <input type="date" value={filters.maxPurchaseDate || ''} onChange={(e) => onChange('maxPurchaseDate', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" />
      </div>
    </div>
  </div>
);

export default ClothingFilters;


