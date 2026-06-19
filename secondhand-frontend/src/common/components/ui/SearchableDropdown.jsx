import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search, X } from 'lucide-react';
const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -6,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
      mass: 0.8
    }
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: 'easeIn'
    }
  }
};
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
  usePortal = false
}) => {
  const {
    t
  } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [portalStyle, setPortalStyle] = useState({});
  const [portalReady, setPortalReady] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const portalRef = useRef(null);
  const searchInputRef = useRef(null);
  const getOptionValue = o => o?.id ?? o?.value ?? o?.name;
  const getOptionLabel = o => o?.label ?? o?.name ?? String(getOptionValue(o) ?? '');
  const filteredOptions = options.filter(o => getOptionLabel(o).toLowerCase().includes(searchTerm.toLowerCase()));
  const toggleDropdown = e => {
    if (disabled) return;
    if (e && e.stopPropagation) e.stopPropagation();
    setIsOpen(prev => {
      const next = !prev;
      if (next) setPortalReady(false);
      return next;
    });
  };
  const handleClickOutside = useCallback(e => {
    const inTrigger = buttonRef.current?.contains(e.target) || dropdownRef.current?.contains(e.target);
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
    const handleKeyDown = e => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  useEffect(() => {
    if (isOpen && !disabled && (portalReady || !usePortal)) searchInputRef.current?.focus();
  }, [isOpen, disabled, portalReady, usePortal]);
  useLayoutEffect(() => {
    if (isOpen && usePortal && buttonRef.current) {
      let rAF = null;
      const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          rAF = requestAnimationFrame(updatePosition);
          return;
        }
        setPortalStyle({
          position: 'fixed',
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          zIndex: 99999,
          opacity: 1,
          pointerEvents: 'auto',
          isolation: 'isolate'
        });
        setPortalReady(true);
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        if (rAF) cancelAnimationFrame(rAF);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, usePortal]);
  const handleOptionClick = value => {
    if (multiple) {
      const newSelection = selectedValues.includes(value) ? selectedValues.filter(v => v !== value) : [...selectedValues, value];
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
      return selectedValues.map(v => options.find(o => getOptionValue(o) === v)).map((o, idx) => o ? getOptionLabel(o) : selectedValues[idx]).join(', ');
    }
    return `${selectedValues.length} selected`;
  };
  const dropdownContent = <motion.div key="searchable-dropdown" ref={usePortal ? portalRef : undefined} variants={dropdownVariants} initial="hidden" animate="visible" exit="exit" className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl shadow-zinc-200/40 border border-zinc-200/50 overflow-hidden" style={usePortal ? portalStyle : {}}>
      <div className="p-3 border-b border-zinc-100/60 relative bg-zinc-50/30">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
        <input ref={searchInputRef} type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={searchPlaceholder} className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 text-xs transition-all tracking-tight wizard-input-glow hover:border-zinc-300" />
      </div>

      <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar overscroll-contain">
        {filteredOptions.length === 0 ? <div className="px-4 py-6 text-xs text-zinc-500 text-center flex flex-col items-center gap-2 tracking-tight">
            <Search className="w-8 h-8 text-zinc-300" />{t("no_options_found")}</div> : filteredOptions.map(o => {
        const optionValue = getOptionValue(o);
        const isSelected = selectedValues.includes(optionValue);
        return <button key={optionValue} type="button" onClick={() => handleOptionClick(optionValue)} className={`w-full px-4 py-2.5 text-left text-xs rounded-lg flex items-center justify-between transition-all duration-150 mb-0.5 tracking-tight ${isSelected ? 'bg-zinc-100/80 text-zinc-900 font-medium' : 'text-zinc-700 hover:bg-zinc-50'}`}>
                <span>{getOptionLabel(o)}</span>
                {isSelected && <motion.span initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            type: 'spring',
            stiffness: 500,
            damping: 25
          }}>
                    <Check className="w-4 h-4 text-zinc-900" />
                  </motion.span>}
              </button>;
      })}
      </div>

      {multiple && selectedValues.length > 0 && <div className="px-4 py-3 border-t border-zinc-100/60 bg-zinc-50/30 text-xs text-zinc-500 flex items-center justify-between font-medium tracking-tight">
          <span>{selectedValues.length}{t("selected")}</span>
          <button type="button" onClick={handleClearAll} className="text-zinc-600 hover:text-zinc-900 hover:underline transition-colors">{t("clear_all")}</button>
        </div>}
    </motion.div>;
  return <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="block text-sm font-semibold text-zinc-900 mb-3 tracking-tight">{label}</label>}

      <button ref={buttonRef} type="button" onClick={toggleDropdown} disabled={disabled} aria-disabled={disabled} className={`w-full px-4 py-3 border rounded-xl text-left flex items-center justify-between transition-all duration-200 tracking-tight focus:outline-none ${disabled ? 'border-zinc-200/60 bg-zinc-50 text-zinc-400 cursor-not-allowed' : isOpen ? 'border-zinc-400 ring-2 ring-zinc-900/5 shadow-sm' : 'border-zinc-200/60 hover:border-zinc-300 hover:shadow-sm'}`}>
        <span className={`truncate text-sm ${selectedValues.length ? 'text-zinc-900 font-medium' : 'text-zinc-400'}`}>
          {getDisplayText()}
        </span>
        <div className="flex items-center gap-2">
          {multiple && selectedValues.length > 0 && <button type="button" onClick={e => {
          e.stopPropagation();
          handleClearAll();
        }} disabled={disabled} className="text-zinc-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full" title={t("clear_all")}>
              <X className="w-4 h-4" />
            </button>}
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${!disabled && isOpen ? 'rotate-180 text-zinc-600' : ''}`} />
        </div>
      </button>

      {usePortal && typeof document !== 'undefined' ? createPortal(<AnimatePresence>
            {isOpen && !disabled && portalReady && dropdownContent}
          </AnimatePresence>, document.body) : <AnimatePresence>
          {!usePortal && isOpen && !disabled && <div className="absolute top-full left-0 right-0 mt-2 z-50">
              {dropdownContent}
            </div>}
        </AnimatePresence>}
    </div>;
};
export default SearchableDropdown;