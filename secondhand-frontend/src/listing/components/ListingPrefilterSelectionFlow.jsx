import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {Search, Check, ChevronRight, ArrowRight, Loader2, Sparkles} from 'lucide-react';
import {useEnums} from '../../common/hooks/useEnums.js';
import {
  createFormRegistry,
  getCreateFlowSelectorSteps,
  getListingTypeOptions,
  getPrefilterSelectors,
} from '../config/listingConfig.js';
import {
  getAuxiliaryUi,
  getCategoryCardClasses,
  getGridCheckDotClass,
  getGridOptionClasses,
  getGridOptionLabelClass,
  getSellPreflowStepSurface,
  PREFLOW_WIZARD_VARIANT,
} from '../config/prefilterFlowUi.js';
import {ROUTES} from '../../common/constants/routes.js';
import {isPrefilterValueFilled} from '../utils/prefilterSelection.js';
import ListingWizard from './ListingWizard.jsx';
import SearchableDropdown from '../../common/components/ui/SearchableDropdown.jsx';

const WIZARD_COPY = {
  create: {
    title: 'Start your listing',
    subtitle: 'Choose a category, then a few quick choices — we open the form with the right fields.',
    categoryTitle: 'What are you selling?',
    categoryDescription: 'You will refine details on the next screen; choices here only pre-fill the form.',
    loading: 'Preparing your listing form…',
    loadingSub: 'Loading the right fields for your category.',
    gridFilterPlaceholder: 'Type to filter…',
    sellStepReassurance: 'These answers pre-fill your draft. You can edit everything before you publish.',
    dependentDropdownHint: 'Choose the options above first — then this step unlocks.',
    emptyFilterTitle: 'No matches',
    emptyFilterSubtitle: 'Try a different search term.',
  },
  browse: {
    title: 'Shop by category',
    subtitle: 'Filter active listings—or skip and see everything',
    categoryTitle: 'Browse by category',
    categoryDescription: 'Where should we narrow the results?',
    loading: 'Loading listings…',
    gridFilterPlaceholder: 'Filter options…',
    emptyFilterTitle: 'No matches found',
    emptyFilterSubtitle: 'Try a different search term',
  },
};

