import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  RotateCcw,
  Box,
  Compass,
  CheckCircle2,
  ListFilter,
  X
} from 'lucide-react';
import { useEnums } from '../../common/hooks/useEnums.js';
import {
  getListingTypeOptions,
  getPrefilterSelectors,
  getCreateFlowSelectorSteps,
  createFormRegistry,
  isCreateSelectionComplete,
} from '../config/listingConfig.js';
import { isPrefilterValueFilled } from '../utils/prefilterSelection.js';
import { findEngine } from '../../vehicle/utils/vehicleCatalogUtils.js';
import { ROUTES } from '../../common/constants/routes.js';
import SearchableDropdown from '../../common/components/ui/SearchableDropdown.jsx';

const CATEGORY_META = {
  VEHICLE: {
    badge: 'Model & Kasa',
    icon: '🚗'
  },
  ELECTRONICS: {
    badge: 'Cihaz & Marka',
    icon: '📱'
  },
  REAL_ESTATE: {
    badge: 'Konut & İlan',
    icon: '🏠'
  },
  CLOTHING: {
    badge: 'Giyim & Beden',
    icon: '👕'
  },
  BOOKS: {
    badge: 'Kitap & Tür',
    icon: '📚'
  },
  SPORTS: {
    badge: 'Spor & Ekipman',
    icon: '⚽'
  }
};

