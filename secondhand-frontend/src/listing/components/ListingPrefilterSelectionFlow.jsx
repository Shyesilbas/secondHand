import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Search, Check, ChevronRight, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useEnums } from '../../common/hooks/useEnums.js';
import { createFormRegistry, getCreateFlowSelectorSteps, getListingTypeOptions, getPrefilterSelectors, isCreateSelectionComplete } from '../config/listingConfig.js';
import { getAuxiliaryUi, getCategoryCardClasses, getGridCheckDotClass, getGridOptionClasses, getGridOptionLabelClass, PREFLOW_WIZARD_VARIANT } from '../config/prefilterFlowUi.js';
import { ROUTES } from '../../common/constants/routes.js';
import { isPrefilterValueFilled } from '../utils/prefilterSelection.js';
import { findEngine } from '../../vehicle/utils/vehicleCatalogUtils.js';
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
    emptyFilterSubtitle: 'Try a different search term.'
  },
  browse: {
    title: 'Shop by category',
    subtitle: 'Filter active listings—or skip and see everything',
    categoryTitle: 'Browse by category',
    categoryDescription: 'Where should we narrow the results?',
    loading: 'Loading listings…',
    gridFilterPlaceholder: 'Filter options…',
    emptyFilterTitle: 'No matches found',
    emptyFilterSubtitle: 'Try a different search term'
  }
};

