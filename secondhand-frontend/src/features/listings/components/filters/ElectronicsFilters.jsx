import React from 'react';
import EnumDropdown from '../../../../components/ui/EnumDropdown';

const ElectronicsFilters = ({ filters, onChange }) => {
  const currentYear = new Date().getFullYear();
  const handleYearChange = (field, value) => {
    const numericValue = value === '' ? null : parseInt(value);
    onChange(field, numericValue);
  };

  return (
    <div className="border-t border-slate-200 pt-6">
      <h4 className="text-md font-medium text-slate-800 mb-4">Electronics Filters</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <EnumDropdown 
            label="Electronic Type" 
            enumKey="electronicTypes" 
            value={filters.electronicTypes || []} 
            onChange={(values) => onChange('electronicTypes', values)} 
            multiple={true} 
          />
        </div>
        <div>
          <EnumDropdown 
            label="Electronic Brand" 
            enumKey="electronicBrands" 
            value={filters.electronicBrands || []} 
            onChange={(values) => onChange('electronicBrands', values)} 
            multiple={true} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Min Year</label>
          <input
            type="number"
            min="1990"
            max={currentYear}
            value={filters.minYear || ''}
            onChange={(e) => handleYearChange('minYear', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            placeholder="2020"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Year</label>
          <input
            type="number"
            min="1990"
            max={currentYear}
            value={filters.maxYear || ''}
            onChange={(e) => handleYearChange('maxYear', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            placeholder={currentYear.toString()}
          />
        </div>
        <div>
          <EnumDropdown 
            label="Color" 
            enumKey="colors" 
            value={filters.colors || []} 
            onChange={(values) => onChange('colors', values)} 
            multiple={true} 
          />
        </div>
      </div>
    </div>
  );
};

export default ElectronicsFilters;


