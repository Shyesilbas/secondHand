import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  disabled = false,
  usePortal = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [portalStyle, setPortalStyle] = useState({});
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const portalRef = useRef(null);
  const searchInputRef = useRef(null);

  const getOptionValue = (o) => o?.id ?? o?.value ?? o?.name;
  const getOptionLabel = (o) => o?.label ?? o?.name ?? String(getOptionValue(o) ?? '');

  const filteredOptions = options.filter((o) =>
    getOptionLabel(o).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(prev => !prev);
  };

  const handleClickOutside = useCallback((e) => {
    const inTrigger = dropdownRef.current?.contains(e.target);
    const inPortal = usePortal && portalRef.current?.contains(e.target);
    if (!inTrigger && !inPortal) {
      setIsOpen(false);
      setSearchTerm('');
    }
  }, [usePortal]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (isOpen && !disabled) searchInputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && usePortal && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUpward = spaceBelow < 280;
        setPortalStyle({
          position: 'fixed',
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
          ...(openUpward
            ? { bottom: window.innerHeight - rect.top + 8 }
            : { top: rect.bottom + 8 }),
          maxHeight: openUpward ? Math.min(280, rect.top - 16) : Math.min(280, spaceBelow - 16),
        });
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, usePortal]);

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
      return selectedValues
        .map((v) => options.find((o) => getOptionValue(o) === v))
        .map((o, idx) => (o ? getOptionLabel(o) : selectedValues[idx]))
        .join(', ');
    }
    return `${selectedValues.length} selected`;
  };

  const dropdownContent = isOpen && !disabled && (
    <div
      ref={usePortal ? portalRef : undefined}
      className="bg-white rounded-xl shadow-xl border border-slate-200/60 overflow-hidden animation-fade-in"
      style={usePortal ? portalStyle : {}}
    >
      <div className="p-3 border-b border-slate-200/60 relative bg-slate-50/50">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-slate-500 text-xs focus:outline-none transition-shadow tracking-tight"
        />
      </div>

      <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar overscroll-contain">
        {filteredOptions.length === 0 ? (
          <div className="px-4 py-6 text-xs text-slate-500 text-center flex flex-col items-center gap-2 tracking-tight">
            <Search className="w-8 h-8 text-slate-300" />
            No options found
          </div>
        ) : (
          filteredOptions.map((o) => {
            const optionValue = getOptionValue(o);
            const isSelected = selectedValues.includes(optionValue);
            return (
              <button
                key={optionValue}
                type="button"
                onClick={() => handleOptionClick(optionValue)}
                className={`w-full px-4 py-2.5 text-left text-xs rounded-lg flex items-center justify-between transition-colors mb-0.5 tracking-tight ${
                  isSelected 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{getOptionLabel(o)}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            );
          })
        )}
      </div>

      {multiple && selectedValues.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-200/60 bg-slate-50 text-xs text-slate-500 flex items-center justify-between font-medium tracking-tight">
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
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">{label}</label>}

      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        aria-disabled={disabled}
        className={`w-full px-4 py-3 border rounded-xl text-left flex items-center justify-between transition-all duration-200 tracking-tight ${
          disabled
            ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
            : isOpen 
            ? 'border-indigo-500 ring-4 ring-indigo-500/10' 
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <span className={`truncate text-sm ${selectedValues.length ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {getDisplayText()}
        </span>
        <div className="flex items-center gap-2">
          {multiple && selectedValues.length > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClearAll(); }}
              disabled={disabled}
              className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
              title="Clear all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${!disabled && isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
        </div>
      </button>

      {usePortal && isOpen && !disabled
        ? createPortal(dropdownContent, document.body)
        : !usePortal && isOpen && !disabled && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50">
              {dropdownContent}
            </div>
          )}
    </div>
  );
};

export default SearchableDropdown;
