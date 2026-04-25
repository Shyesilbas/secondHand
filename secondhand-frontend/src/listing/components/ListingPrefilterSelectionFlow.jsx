import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {Search, Check, ChevronRight, ArrowRight, Loader2} from 'lucide-react';
import {useEnums} from '../../common/hooks/useEnums.js';
import {
  createFormRegistry,
  getCreateFlowSelectorSteps,
  getListingTypeOptions,
  getPrefilterSelectors,
} from '../config/listingConfig.js';
import {ROUTES} from '../../common/constants/routes.js';
import {isPrefilterValueFilled} from '../utils/prefilterSelection.js';
import ListingWizard from './ListingWizard.jsx';
import SearchableDropdown from '../../common/components/ui/SearchableDropdown.jsx';

const WIZARD_COPY = {
  create: {
    title: 'Create New Listing',
    subtitle: 'Turn your items into cash in just a few steps',
    categoryTitle: 'Choose a Category',
    categoryDescription: 'Select the type of item you want to list',
    loading: 'Opening listing form…',
  },
  browse: {
    title: 'Browse by Category',
    subtitle: 'Pick a category and filters to find what you need',
    categoryTitle: 'Category',
    categoryDescription: 'What are you looking for?',
    loading: 'Loading listings…',
  },
};

