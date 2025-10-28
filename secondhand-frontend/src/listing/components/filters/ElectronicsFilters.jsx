import React from 'react';
import Select from 'react-select';

const ElectronicsFilters = ({ filters, onInputChange, enums }) => {
  const renderEnumField = (fieldKey, label, enumKey) => {
    const selectedValues = filters[fieldKey] || [];

    return (
      <div key={fieldKey} className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          {label}
        </label>
        <Select
          isMulti
          options={enums[enumKey]?.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          value={selectedValues.map((v) => ({
            value: v,
            label: enums[enumKey]?.find((o) => o.value === v)?.label,
          }))}
          onChange={(selected) => {
            onInputChange(
              fieldKey,
              selected ? selected.map((s) => s.value) : []
            );
          }}
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder={`Select ${label.toLowerCase()}...`}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={{
            control: (base) => ({
              ...base,
              minHeight: '44px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': {
                border: '1px solid #9ca3af',
              },
              '&:focus-within': {
                border: '2px solid #374151',
                boxShadow: '0 0 0 3px rgba(55, 65, 81, 0.1)',
              },
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: '#374151',
              fontSize: '14px',
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#ef4444',
                color: 'white',
              },
            }),
            placeholder: (base) => ({
              ...base,
              color: '#9ca3af',
              fontSize: '14px',
            }),
            menu: (base) => ({
              ...base,
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              zIndex: 9999,
              maxHeight: '200px',
              overflowY: 'auto',
            }),
            menuPortal: (base) => ({
              ...base,
              zIndex: 9999,
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected 
                ? '#374151' 
                : state.isFocused 
                  ? '#f3f4f6' 
                  : 'white',
              color: state.isSelected ? 'white' : '#374151',
              '&:hover': {
                backgroundColor: state.isSelected ? '#374151' : '#f3f4f6',
              },
            }),
          }}
        />
      </div>
    );
  };

  const renderNumericRangeField = (fieldKey, label, min = 0, max = 1000000) => {
    const minKey = `min${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}`;
    const maxKey = `max${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}`;

    return (
      <div key={fieldKey} className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          {label} Range
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              placeholder={`Min ${label}`}
              value={filters[minKey] || ""}
              onChange={(e) => onInputChange(minKey, e.target.value)}
              min={min}
              max={max}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder={`Max ${label}`}
              value={filters[maxKey] || ""}
              onChange={(e) => onInputChange(maxKey, e.target.value)}
              min={min}
              max={max}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
          </div>
        </div>
      </div>
    );
  };

  const laptopSelected = Array.isArray(filters.electronicTypes) && filters.electronicTypes.includes('LAPTOP');

  return (
    <div className="space-y-8">
      {renderEnumField('electronicTypes', 'Electronic Type', 'electronicTypes')}
      {renderEnumField('electronicBrands', 'Brand', 'electronicBrands')}
      {renderNumericRangeField('year', 'Year', 1990, new Date().getFullYear())}
      {laptopSelected && renderNumericRangeField('storage', 'Storage (GB)', 1, 10000)}
      {laptopSelected && renderNumericRangeField('ram', 'RAM (GB)', 1, 128)}
      {laptopSelected && renderNumericRangeField('screenSize', 'Screen Size (inch)', 1, 50)}
      {laptopSelected && renderEnumField('processors', 'Processor', 'processors')}
    </div>
  );
};

export default ElectronicsFilters;
