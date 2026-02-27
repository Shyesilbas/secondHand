import React, {useCallback, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useEnums} from '../../common/hooks/useEnums.js';
import {createFormRegistry, getListingConfig, getListingTypeOptions} from '../config/listingConfig.js';
import {ROUTES} from '../../common/constants/routes.js';
import ListingWizard from '../components/ListingWizard.jsx';
import {Check, ChevronRight} from 'lucide-react';
import SearchableDropdown from '../../common/components/ui/SearchableDropdown.jsx';

const CreateListingPage = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);
    const [selection, setSelection] = useState({});
    const [selectionStep, setSelectionStep] = useState(1);
    const { enums } = useEnums();

    const listingTypeOptions = useMemo(() => {
        return getListingTypeOptions();
    }, []);

    const SelectedForm = selectedType ? createFormRegistry[selectedType] : null;
    const flowConfig = selectedType ? (getListingConfig(selectedType)?.createFlow || null) : null;
    const subtypeConfig = flowConfig?.subtypeSelector || null;
    const preFormSelectors = Array.isArray(flowConfig?.preFormSelectors) ? flowConfig.preFormSelectors : [];

    const selectorSteps = useMemo(() => {
        const list = [];
        if (subtypeConfig?.enumKey && subtypeConfig?.initialDataKey) {
            list.push({
                ...subtypeConfig,
                kind: 'grid',
            });
        }
        preFormSelectors.forEach((s) => {
            if (!s?.enumKey || !s?.initialDataKey) return;
            list.push(s);
        });
        return list;
    }, [preFormSelectors, subtypeConfig]);

    const selectionSteps = useMemo(() => {
        const base = [
            { id: 1, title: 'Category', description: 'Choose what you want to list.' }
        ];
        const tail = selectorSteps.map((s, idx) => ({
            id: idx + 2,
            title: s.title || 'Selection',
            description: s.description || ''
        }));
        return [...base, ...tail];
    }, [selectorSteps]);

    const handleTypeSelect = useCallback((type) => {
        setSelectedType(type);
        setSelection({});
        const cfg = getListingConfig(type);
        const selectors = Boolean(cfg?.createFlow?.subtypeSelector || (Array.isArray(cfg?.createFlow?.preFormSelectors) && cfg.createFlow.preFormSelectors.length));
        setSelectionStep(selectors ? 2 : 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBackToSelection = useCallback(() => {
        setSelectedType(null);
        setSelection({});
        setSelectionStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const canGoNextSelection = useMemo(() => {
        if (selectionStep === 1) return Boolean(selectedType);
        const idx = selectionStep - 2;
        const selector = selectorSteps[idx];
        if (!selector) return false;
        return Boolean(selection?.[selector.initialDataKey]);
    }, [selectedType, selection, selectionStep, selectorSteps]);

    const onSelectionBack = useCallback(() => {
        navigate(ROUTES.MY_LISTINGS);
    }, [navigate]);

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
            onSelectionBack();
            return;
        }
        onSelectionPrev();
    }, [onSelectionBack, onSelectionPrev, selectionStep]);

    const setSelectionValue = useCallback((key, value, currentIndex) => {
        setSelection((prev) => {
            const next = { ...(prev || {}), [key]: value };
            for (let i = currentIndex + 1; i < selectorSteps.length; i += 1) {
                const k = selectorSteps[i]?.initialDataKey;
                if (k) next[k] = null;
            }
            return next;
        });
    }, [selectorSteps]);

    const resolveStepOptions = useCallback((selector, selectionState) => {
        if (!selector) return [];
        if (typeof selector.getOptions === 'function') {
            return selector.getOptions({ enums, selection: selectionState || {} }) || [];
        }
        return enums?.[selector.enumKey] || [];
    }, [enums]);

    const renderSelectionStep = useCallback((stepId) => {
        if (stepId === 1) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {listingTypeOptions.map((type) => {
                        const isSelected = selectedType === type.value;
                        return (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => handleTypeSelect(type.value)}
                                className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-lg border transition-all duration-150 w-full text-left focus:outline-none ${
                                    isSelected
                                        ? 'border-gray-900 bg-gray-50'
                                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
                                }`}
                            >
                                <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-xl transition-colors duration-150 ${
                                    isSelected ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 group-hover:bg-gray-100'
                                }`}>
                                    {type.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[13px] font-semibold text-gray-900 tracking-[-0.01em]">
                                        {type.label}
                                    </h3>
                                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                        {type.description}
                                    </p>
                                </div>
                                {isSelected ? (
                                    <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </div>
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-gray-400 shrink-0 transition-colors" />
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
        const isEnabled = dependsOn.every((k) => Boolean(selection?.[k]));

        const optionsRaw = resolveStepOptions(selector, selection);

        if ((selector.kind || 'grid') === 'grid') {
            const options = optionsRaw || [];
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {options.map((opt) => {
                        const id = opt.id || opt.value;
                        const label = opt.label || opt.name;
                        const isSelected = String(selectedValue) === String(id);
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setSelectionValue(valueKey, id, selectorIndex)}
                                className={`relative flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-150 w-full text-left focus:outline-none ${
                                    isSelected
                                        ? 'border-gray-900 bg-gray-50'
                                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
                                }`}
                            >
                                <span className={`text-[13px] font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {label}
                                </span>
                                {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0 ml-2">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            );
        }

        const options = optionsRaw || [];

        return (
            <div className="bg-white rounded-lg border border-gray-100 p-5">
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

    }, [handleTypeSelect, listingTypeOptions, resolveStepOptions, selection, selectedType, selectorSteps, setSelectionValue]);

    const isReadyForForm = useMemo(() => {
        if (!SelectedForm) return false;
        if (!selectorSteps.length) return true;
        return selectorSteps.every((s) => Boolean(selection?.[s.initialDataKey]));
    }, [SelectedForm, selection, selectorSteps]);

    if (isReadyForForm && SelectedForm) {
        return <SelectedForm onBack={handleBackToSelection} initialData={selection} />;
    }

    return (
        <ListingWizard
            title="Create New Listing"
            subtitle="Turn your items into cash in just a few steps"
            steps={selectionSteps}
            currentStep={selectionStep}
            onBack={onSelectionBack}
            onPrev={onSelectionBackOrPrev}
            onNext={onSelectionNext}
            canSubmit={canGoNextSelection}
            renderStep={(step) => renderSelectionStep(step)}
        />
    );
};

export default CreateListingPage;