export const StudioPrefilterFlow = ({ mode = 'browse', onComplete, onCancel }) => {
  const { enums } = useEnums();
  const [selectedType, setSelectedType] = useState(null);
  const [selection, setSelection] = useState({});
  const [selectionStep, setSelectionStep] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'compact'
  const autoAdvanceRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
  }, [selectedType]);

  const SelectedForm = selectedType ? createFormRegistry[selectedType] : null;

  const isReadyToFinish = useMemo(() => {
    if (!selectedType) return false;
    if (mode === 'create') {
      if (!SelectedForm) return false;
      return isCreateSelectionComplete(selectedType, selection, enums);
    }
    return false;
  }, [SelectedForm, enums, mode, selectedType, selection]);

  useEffect(() => {
    if (mode !== 'create') return;
    if (!isReadyToFinish || !selectedType || completedRef.current) return;
    completedRef.current = true;
    onComplete({
      listingType: selectedType,
      selection: { ...selection }
    });
  }, [isReadyToFinish, mode, onComplete, selectedType, selection]);

  const listingTypeOptions = useMemo(() => getListingTypeOptions(), []);

  // Compute active selector steps
  const selectorSteps = useMemo(() => {
    if (!selectedType) return [];
    const baseSteps = mode === 'create'
      ? getCreateFlowSelectorSteps(selectedType)
      : getPrefilterSelectors(selectedType).map(s => ({
          ...s,
          title: s.title || s.label || 'Selection'
        }));

    const ctx = {
      formData: selection,
      selection,
      enums,
      getName: (enumKey, idOrValue, { upper = false } = {}) => {
        const list = enums?.[enumKey] || [];
        const found = list.find(x => String(x?.id ?? x?.value ?? '') === String(idOrValue ?? ''));
        const name = found?.name || found?.label || '';
        return upper ? name.toUpperCase() : name;
      }
    };

    return baseSteps.filter(s => {
      if (typeof s.visibleWhen === 'function') {
        return Boolean(s.visibleWhen(ctx));
      }
      return true;
    });
  }, [selectedType, mode, selection, enums]);

  // Overall steps array
  const steps = useMemo(() => {
    const base = [{ id: 1, title: mode === 'create' ? 'Category' : 'Main Category', key: 'category' }];
    const tail = selectorSteps.map((s, idx) => ({
      id: idx + 2,
      title: s.title || 'Option',
      key: s.initialDataKey
    }));
    return [...base, ...tail];
  }, [selectorSteps, mode]);

  const currentSelector = useMemo(() => {
    if (selectionStep <= 1) return null;
    return selectorSteps[selectionStep - 2] || null;
  }, [selectionStep, selectorSteps]);

  // Handle Category Select
  const handleCategorySelect = useCallback((type) => {
    setSelectedType(type);
    setSelection({});
    setSearchFilter('');
    const stepsCount = mode === 'create'
      ? getCreateFlowSelectorSteps(type).length
      : getPrefilterSelectors(type).length;

    if (stepsCount > 0) {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => {
        setSelectionStep(2);
      }, 300);
    } else {
      setSelectionStep(1);
    }
  }, [mode]);

  // Handle Value Select
  const setSelectionValue = useCallback((key, value, selectorIdx) => {
    setSelection(prev => {
      const next = { ...(prev || {}), [key]: value };
      for (let i = selectorIdx + 1; i < selectorSteps.length; i += 1) {
        const k = selectorSteps[i]?.initialDataKey;
        if (k) next[k] = null;
      }
      if (key === 'vehicleEngineId' && value) {
        const eng = findEngine(enums, value);
        if (eng?.fuelType) next.fuelType = eng.fuelType;
      }
      return next;
    });
  }, [selectorSteps, enums]);

  // Resolve options for current selector
  const resolvedOptions = useMemo(() => {
    if (!currentSelector) return [];
    if (typeof currentSelector.getOptions === 'function') {
      return currentSelector.getOptions({ enums, selection }) || [];
    }
    if (currentSelector.options) return currentSelector.options;
    return enums?.[currentSelector.enumKey] || [];
  }, [currentSelector, enums, selection]);

  // Filtered options based on search input
  const filteredOptions = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    if (!query) return resolvedOptions;
    return resolvedOptions.filter(opt => {
      const label = String(opt.label || opt.name || opt.value || opt.id || '').toLowerCase();
      return label.includes(query);
    });
  }, [resolvedOptions, searchFilter]);

  // Summary spec list for display
  const summarySpecs = useMemo(() => {
    if (!selectedType) return [];
    const items = [];
    const catOpt = listingTypeOptions.find(o => o.value === selectedType);
    items.push({ label: 'Category', value: catOpt?.label || selectedType, key: 'type' });

    selectorSteps.forEach(s => {
      const val = selection?.[s.initialDataKey];
      if (isPrefilterValueFilled(val)) {
        const opts = typeof s.getOptions === 'function' ? s.getOptions({ enums, selection }) : (s.options || enums?.[s.enumKey] || []);
        const found = opts.find(o => String(o.id || o.value || '') === String(val));
        items.push({
          label: s.title || 'Spec',
          value: found?.label || found?.name || String(val),
          key: s.initialDataKey
        });
      }
    });
    return items;
  }, [selectedType, listingTypeOptions, selectorSteps, selection, enums]);

  const handleFinishSearch = useCallback(() => {
    if (!selectedType) return;
    onComplete({
      listingType: selectedType,
      selection: { ...selection }
    });
  }, [selectedType, selection, onComplete]);

  const meta = selectedType ? CATEGORY_META[selectedType] || CATEGORY_META.VEHICLE : null;

  return (
    <div className="relative min-h-[85vh] w-full bg-background-secondary text-text-primary font-sans overflow-hidden rounded-3xl border border-border-light shadow-2xl backdrop-blur-2xl">
      {/* Dynamic Background Glow Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-50 animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl opacity-40 animate-pulse" />

      {/* Top Header Command Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-border-light bg-background-primary/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="group flex items-center gap-2 rounded-xl border border-border-light bg-background-secondary px-3.5 py-2 text-xs font-semibold text-text-secondary transition-all hover:border-border-focus hover:bg-background-primary hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Cancel</span>
          </button>
          <div className="h-4 w-[1px] bg-border-light" />
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary text-xs font-bold ring-1 ring-primary/30">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-text-primary">
                {mode === 'create' ? 'Interactive Listing Builder' : 'Smart Catalog Studio'}
              </h2>
              <p className="text-[11px] text-text-secondary">
                {selectedType ? `${summarySpecs.length} specs configured` : 'Select a primary category to start'}
              </p>
            </div>
          </div>
        </div>

        {/* Step Pill Counter */}
        <div className="flex items-center gap-2">
          {steps.map(st => {
            const isActive = selectionStep === st.id;
            const isDone = selectionStep > st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => isDone && setSelectionStep(st.id)}
                disabled={!isDone}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 ring-2 ring-primary/40'
                    : isDone
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer'
                    : 'bg-background-secondary text-text-muted border border-border-light'
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : st.id}
                <span className="hidden sm:inline">{st.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3-Column Studio Body */}
      <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        {/* COLUMN 1: Visual Timeline & Active Breadcrumbs (Left 3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-border-light bg-background-primary p-4 backdrop-blur-xl">
            <h3 className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-secondary">
              <span>Configuration Path</span>
              <RotateCcw
                className="h-3.5 w-3.5 cursor-pointer text-text-muted transition-colors hover:text-text-primary"
                onClick={() => {
                  setSelectedType(null);
                  setSelection({});
                  setSelectionStep(1);
                }}
              />
            </h3>

            <div className="space-y-3">
              {/* Category Step Card */}
              <div
                onClick={() => setSelectionStep(1)}
                className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                  selectionStep === 1
                    ? 'border-primary/50 bg-primary/10 shadow-md ring-1 ring-primary/30'
                    : selectedType
                    ? 'border-border-light bg-background-primary hover:border-border-focus'
                    : 'border-dashed border-border-light bg-background-secondary/50 text-text-muted'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background-secondary text-base shadow-sm">
                    {meta?.icon || '📦'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-text-secondary">Category</p>
                    <p className="text-xs font-bold text-text-primary truncate">
                      {selectedType ? listingTypeOptions.find(o => o.value === selectedType)?.label : 'Not Selected'}
                    </p>
                  </div>
                </div>
                {selectedType && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
              </div>

              {/* Dynamic Steps List */}
              {selectorSteps.map((st, idx) => {
                const stepNum = idx + 2;
                const isCurrent = selectionStep === stepNum;
                const val = selection?.[st.initialDataKey];
                const isFilled = isPrefilterValueFilled(val);
                const opts = typeof st.getOptions === 'function' ? st.getOptions({ enums, selection }) : (st.options || enums?.[st.enumKey] || []);
                const foundObj = opts.find(o => String(o.id || o.value || '') === String(val));
                const displayVal = foundObj?.label || foundObj?.name || (isFilled ? String(val) : 'Select...');

                return (
                  <div
                    key={st.initialDataKey}
                    onClick={() => (isFilled || isCurrent) && setSelectionStep(stepNum)}
                    className={`relative flex items-center justify-between rounded-xl border p-3 transition-all ${
                      isCurrent
                        ? 'border-primary/50 bg-primary/10 shadow-md ring-1 ring-primary/30'
                        : isFilled
                        ? 'border-border-light bg-background-primary cursor-pointer hover:border-border-focus'
                        : 'border-border-light bg-background-secondary/40 text-text-muted cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-text-secondary">{st.title}</p>
                      <p className={`text-xs font-semibold truncate ${isFilled ? 'text-text-primary' : 'text-text-muted'}`}>
                        {displayVal}
                      </p>
                    </div>
                    {isFilled && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMN 2: Dynamic Studio Selection Area (Center 6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <AnimatePresence mode="wait">
            {/* STEP 1: Category Selection */}
            {selectionStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-border-light bg-background-primary p-5 backdrop-blur-xl">
                  <h3 className="text-lg font-bold tracking-tight text-text-primary">
                    Select Product Category
                  </h3>
                  <p className="mt-1 text-xs text-text-secondary">
                    Choose a category to automatically unlock tailored catalog models, brands, and specifications.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {listingTypeOptions.map(opt => {
                      const isSel = selectedType === opt.value;
                      const catMeta = CATEGORY_META[opt.value] || CATEGORY_META.VEHICLE;

                      return (
                        <motion.button
                          key={opt.value}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => handleCategorySelect(opt.value)}
                          className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                            isSel
                              ? `border-primary bg-gradient-to-br ${catMeta.gradient} text-white shadow-xl ${catMeta.glow}`
                              : 'border-border-light bg-background-secondary/60 hover:border-border-focus hover:bg-background-primary'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-3xl">{opt.icon}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isSel ? 'bg-white/20 text-white backdrop-blur-md' : catMeta.lightBg}`}>
                              {catMeta.badge}
                            </span>
                          </div>

                          <div className="mt-4">
                            <h4 className={`text-sm font-extrabold tracking-tight ${isSel ? 'text-white' : 'text-text-primary'}`}>{opt.label}</h4>
                            <p className={`mt-1 text-[11px] line-clamp-1 ${isSel ? 'text-white/90' : 'text-text-secondary'}`}>
                              {opt.description}
                            </p>
                          </div>

                          {isSel && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary shadow-md"
                            >
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2+: Grid Selection */}
            {selectionStep > 1 && currentSelector && (
              <motion.div
                key={`step-${selectionStep}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-border-light bg-background-primary p-5 backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-text-primary">
                        {currentSelector.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {currentSelector.description || 'Select an option to refine options.'}
                      </p>
                    </div>
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 rounded-xl bg-background-secondary p-1 border border-border-light">
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`rounded-lg p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
                      >
                        <Box className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('compact')}
                        className={`rounded-lg p-1.5 transition-colors ${viewMode === 'compact' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
                      >
                        <ListFilter className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Search Input */}
                  {resolvedOptions.length > 5 && (
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        placeholder={`Filter ${resolvedOptions.length} ${currentSelector.title.toLowerCase()}...`}
                        className="w-full rounded-xl border border-border-light bg-background-secondary/80 py-2.5 pl-10 pr-10 text-xs text-text-primary placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {searchFilter && (
                        <button
                          type="button"
                          onClick={() => setSearchFilter('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Options List */}
                  <div className={`max-h-[380px] overflow-y-auto pr-1 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : 'space-y-1.5'}`}>
                    {filteredOptions.map(opt => {
                      const id = opt.id || opt.value;
                      const label = opt.label || opt.name;
                      const isSel = String(selection?.[currentSelector.initialDataKey]) === String(id);

                      return (
                        <motion.button
                          key={id}
                          whileHover={{ scale: 1.01, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => {
                            const nextSelection = { ...selection, [currentSelector.initialDataKey]: id };
                            setSelectionValue(currentSelector.initialDataKey, id, selectionStep - 2);

                            if (selectionStep < steps.length) {
                              setSelectionStep(s => s + 1);
                              setSearchFilter('');
                            } else if (mode === 'create') {
                              onComplete({
                                listingType: selectedType,
                                selection: nextSelection
                              });
                            }
                          }}
                          className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-left transition-all ${
                            isSel
                              ? 'border-primary bg-primary/10 text-primary font-bold shadow-lg ring-1 ring-primary/30'
                              : 'border-border-light bg-background-secondary/50 text-text-primary hover:border-border-focus hover:bg-background-primary'
                          }`}
                        >
                          <span className="text-xs font-semibold truncate">{label}</span>
                          {isSel && (
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {filteredOptions.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border-light p-8 text-center">
                      <p className="text-xs font-bold text-text-primary">No matching options</p>
                      <p className="mt-1 text-[11px] text-text-secondary">Try clearing your search query.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* COLUMN 3: Live Preview & Action Card (Right 3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-border-light bg-background-primary p-5 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>Live Summary</span>
            </h3>

            {summarySpecs.length > 0 ? (
              <div className="space-y-2">
                {summarySpecs.map(item => (
                  <div key={item.key} className="flex items-center justify-between rounded-lg bg-background-secondary/80 p-2.5 border border-border-light">
                    <span className="text-[11px] font-medium text-text-secondary">{item.label}</span>
                    <span className="text-xs font-bold text-text-primary max-w-[120px] truncate">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border-light p-6 text-center">
                <Layers className="mx-auto h-6 w-6 text-text-muted" />
                <p className="mt-2 text-xs font-medium text-text-secondary">No active selections yet.</p>
              </div>
            )}

            {/* Launch Search Button (Browse Mode) */}
            {mode === 'browse' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={!selectedType}
                onClick={handleFinishSearch}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-primary-hover px-4 py-3 text-xs font-bold text-white shadow-xl shadow-primary/25 transition-all hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{selectedType ? 'Apply Filters & Search' : 'Select Category to Search'}</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}

            {/* Transition to Listing Form Button (Create Mode) */}
            {mode === 'create' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={!selectedType}
                onClick={() => {
                  if (selectedType) {
                    onComplete({
                      listingType: selectedType,
                      selection: { ...selection }
                    });
                  }
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-primary-hover px-4 py-3 text-xs font-bold text-white shadow-xl shadow-primary/25 transition-all hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue to Listing Form</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}

            {/* Direct All Listings Link */}
            {mode === 'browse' && (
              <Link
                to={ROUTES.LISTINGS}
                className="block text-center text-[11px] font-semibold text-text-secondary hover:text-primary transition-colors mt-2"
              >
                Or browse all listings without filters →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioPrefilterFlow;
