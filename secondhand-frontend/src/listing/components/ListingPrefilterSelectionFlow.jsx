import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useEnums } from '../../common/hooks/useEnums.js';
import {
  createFormRegistry,
  getCreateFlowSelectorSteps,
  getListingTypeOptions,
  getPrefilterSelectors,
} from '../config/listingConfig.js';
import { ROUTES } from '../../common/constants/routes.js';
import { isPrefilterValueFilled } from '../utils/prefilterSelection.js';
import ListingWizard from './ListingWizard.jsx';
import { Check, ChevronRight } from 'lucide-react';
import SearchableDropdown from '../../common/components/ui/SearchableDropdown.jsx';

const WIZARD_COPY = {
  create: {
    title: 'Create New Listing',
    subtitle: 'Turn your items into cash in just a few steps',
    categoryTitle: 'Category',
    categoryDescription: 'Choose what you want to list.',
    loading: 'Opening listing form…',
  },
  browse: {
    title: 'Browse by category',
    subtitle: 'Pick a category and filters to see matching listings',
    categoryTitle: 'Category',
    categoryDescription: 'What are you looking for?',
    loading: 'Loading listings…',
  },
};

const ListingPrefilterSelectionFlow = ({ mode = 'browse', onComplete, onCancel }) => {
  const { enums } = useEnums();
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [mode],
  );

  const handleBackToSelection = useCallback(() => {
    setSelectedType(null);
    setSelection({});
    setSelectionStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const partialBrowseSearchEnabled = useMemo(() => {
    if (mode !== 'browse' || !selectedType) return false;
    if (!selectorSteps.length) return true;
    const firstKey = selectorSteps[0]?.initialDataKey;
    return Boolean(firstKey && isPrefilterValueFilled(selection?.[firstKey]));
  }, [mode, selectedType, selectorSteps, selection]);

  const triggerBrowseSearch = useCallback(() => {
    if (mode !== 'browse' || !selectedType) return;
    onComplete({ listingType: selectedType, selection: { ...selection } });
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
        const next = { ...(prev || {}), [key]: value };
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
        return selector.getOptions({ enums, selection: selectionState || {} }) || [];
      }
      return enums?.[selector.enumKey] || [];
    },
    [enums],
  );

  const renderSelectionStep = useCallback(
    (stepId) => {
      if (stepId === 1) {
        return (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {listingTypeOptions.map((type) => {
              const isSelected = selectedType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeSelect(type.value)}
                  className={`group relative flex w-full items-center gap-3.5 rounded-lg border px-4 py-3.5 text-left transition-all duration-150 focus:outline-none ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl transition-colors duration-150 ${
                      isSelected ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 group-hover:bg-gray-100'
                    }`}
                  >
                    {type.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-gray-900">{type.label}</h3>
                    <p className="mt-0.5 truncate text-[11px] text-gray-400">{type.description}</p>
                  </div>
                  {isSelected ? (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
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
            {showGridSearch ? (
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={gridOptionFilter}
                  onChange={(e) => setGridOptionFilter(e.target.value)}
                  placeholder="Filter type, brand, model…"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
                  aria-label="Filter options"
                />
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((opt) => {
                const id = opt.id || opt.value;
                const label = opt.label || opt.name;
                const isSelected = String(selectedValue) === String(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectionValue(valueKey, id, selectorIndex)}
                    className={`relative flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all duration-150 focus:outline-none ${
                      isSelected
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    <span className={`text-[13px] font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
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
            {filtered.length === 0 ? (
              <p className="mt-3 text-center text-sm text-gray-500">No matches. Try another search term.</p>
            ) : null}
          </div>
        );
      }

      const options = optionsRaw || [];

      return (
        <div className="rounded-lg border border-gray-100 bg-white p-5">
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
    onComplete({ listingType: selectedType, selection: { ...selection } });
  }, [isReadyToFinish, mode, onComplete, selectedType, selection]);

  const wizardCopy = WIZARD_COPY[mode] || WIZARD_COPY.browse;

  if (mode === 'create' && isReadyToFinish && selectedType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] text-sm text-gray-500">
        {wizardCopy.loading}
      </div>
    );
  }

  const showBrowseMidSearch =
    mode === 'browse' &&
    partialBrowseSearchEnabled &&
    selectionSteps.length > 1 &&
    selectionStep < selectionSteps.length;

  const browseFooterExtra = showBrowseMidSearch ? (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={triggerBrowseSearch}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-gray-900 shadow-sm transition hover:bg-gray-50"
      >
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
      {mode === 'browse' ? (
        <div className="max-w-4xl mx-auto px-6 pb-28 text-center text-sm text-gray-500">
          <Link to={ROUTES.LISTINGS} className="font-medium text-gray-700 hover:text-gray-900">
            Skip and browse all listings
          </Link>
        </div>
      ) : null}
    </>
  );
};

export default ListingPrefilterSelectionFlow;
