import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

const SearchableDropdown = ({
  options = [],
  selectedValues = [],
  onSelectionChange,
  placeholder = 'Search and select...',
  label,
  multiple = true,
  searchPlaceholder = 'Type to search...',
  className = '',
  maxDisplayItems = 3,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = () => setIsOpen(prev => !prev);

  const handleClickOutside = useCallback((e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
      setSearchTerm('');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (isOpen) searchInputRef.current?.focus();
  }, [isOpen]);

  const handleOptionClick = (value) => {
    if (multiple) {
      const newSelection = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([value]);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleClearAll = () => onSelectionChange([]);

  const getDisplayText = () => {
    if (!selectedValues.length) return placeholder;
    if (selectedValues.length <= maxDisplayItems) {
      return selectedValues.map(v => options.find(o => o.value === v)?.label || v).join(', ');
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}

      <button
        type="button"
        onClick={toggleDropdown}
        className={`w-full px-5 py-3 border rounded-xl text-left flex items-center justify-between transition-all duration-200 ${
          isOpen 
            ? 'border-indigo-500 ring-4 ring-indigo-100' 
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <span className={`truncate ${selectedValues.length ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {getDisplayText()}
        </span>
        <div className="flex items-center gap-2">
          {multiple && selectedValues.length > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClearAll(); }}
              className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
              title="Clear all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-80 overflow-hidden animation-fade-in">
          <div className="p-3 border-b border-gray-100 relative bg-gray-50/50">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm focus:outline-none transition-shadow"
            />
          </div>

          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500 text-center flex flex-col items-center gap-2">
                <Search className="w-8 h-8 text-gray-300" />
                No options found
              </div>
            ) : (
              filteredOptions.map(o => {
                const isSelected = selectedValues.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => handleOptionClick(o.value)}
                    className={`w-full px-4 py-2.5 text-left text-sm rounded-lg flex items-center justify-between transition-colors mb-0.5 ${
                      isSelected 
                        ? 'bg-indigo-50 text-indigo-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{o.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {multiple && selectedValues.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex items-center justify-between font-medium">
              <span>{selectedValues.length} selected</span>
              <button 
                type="button" 
                onClick={handleClearAll}
                className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