const ListingPrefilterSelectionFlow = ({mode = 'browse', onComplete, onCancel}) => {
  const {enums} = useEnums();
  const completedRef = useRef(false);
  const flowUiVariant = mode === 'create' ? PREFLOW_WIZARD_VARIANT.SELL : PREFLOW_WIZARD_VARIANT.BROWSE;
  const auxUi = useMemo(() => getAuxiliaryUi(flowUiVariant), [flowUiVariant]);
  const flowCopy = useMemo(() => WIZARD_COPY[mode] || WIZARD_COPY.browse, [mode]);
  const sellSurface = mode === 'create' ? getSellPreflowStepSurface() : '';
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
        const categoryGrid = (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {listingTypeOptions.map((type) => {
              const isSelected = selectedType === type.value;
              const card = getCategoryCardClasses(flowUiVariant, isSelected);
              return (
                <button key={type.value} type="button" onClick={() => handleTypeSelect(type.value)} className={card.wrapper}>
                  <div className={card.iconBg}>{type.icon}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-sm font-semibold transition-colors ${card.title}`}>{type.label}</h3>
                    <p className={`mt-0.5 truncate text-xs transition-colors ${card.desc}`}>{type.description}</p>
                  </div>
                  {isSelected ? (
                    <div className={card.checkOuter}>
                      <Check className={card.checkInner} strokeWidth={3} />
                    </div>
                  ) : (
                    <ChevronRight className={`${card.chevron} shrink-0 ${card.trailing}`} />
                  )}
                </button>
              );
            })}
          </div>
        );
        if (sellSurface) {
          return <div className={sellSurface}>{categoryGrid}</div>;
        }
        return categoryGrid;
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
        const searchIconClass =
          flowUiVariant === PREFLOW_WIZARD_VARIANT.BROWSE
            ? 'text-sky-500/80'
            : flowUiVariant === PREFLOW_WIZARD_VARIANT.SELL
              ? 'text-amber-600/70'
              : 'text-gray-400';

        const gridBlock = (
          <div>
            {mode === 'create' && flowCopy.sellStepReassurance ? (
              <p className="mb-4 text-xs leading-relaxed text-stone-600">{flowCopy.sellStepReassurance}</p>
            ) : null}
            {showGridSearch && (
              <div className="relative mb-4">
                <Search className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${searchIconClass}`} />
                <input
                  type="search"
                  value={gridOptionFilter}
                  onChange={(e) => setGridOptionFilter(e.target.value)}
                  placeholder={flowCopy.gridFilterPlaceholder}
                  className={auxUi.gridSearchInput}
                  aria-label="Filter options"
                />
              </div>
            )}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((opt) => {
                const id = opt.id || opt.value;
                const label = opt.label || opt.name;
                const isSelected = String(selectedValue) === String(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectionValue(valueKey, id, selectorIndex)}
                    className={getGridOptionClasses(flowUiVariant, isSelected)}
                  >
                    <span className={getGridOptionLabelClass(flowUiVariant, isSelected)}>{label}</span>
                    {isSelected && (
                      <div className={getGridCheckDotClass(flowUiVariant)}>
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className={auxUi.emptyFilterBox}>
                <p className={auxUi.emptyFilterTitle}>{flowCopy.emptyFilterTitle}</p>
                <p className={auxUi.emptyFilterSubtitle}>{flowCopy.emptyFilterSubtitle}</p>
              </div>
            )}
          </div>
        );
        if (sellSurface) {
          return <div className={sellSurface}>{gridBlock}</div>;
        }
        return gridBlock;
      }

      const options = optionsRaw || [];

      const dropdownBlock = (
        <div>
          <div className={auxUi.dropdownCard}>
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
          {mode === 'create' && !isEnabled ? (
            <p className={auxUi.dependentSelectorHint}>{flowCopy.dependentDropdownHint}</p>
          ) : null}
        </div>
      );
      if (sellSurface) {
        return <div className={sellSurface}>{dropdownBlock}</div>;
      }
      return dropdownBlock;
    },
    [
      auxUi.dependentSelectorHint,
      auxUi.dropdownCard,
      auxUi.emptyFilterBox,
      auxUi.emptyFilterSubtitle,
      auxUi.emptyFilterTitle,
      auxUi.gridSearchInput,
      flowCopy,
      flowUiVariant,
      gridOptionFilter,
      handleTypeSelect,
      listingTypeOptions,
      mode,
      resolveStepOptions,
      selection,
      selectedType,
      selectorSteps,
      sellSurface,
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

  if (mode === 'create' && isReadyToFinish && selectedType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-gray-900" aria-hidden />
          <h2 className="text-[15px] font-medium text-gray-900">{flowCopy.loading}</h2>
          {flowCopy.loadingSub ? <p className="mt-1 text-[13px] text-gray-500">{flowCopy.loadingSub}</p> : null}
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
      <button type="button" onClick={triggerBrowseSearch} className={auxUi.midSearchBtn}>
        <Search className="h-4 w-4" />
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
        title={flowCopy.title}
        subtitle={flowCopy.subtitle}
        steps={selectionSteps}
        currentStep={selectionStep}
        onBack={onCancel}
        onPrev={onSelectionBackOrPrev}
        onNext={onSelectionNext}
        canSubmit={canGoNextSelection}
        renderStep={(step) => renderSelectionStep(step)}
        footerExtra={browseFooterExtra}
        lastStepAction={browseLastStepAction}
        wizardVariant={flowUiVariant}
        headerEyebrow={mode === 'create' ? 'New listing' : 'Shopping'}
        continueLabel={mode === 'create' ? 'Next step' : 'Continue'}
      />
      {mode === 'browse' && (
        <div className="mx-auto max-w-5xl border-t border-slate-200/70 px-6 pb-28 pt-8 text-center">
          <Link to={ROUTES.LISTINGS} className={auxUi.skipLink}>
            Skip and browse all listings
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </>
  );
};

export default ListingPrefilterSelectionFlow;
