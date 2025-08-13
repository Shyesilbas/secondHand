import React from 'react';
import { useEnums } from '../../hooks/useEnums';
import SearchableDropdown from './SearchableDropdown';

// enumKey values: 'carBrands', 'fuelTypes', 'colors', 'doors', 'currencies', 'gearTypes', 'seatCounts', 'listingTypes', 'listingStatuses'
const EnumDropdown = ({ label, enumKey, value, onChange, placeholder = '', searchPlaceholder = '', multiple = false, className = '' }) => {
  const { enums } = useEnums();
  const options = enums?.[enumKey] || [];
  const selectedValues = value ? (multiple ? value : [value]) : [];

  const handleChange = (values) => {
    onChange(multiple ? values : (values[0] || ''));
  };

  return (
    <SearchableDropdown
      label={label}
      options={options}
      selectedValues={selectedValues}
      onSelectionChange={handleChange}
      placeholder={placeholder || `${label} seçin...`}
      searchPlaceholder={searchPlaceholder || `${label} ara...`}
      multiple={multiple}
      className={className}
    />
  );
};

export default EnumDropdown;