/* Stagger animation for grid items */
const gridContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03
    }
  }
};
const gridItemVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.97
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 28
    }
  }
};
const ListingPrefilterSelectionFlow = ({
  mode = 'browse',
  onComplete,
  onCancel
}) => {
  const {
    t
  } = useTranslation();
  const {
    enums
  } = useEnums();
  const completedRef = useRef(false);
  const autoAdvanceTimeoutRef = useRef(null);
  const flowUiVariant = mode === 'create' ? PREFLOW_WIZARD_VARIANT.SELL : PREFLOW_WIZARD_VARIANT.BROWSE;
  const auxUi = useMemo(() => getAuxiliaryUi(flowUiVariant), [flowUiVariant]);
  const flowCopy = useMemo(() => WIZARD_COPY[mode] || WIZARD_COPY.browse, [mode]);
  const [selectedType, setSelectedType] = useState(null);
  const [selection, setSelection] = useState({});
  const [selectionStep, setSelectionStep] = useState(1);
  const [gridOptionFilter, setGridOptionFilter] = useState('');
  useEffect(() => {
    completedRef.current = false;
  }, [selectedType]);
  useEffect(() => {
    setGridOptionFilter('');

    // Clear any pending auto-advance when step changes manually or otherwise
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, [selectionStep]);
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);
  const listingTypeOptions = useMemo(() => getListingTypeOptions(), []);
  const selectorSteps = useMemo(() => {
    if (!selectedType) return [];
    const baseSteps = mode === 'create' ? getCreateFlowSelectorSteps(selectedType) : getPrefilterSelectors(selectedType).map(s => ({
      ...s,
      title: s.title || s.label || 'Selection'
    }));
    const ctx = {
      formData: selection,
      selection,
      enums,
      getName: (enumKey, idOrValue, {
        upper = false
      } = {}) => {
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
  const selectionSteps = useMemo(() => {
    const c = WIZARD_COPY[mode] || WIZARD_COPY.browse;
    const base = [{
      id: 1,
      title: c.categoryTitle,
      description: c.categoryDescription
    }];
    const tail = selectorSteps.map((s, idx) => ({
      id: idx + 2,
      title: s.title || 'Selection',
      description: s.description || ''
    }));
    return [...base, ...tail];
  }, [selectorSteps, mode]);
  const handleTypeSelect = useCallback(type => {
    setSelectedType(type);
    setSelection({});
    const steps = mode === 'create' ? getCreateFlowSelectorSteps(type) : getPrefilterSelectors(type).map(s => ({
      ...s,
      title: s.title || s.label || 'Selection'
    }));

    // Auto-advance to step 2 after a brief delay to show category selection
    if (steps.length > 0) {
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        setSelectionStep(2);
      }, 350);
    } else {
      setSelectionStep(1);
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [mode]);
  const handleBackToSelection = useCallback(() => {
    setSelectedType(null);
    setSelection({});
    setSelectionStep(1);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  const partialBrowseSearchEnabled = useMemo(() => {
    if (mode !== 'browse' || !selectedType) return false;
    return true;
  }, [mode, selectedType]);
  const triggerBrowseSearch = useCallback(() => {
    if (mode !== 'browse' || !selectedType) return;
    onComplete({
      listingType: selectedType,
      selection: {
        ...selection
      }
    });
  }, [mode, onComplete, selectedType, selection]);
  const canGoNextSelection = useMemo(() => {
    if (selectionStep === 1) return Boolean(selectedType);
    const idx = selectionStep - 2;
    const selector = selectorSteps[idx];
    if (!selector) return false;
    if (selector.optional) return true;
    return isPrefilterValueFilled(selection?.[selector.initialDataKey]);
  }, [selectedType, selection, selectionStep, selectorSteps]);
  const onSelectionPrev = useCallback(() => {
    if (selectionStep <= 1) {
      handleBackToSelection();
      return;
    }
    setSelectionStep(s => Math.max(s - 1, 1));
  }, [handleBackToSelection, selectionStep]);
  const onSelectionNext = useCallback(() => {
    if (!selectedType) return;
    const maxStep = selectionSteps.length;
    if (selectionStep < maxStep) {
      setSelectionStep(s => Math.min(s + 1, maxStep));
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [selectedType, selectionStep, selectionSteps.length]);
  const onSelectionBackOrPrev = useCallback(() => {
    if (selectionStep === 1) {
      onCancel();
      return;
    }
    onSelectionPrev();
  }, [onCancel, onSelectionPrev, selectionStep]);
  const setSelectionValue = useCallback((key, value, currentIndex) => {
    setSelection(prev => {
      const next = {
        ...(prev || {}),
        [key]: value
      };
      for (let i = currentIndex + 1; i < selectorSteps.length; i += 1) {
        const k = selectorSteps[i]?.initialDataKey;
        if (k) next[k] = null;
      }
      if (key === 'vehicleEngineId' && value) {
        const eng = findEngine(enums, value);
        if (eng?.fuelType) next.fuelType = eng.fuelType;
      }

      // Auto-derive electronics attributes in pre-form flow
      if (key === 'electronicModelId' && value) {
        const m = (enums?.electronicModels || []).find(x => String(x?.id ?? '') === String(value));
        if (m) {
          const modelName = String(m?.name || '');
          if (modelName.includes(' > ')) {
            const parts = modelName.split(' > ').map(p => p.trim());
            const specPart = parts[parts.length - 1];
            if (specPart) {
              const specLower = specPart.toLowerCase();
              if (specLower.includes('/')) {
                const specSub = specLower.split('/');
                const ramStr = specSub[0].replace('gb', '').trim();
                let storageStr = specSub[1].replace('gb', '').replace('tb', '').trim();
                const isTB = specSub[1].includes('tb');
                const parsedRam = parseInt(ramStr, 10);
                let parsedStorage = parseInt(storageStr, 10);
                if (isTB) parsedStorage = parsedStorage * 1024;
                if (!isNaN(parsedRam)) next.ram = parsedRam;
                if (!isNaN(parsedStorage)) next.storage = parsedStorage;
              } else if (specLower.endsWith('gb')) {
                const storageVal = parseInt(specLower.replace('gb', '').trim(), 10);
                if (!isNaN(storageVal)) next.storage = storageVal;
              } else if (specLower.endsWith('tb')) {
                const storageVal = parseInt(specLower.replace('tb', '').trim(), 10) * 1024;
                if (!isNaN(storageVal)) next.storage = storageVal;
              }
            }
          }
        }
      }
      return next;
    });
  }, [selectorSteps, enums]);
  const resolveStepOptions = useCallback((selector, selectionState) => {
    if (!selector) return [];
    if (typeof selector.getOptions === 'function') {
      return selector.getOptions({
        enums,
        selection: selectionState || {}
      }) || [];
    }
    if (selector.options) {
      return selector.options;
    }
    return enums?.[selector.enumKey] || [];
  }, [enums]);
  const renderSelectionStep = useCallback(stepId => {
    if (stepId === 1) {
      const categoryGrid = <div className="space-y-4">
            {mode === 'browse' && <motion.div initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }} className="flex flex-col gap-4 rounded-xl border border-primary-200 bg-primary-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background-primary text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-text-primary">{t("just_want_to_look_around") || "Tüm İlanları Keşfedin"}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">{t("skip_selecting_a_category_and_filters_to") || "Kategori ve filtre seçmeden doğrudan tüm aktif ilanları listeleyin."}</p>
                  </div>
                </div>
                <Link to={ROUTES.LISTINGS} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover">
                  <span>{t("browse_all_listings") || "Tüm İlanlara Bak"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>}
            <motion.div variants={gridContainerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {listingTypeOptions.map(type => {
            const isSelected = selectedType === type.value;
            const card = getCategoryCardClasses(flowUiVariant, isSelected, type.value);
            const badgeText = {
              VEHICLE: '630+ Models & Kasa',
              ELECTRONICS: '1,200+ Models',
              REAL_ESTATE: '27 Property Types',
              CLOTHING: 'Brands & Sizes',
              BOOKS: 'Genres & Formats',
              SPORTS: 'Disciplines & Gear'
            }[type.value] || 'Catalog Data';

            return <motion.button key={type.value} variants={gridItemVariants} whileHover={{
              y: -3,
              scale: 1.015,
            }} whileTap={{
              scale: 0.98
            }} type="button" onClick={() => handleTypeSelect(type.value)} className={card.wrapper}>
                    <div className={card.iconBg}>{type.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold text-text-primary transition-colors ${card.title}`}>{type.label}</h3>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                          {badgeText}
                        </span>
                      </div>
                      <p className={`mt-1 text-left text-xs transition-colors ${card.desc}`}>{type.description}</p>
                    </div>
                    {isSelected ? <motion.div initial={{
                scale: 0,
                rotate: -45
              }} animate={{
                scale: 1,
                rotate: 0
              }} transition={{
                type: 'spring',
                stiffness: 500,
                damping: 22
              }} className={card.checkOuter}>
                        <Check className={card.checkInner} strokeWidth={3} />
                      </motion.div> : <ChevronRight className={`${card.chevron} shrink-0 ${card.trailing}`} />}
                  </motion.button>;
          })}
            </motion.div>
          </div>;
      return categoryGrid;
    }
    const selectorIndex = stepId - 2;
    const selector = selectorSteps[selectorIndex];
    if (!selector) return null;
    const valueKey = selector.initialDataKey;
    const selectedValue = selection?.[valueKey] ?? null;
    const dependsOn = Array.isArray(selector.dependsOn) ? selector.dependsOn : [];
    const isEnabled = dependsOn.every(k => isPrefilterValueFilled(selection?.[k]));
    const optionsRaw = resolveStepOptions(selector, selection);
    if ((selector.kind || 'grid') === 'grid') {
      const options = optionsRaw || [];
      const qf = (gridOptionFilter || '').trim().toLowerCase();
      const filtered = qf.length > 0 ? options.filter(opt => {
        const label = String(opt.label || opt.name || opt.id || opt.value || '').toLowerCase();
        return label.includes(qf);
      }) : options;
      const showGridSearch = options.length > 6;
      const searchIconClass = 'text-text-muted';
      const gridBlock = <div className="space-y-4">
            {mode === 'create' && flowCopy.sellStepReassurance ? <p className="rounded-xl border border-border-light bg-background-secondary px-4 py-3 text-sm leading-relaxed text-text-secondary">{flowCopy.sellStepReassurance}</p> : null}
            {showGridSearch && <div className="relative">
                <Search className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${searchIconClass}`} />
                <input type="search" value={gridOptionFilter} onChange={e => setGridOptionFilter(e.target.value)} placeholder={flowCopy.gridFilterPlaceholder} className={auxUi.gridSearchInput} aria-label={t("filter_options")} />
              </div>}
            <motion.div variants={gridContainerVariants} initial="hidden" animate="show" key={`grid-${stepId}-${qf}`} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(opt => {
            const id = opt.id || opt.value;
            const label = opt.label || opt.name;
            const isSelected = String(selectedValue) === String(id);
            return <motion.button key={id} variants={gridItemVariants} whileHover={{
              y: -1,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }} whileTap={{
              scale: 0.98
            }} type="button" onClick={() => {
              setSelectionValue(valueKey, id, selectorIndex);
              // Auto-advance logic
              if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
              autoAdvanceTimeoutRef.current = setTimeout(() => {
                onSelectionNext();
              }, 350);
            }} className={getGridOptionClasses(flowUiVariant, isSelected)}>
                    <span className={getGridOptionLabelClass(flowUiVariant, isSelected)}>{label}</span>
                    {isSelected && <motion.div initial={{
                scale: 0
              }} animate={{
                scale: 1
              }} transition={{
                type: 'spring',
                stiffness: 500,
                damping: 25
              }} className={getGridCheckDotClass(flowUiVariant)}>
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </motion.div>}
                  </motion.button>;
          })}
            </motion.div>
            {filtered.length === 0 && <motion.div initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} className={auxUi.emptyFilterBox}>
                <p className={auxUi.emptyFilterTitle}>{flowCopy.emptyFilterTitle}</p>
                <p className={auxUi.emptyFilterSubtitle}>{flowCopy.emptyFilterSubtitle}</p>
              </motion.div>}
          </div>;
      return gridBlock;
    }
    const options = optionsRaw || [];
    const dropdownBlock = <div>
          <div className={auxUi.dropdownCard}>
            <SearchableDropdown options={options} selectedValues={selectedValue ? [selectedValue] : []} onSelectionChange={vals => {
          const nextValue = Array.isArray(vals) ? vals[0] ?? null : null;
          setSelectionValue(valueKey, nextValue, selectorIndex);

          // Auto-advance logic for dropdown
          if (nextValue !== null) {
            if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
            autoAdvanceTimeoutRef.current = setTimeout(() => {
              onSelectionNext();
            }, 400); // Slightly longer for dropdown to ensure selection is registered
          }
        }} label={selector.title || 'Select'} placeholder={isEnabled ? 'Select…' : 'Complete previous steps first'} multiple={false} disabled={!isEnabled} />
          </div>
          {mode === 'create' && !isEnabled ? <p className={auxUi.dependentSelectorHint}>{flowCopy.dependentDropdownHint}</p> : null}
        </div>;
    return dropdownBlock;
  }, [auxUi.dependentSelectorHint, auxUi.dropdownCard, auxUi.emptyFilterBox, auxUi.emptyFilterSubtitle, auxUi.emptyFilterTitle, auxUi.gridSearchInput, flowCopy, flowUiVariant, gridOptionFilter, handleTypeSelect, listingTypeOptions, mode, resolveStepOptions, selection, selectedType, selectorSteps, setSelectionValue, onSelectionNext, t]);
  const SelectedForm = selectedType ? createFormRegistry[selectedType] : null;
  const isReadyToFinish = useMemo(() => {
    if (!selectedType) return false;
    if (mode === 'create') {
      if (!SelectedForm) return false;
      return isCreateSelectionComplete(selectedType, selection, enums);
    }
    return false;
  }, [SelectedForm, enums, mode, selectedType, selection]);
  useLayoutEffect(() => {
    if (mode !== 'create') return;
    if (!isReadyToFinish || !selectedType || completedRef.current) return;
    completedRef.current = true;
    onComplete({
      listingType: selectedType,
      selection: {
        ...selection
      }
    });
  }, [isReadyToFinish, mode, onComplete, selectedType, selection]);
  if (mode === 'create' && isReadyToFinish && selectedType) {
    return <div className="flex min-h-screen items-center justify-center bg-background-secondary px-4">
        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} className="w-full max-w-sm bg-background-primary border border-border-light shadow-sm rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-border-light border-t-primary animate-spin" />
          <h2 className="text-lg font-semibold text-text-primary">{flowCopy.loading}</h2>
          {flowCopy.loadingSub ? <p className="mt-1.5 text-sm text-text-secondary">{flowCopy.loadingSub}</p> : null}
        </motion.div>
      </div>;
  }
  const showBrowseMidSearch = mode === 'browse' && partialBrowseSearchEnabled && selectionStep > 1;
  const browseFooterExtra = showBrowseMidSearch ? <div className="flex justify-end">
      <button type="button" onClick={triggerBrowseSearch} className={auxUi.midSearchBtn}>
        <Search className="h-4 w-4" />{t("search_listings")}</button>
    </div> : null;
  const browseLastStepAction = mode === 'browse' && selectedType ? {
    label: 'Search listings',
    onClick: triggerBrowseSearch
  } : null;
  return (
    <ListingWizard
      mode={mode}
      wizardVariant={flowUiVariant}
      steps={selectionSteps}
      currentStep={selectionStep}
      title={flowCopy.title}
      subtitle={flowCopy.subtitle}
      onBack={onSelectionBackOrPrev}
      onPrev={onSelectionPrev}
      onNext={onSelectionNext}
      canSubmit={canGoNextSelection}
      onCancel={onCancel}
      isCompleting={isReadyToFinish}
      footerExtra={browseFooterExtra}
      lastStepAction={browseLastStepAction}
      categoryCardCount={listingTypeOptions.length}
    >
      {renderSelectionStep(selectionStep)}
    </ListingWizard>
  );
};

export default ListingPrefilterSelectionFlow;