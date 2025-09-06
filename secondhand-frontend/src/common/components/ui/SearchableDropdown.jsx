import React, { useState, useRef, useEffect, useCallback } from 'react';

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

  const Icon = ({ children, className }) => (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{children}</svg>
  );

  return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}

        <button
            type="button"
            onClick={toggleDropdown}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
        <span className={`truncate ${selectedValues.length ? 'text-slate-900' : 'text-slate-500'}`}>
          {getDisplayText()}
        </span>
          <div className="flex items-center gap-2">
            {multiple && selectedValues.length > 0 && (
                <button type="button" onClick={(e) => { e.stopPropagation(); handleClearAll(); }} className="text-slate-400 hover:text-slate-600 transition-colors" title="Clear all">
                  <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></Icon>
                </button>
            )}
            <Icon className={`transform transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </Icon>
          </div>
        </button>

        {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-64 overflow-hidden">
              <div className="p-3 border-b border-slate-200 relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </Icon>
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm"
                />
              </div>

              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-slate-500 text-center">No options found</div>
                ) : (
                    filteredOptions.map(o => {
                      const isSelected = selectedValues.includes(o.value);
                      return (
                          <button key={o.value} type="button" onClick={() => handleOptionClick(o.value)} className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}>
                            <span>{o.label}</span>
                            {isSelected && multiple && <Icon className="text-btn-primary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></Icon>}
                          </button>
                      );
                    })
                )}
              </div>

              {multiple && selectedValues.length > 0 && (
                  <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-600 flex items-center justify-between">
                    <span>{selectedValues.length} selected</span>
                    <button type="button" onClick={handleClearAll} className="text-slate-500 hover:text-slate-700 transition-colors">Clear all</button>
                  </div>
              )}
            </div>
        )}
      </div>
  );
};

export default SearchableDropdown;
