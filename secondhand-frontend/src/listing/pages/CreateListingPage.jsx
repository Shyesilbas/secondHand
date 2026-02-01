import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnums } from '../../common/hooks/useEnums.js';
import { getListingConfig, getListingTypeOptions, createFormRegistry } from '../config/listingConfig.js';
import { ROUTES } from '../../common/constants/routes.js';
import ListingWizard from '../components/ListingWizard.jsx';
import { ChevronRight } from 'lucide-react';
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {listingTypeOptions.map((type) => (
                        <button
                            key={type.value}
                            onClick={() => handleTypeSelect(type.value)}
                            className="group relative flex flex-col items-center gap-5 p-8 rounded-3xl bg-white border border-slate-200/60 hover:border-indigo-300/60 hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] transition-all duration-300 text-center w-full"
                        >
                            <div className="w-20 h-20 shrink-0 rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50/30 group-hover:from-indigo-50 group-hover:to-indigo-100/50 border border-slate-100 group-hover:border-indigo-200/60 flex items-center justify-center text-5xl transition-all duration-300 shadow-sm group-hover:shadow-md">
                                {type.icon}
                            </div>
                            <div className="flex-1 min-w-0 w-full">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors tracking-tight mb-2">
                                    {type.label}
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed tracking-tight">
                                    {type.description}
                                </p>
                            </div>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                <ChevronRight className="w-5 h-5 text-indigo-500" />
                            </div>
                        </button>
                    ))}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {options.map((opt) => {
                        const id = opt.id || opt.value;
                        const label = opt.label || opt.name;
                        return (
                            <button
                                key={id}
                                onClick={() => setSelectionValue(valueKey, id, selectorIndex)}
                                className={`group relative flex flex-col items-start gap-3 p-6 rounded-3xl bg-white border transition-all duration-300 text-left w-full ${
                                    String(selectedValue) === String(id)
                                        ? 'border-indigo-500 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.20)]'
                                        : 'border-slate-200/60 hover:border-indigo-300/60 hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)]'
                                }`}
                            >
                                <div className="flex items-start justify-between w-full gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors tracking-tight">
                                            {label}
                                        </h3>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-indigo-500 transition-opacity ${
                                        String(selectedValue) === String(id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                    }`} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            );
        }

        const options = optionsRaw || [];

        return (
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8">
                <SearchableDropdown
                    options={options}
                    selectedValues={selectedValue ? [selectedValue] : []}
                    onSelectionChange={(vals) => {
                        const nextValue = Array.isArray(vals) ? (vals[0] ?? null) : null;
                        setSelectionValue(valueKey, nextValue, selectorIndex);
                    }}
                    label={selector.title || 'Select'}
                    placeholder={isEnabled ? 'Select...' : 'Complete previous steps first'}
                    multiple={false}
                    disabled={!isEnabled}
                />
            </div>
        );

    }, [handleTypeSelect, listingTypeOptions, resolveStepOptions, selection, selectorSteps, setSelectionValue]);

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
