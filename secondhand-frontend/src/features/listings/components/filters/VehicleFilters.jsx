import React from 'react';
import EnumDropdown from '../../../../components/ui/EnumDropdown';

const VehicleFilters = ({ filters, onChange }) => {
  const currentYear = new Date().getFullYear();
  const handleYearChange = (field, value) => {
    const numericValue = value === '' ? null : parseInt(value);
    onChange(field, numericValue);
  };

  return (
    <div className="border-t border-slate-200 pt-6">
      <h4 className="text-md font-medium text-slate-800 mb-4">Vehicle Filters</h4>

      <div className="mb-4">
        <EnumDropdown 
          label="Brands" 
          enumKey="carBrands" 
          value={filters.brands || []} 
          onChange={(values) => onChange('brands', values)} 
          multiple={true} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Min Year</label>
          <input
            type="number"
            min="1980"
            max={currentYear}
            value={filters.minYear || ''}
            onChange={(e) => handleYearChange('minYear', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            placeholder="2000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Year</label>
          <input
            type="number"
            min="1980"
            max={currentYear}
            value={filters.maxYear || ''}
            onChange={(e) => handleYearChange('maxYear', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            placeholder={currentYear.toString()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Mileage</label>
          <input
            type="number"
            value={filters.maxMileage || ''}
            onChange={(e) => handleYearChange('maxMileage', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            placeholder="200000"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <EnumDropdown 
            label="Fuel Type" 
            enumKey="fuelTypes" 
            value={filters.fuelTypes || []} 
            onChange={(values) => onChange('fuelTypes', values)} 
            multiple={true} 
          />
        </div>
        <div>
          <EnumDropdown 
            label="Gear Type" 
            enumKey="gearTypes" 
            value={filters.gearTypes || []} 
            onChange={(values) => onChange('gearTypes', values)} 
            multiple={true} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <EnumDropdown 
            label="Seat Count" 
            enumKey="seatCounts" 
            value={filters.seatCounts || []} 
            onChange={(values) => onChange('seatCounts', values)} 
            multiple={true} 
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

export default VehicleFilters;