const ListingPrefilterSelectionFlow = ({mode = 'browse', onComplete, onCancel}) => {
  const {enums} = useEnums();
  const completedRef = useRef(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selection, setSelection] = useState({});
  const [selectionStep, setSelectionStep] = useState(1);
  const [gridOptionFilter, setGridOptionFilter] = useState('');

  useEffect(() => {
    completedRef.current = false;
  }, [selectedType]);

  useEffect(() => {
    setGridOptionFilter('');
  }, [selectionStep]);

  const listingTypeOptions = useMemo(() => getListingTypeOptions(), []);

  const selectorSteps = useMemo(() => {
    if (!selectedType) return [];
    if (mode === 'create') {
      return getCreateFlowSelectorSteps(selectedType);
    }
    return getPrefilterSelectors(selectedType).map((s) => ({
      ...s,
      title: s.title || s.label || 'Selection',
    }));
  }, [selectedType, mode]);

  const selectionSteps = useMemo(() => {
    const c = WIZARD_COPY[mode] || WIZARD_COPY.browse;
    const base = [
      {
        id: 1,
        title: c.categoryTitle,
        description: c.categoryDescription,
      },
    ];
    const tail = selectorSteps.map((s, idx) => ({
      id: idx + 2,
      title: s.title || 'Selection',
      description: s.description || '',
    }));
    return [...base, ...tail];
  }, [selectorSteps, mode]);

  const handleTypeSelect = useCallback(
    (type) => {
      setSelectedType(type);
      setSelection({});
      const steps =
        mode === 'create'
          ? getCreateFlowSelectorSteps(type)
          : getPrefilterSelectors(type).map((s) => ({
              ...s,
              title: s.title || s.label || 'Selection',
            }));
      setSelectionStep(steps.length ? 2 : 1);
      window.scrollTo({top: 0, behavior: 'smooth'});
    },
    [mode],
  );

  const handleBackToSelection = useCallback(() => {
    setSelectedType(null);
    setSelection({});
    setSelectionStep(1);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  const partialBrowseSearchEnabled = useMemo(() => {
    if (mode !== 'browse' || !selectedType) return false;
    return true;
  }, [mode, selectedType]);

  const triggerBrowseSearch = useCallback(() => {
    if (mode !== 'browse' || !selectedType) return;
    onComplete({listingType: selectedType, selection: {...selection}});
  }, [mode, onComplete, selectedType, selection]);

  const canGoNextSelection = useMemo(() => {
    if (selectionStep === 1) return Boolean(selectedType);
    const idx = selectionStep - 2;
    const selector = selectorSteps[idx];
    if (!selector) return false;
    return isPrefilterValueFilled(selection?.[selector.initialDataKey]);
  }, [selectedType, selection, selectionStep, selectorSteps]);

  const onSelectionPrev = useCallback(() => {
    if (selectionStep <= 1) {
      handleBackToSelection();
      return;
    }
    setSelectionStep((s) => Math.max(s - 1, 1));
  }, [handleBackToSelection, selectionStep]);

  const onSelectionNext = useCallback(() => {
    if (!selectedType) return;
    const maxStep = selectionSteps.length;
    if (selectionStep < maxStep) {
      setSelectionStep((s) => Math.min(s + 1, maxStep));
    }
  }, [selectedType, selectionStep, selectionSteps.length]);

  const onSelectionBackOrPrev = useCallback(() => {
    if (selectionStep === 1) {
      onCancel();
      return;
    }
    onSelectionPrev();
  }, [onCancel, onSelectionPrev, selectionStep]);

  const setSelectionValue = useCallback(
    (key, value, currentIndex) => {
      setSelection((prev) => {
        const next = {...(prev || {}), [key]: value};
        for (let i = currentIndex + 1; i < selectorSteps.length; i += 1) {
          const k = selectorSteps[i]?.initialDataKey;
          if (k) next[k] = null;
        }
        return next;
      });
    },
    [selectorSteps],
  );

  const resolveStepOptions = useCallback(
    (selector, selectionState) => {
      if (!selector) return [];
      if (typeof selector.getOptions === 'function') {
        return selector.getOptions({enums, selection: selectionState || {}}) || [];
      }
      return enums?.[selector.enumKey] || [];
    },
    [enums],
  );

  const renderSelectionStep = useCallback(
    (stepId) => {
      if (stepId === 1) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listingTypeOptions.map((type) => {
              const isSelected = selectedType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeSelect(type.value)}
                  className={`group relative flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-200 focus:outline-none ${
                    isSelected
                      ? 'border-gray-900 bg-gray-900 shadow-lg shadow-gray-900/10'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl transition-all duration-200 ${
                    isSelected ? 'bg-white/15 text-white' : 'bg-gray-50 text-gray-500 group-hover:bg-gray-100'
                  }`}>
                    {type.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-sm font-semibold transition-colors ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {type.label}
                    </h3>
                    <p className={`mt-0.5 truncate text-xs transition-colors ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                      {type.description}
                    </p>
                  </div>
                  {isSelected ? (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
                      <Check className="h-3.5 w-3.5 text-gray-900" strokeWidth={3} />
                    </div>
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-200 transition-colors group-hover:text-gray-400" />
                  )}
                </button>
              );
            })}
          </div>
        );
      }

      const selectorIndex = stepId - 2;
      const selector = selectorSteps[selectorIndex];
      if (!selector) return null;

      const valueKey = selector.initialDataKey;
      const selectedValue = selection?.[valueKey] ?? null;
      const dependsOn = Array.isArray(selector.dependsOn) ? selector.dependsOn : [];
      const isEnabled = dependsOn.every((k) => isPrefilterValueFilled(selection?.[k]));

      const optionsRaw = resolveStepOptions(selector, selection);

      if ((selector.kind || 'grid') === 'grid') {
        const options = optionsRaw || [];
        const qf = (gridOptionFilter || '').trim().toLowerCase();
        const filtered =
          qf.length > 0
            ? options.filter((opt) => {
                const label = String(opt.label || opt.name || opt.id || opt.value || '').toLowerCase();
                return label.includes(qf);
              })
            : options;
        const showGridSearch = options.length > 6;

        return (
          <div>
            {showGridSearch && (
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={gridOptionFilter}
                  onChange={(e) => setGridOptionFilter(e.target.value)}
                  placeholder="Filter options..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10 focus:outline-none transition-all duration-200"
                  aria-label="Filter options"
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filtered.map((opt) => {
                const id = opt.id || opt.value;
                const label = opt.label || opt.name;
                const isSelected = String(selectedValue) === String(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectionValue(valueKey, id, selectorIndex)}
                    className={`relative flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 focus:outline-none ${
                      isSelected
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {label}
                    </span>
                    {isSelected && (
                      <div className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className="mt-6 text-center py-8">
                <p className="text-sm text-gray-500 font-medium">No matches found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        );
      }

      const options = optionsRaw || [];

      return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <SearchableDropdown
            options={options}
            selectedValues={selectedValue ? [selectedValue] : []}
            onSelectionChange={(vals) => {
              const nextValue = Array.isArray(vals) ? (vals[0] ?? null) : null;
              setSelectionValue(valueKey, nextValue, selectorIndex);
            }}
            label={selector.title || 'Select'}
            placeholder={isEnabled ? 'Select…' : 'Complete previous steps first'}
            multiple={false}
            disabled={!isEnabled}
          />
        </div>
      );
    },
    [
      gridOptionFilter,
      handleTypeSelect,
      listingTypeOptions,
      resolveStepOptions,
      selection,
      selectedType,
      selectorSteps,
      setSelectionValue,
    ],
  );

  const SelectedForm = selectedType ? createFormRegistry[selectedType] : null;

  const isReadyToFinish = useMemo(() => {
    if (!selectedType) return false;
    if (mode === 'create') {
      if (!SelectedForm) return false;
      if (!selectorSteps.length) return true;
      return selectorSteps.every((s) => isPrefilterValueFilled(selection?.[s.initialDataKey]));
    }
    return false;
  }, [SelectedForm, mode, selectedType, selection, selectorSteps]);

  useLayoutEffect(() => {
    if (mode !== 'create') return;
    if (!isReadyToFinish || !selectedType || completedRef.current) return;
    completedRef.current = true;
    onComplete({listingType: selectedType, selection: {...selection}});
  }, [isReadyToFinish, mode, onComplete, selectedType, selection]);

  const wizardCopy = WIZARD_COPY[mode] || WIZARD_COPY.browse;

  if (mode === 'create' && isReadyToFinish && selectedType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/80">
        <div className="text-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">{wizardCopy.loading}</p>
        </div>
      </div>
    );
  }

  const showBrowseMidSearch =
    mode === 'browse' &&
    partialBrowseSearchEnabled &&
    selectionStep > 1;

  const browseFooterExtra = showBrowseMidSearch ? (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={triggerBrowseSearch}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
      >
        <Search className="w-4 h-4" />
        Search listings
      </button>
    </div>
  ) : null;

  const browseLastStepAction =
    mode === 'browse' && selectedType
      ? {
          label: 'Search listings',
          onClick: triggerBrowseSearch,
        }
      : null;

  return (
    <>
      <ListingWizard
        title={wizardCopy.title}
        subtitle={wizardCopy.subtitle}
        steps={selectionSteps}
        currentStep={selectionStep}
        onBack={onCancel}
        onPrev={onSelectionBackOrPrev}
        onNext={onSelectionNext}
        canSubmit={canGoNextSelection}
        renderStep={(step) => renderSelectionStep(step)}
        footerExtra={browseFooterExtra}
        lastStepAction={browseLastStepAction}
      />
      {mode === 'browse' && (
        <div className="max-w-5xl mx-auto px-6 pb-28 text-center">
          <Link
            to={ROUTES.LISTINGS}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors"
          >
            Skip and browse all listings
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </>
  );
};

export default ListingPrefilterSelectionFlow;
