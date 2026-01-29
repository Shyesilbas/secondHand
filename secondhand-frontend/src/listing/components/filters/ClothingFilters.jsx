import React from 'react';
import Select from 'react-select';

const ClothingFilters = ({ filters, onInputChange, enums }) => {
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
            value: opt.id || opt.value,
            label: opt.label,
          }))}
          value={selectedValues.map((v) => ({
            value: v,
            label: enums[enumKey]?.find((o) => (o.id || o.value) === v)?.label,
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

  const renderPurchaseYearRange = () => {
    const minYearValue = filters.minPurchaseYear || '';
    const maxYearValue = filters.maxPurchaseYear || '';

    const setYear = (key, raw) => {
      const value = raw === '' ? '' : parseInt(raw, 10);
      onInputChange(key, Number.isFinite(value) ? value : '');

      const minY = key === 'minPurchaseYear' ? value : filters.minPurchaseYear;
      const maxY = key === 'maxPurchaseYear' ? value : filters.maxPurchaseYear;

      const minDate = Number.isFinite(minY) ? `${minY}-01-01` : null;
      const maxDate = Number.isFinite(maxY) ? `${maxY}-12-31` : null;

      onInputChange('minPurchaseDate', minDate);
      onInputChange('maxPurchaseDate', maxDate);
    };

    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          Purchase Year
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              placeholder="Min Year"
              value={minYearValue}
              onChange={(e) => setYear('minPurchaseYear', e.target.value)}
              min={1900}
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max Year"
              value={maxYearValue}
              onChange={(e) => setYear('maxPurchaseYear', e.target.value)}
              min={1900}
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderEnumField('brands', 'Brand', 'clothingBrands')}
      {renderEnumField('types', 'Type', 'clothingTypes')}
      {renderEnumField('colors', 'Color', 'colors')}
      {renderEnumField('conditions', 'Condition', 'clothingConditions')}
      {renderEnumField('clothingGenders', 'Clothing Gender', 'clothingGenders')}
      {renderEnumField('clothingCategories', 'Clothing Category', 'clothingCategories')}
      {renderPurchaseYearRange()}
    </div>
  );
};

export default ClothingFilters;

