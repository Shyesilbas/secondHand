import React from 'react';
import { useEnums } from '../../hooks/useEnums.js';
import SearchableDropdown from './SearchableDropdown.jsx';

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

