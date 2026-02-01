import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnums } from '../../common/hooks/useEnums.js';
import { getListingConfig, getListingTypeOptions, createFormRegistry } from '../config/listingConfig.js';
import { ROUTES } from '../../common/constants/routes.js';
import ListingWizard from '../components/ListingWizard.jsx';
import { ChevronRight } from 'lucide-react';

const CreateListingPage = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSubtypeId, setSelectedSubtypeId] = useState(null);
    const [selectionStep, setSelectionStep] = useState(0);
    const { enums } = useEnums();

    const handleTypeSelect = useCallback((type) => {
        const cfg = getListingConfig(type);
        const subtype = cfg?.createFlow?.subtypeSelector;
        setSelectedType(type);
        setSelectedSubtypeId(null);
        setSelectionStep(subtype ? 1 : 0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBackToSelection = useCallback(() => {
        setSelectedType(null);
        setSelectedSubtypeId(null);
        setSelectionStep(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const listingTypeOptions = useMemo(() => {
        return getListingTypeOptions();
    }, []);

    const SelectedForm = selectedType ? createFormRegistry[selectedType] : null;
    const subtypeConfig = selectedType ? (getListingConfig(selectedType)?.createFlow?.subtypeSelector || null) : null;

    const isReadyForForm = Boolean(SelectedForm && (!subtypeConfig || selectedSubtypeId));

    const subtypeOptions = useMemo(() => {
        if (!subtypeConfig?.enumKey) return [];
        return enums[subtypeConfig.enumKey] || [];
    }, [enums, subtypeConfig?.enumKey]);

    const selectionSteps = useMemo(() => {
        if (!selectedType) {
            return [
                { id: 0, title: 'Category', description: 'Choose what you want to list.' }
            ];
        }
        if (subtypeConfig) {
            return [
                { id: 0, title: 'Category', description: 'Choose what you want to list.' },
                { id: 1, title: subtypeConfig.title || 'Subtype', description: subtypeConfig.description || 'Choose a subtype.' }
            ];
        }
        return [
            { id: 0, title: 'Category', description: 'Choose what you want to list.' }
        ];
    }, [selectedType, subtypeConfig]);

    const canGoNextSelection = useMemo(() => {
        if (selectionStep === 0) return Boolean(selectedType);
        if (selectionStep === 1) return Boolean(selectedSubtypeId);
        return false;
    }, [selectedSubtypeId, selectedType, selectionStep]);

    const onSelectionBack = useCallback(() => {
        navigate(ROUTES.MY_LISTINGS);
    }, [navigate]);

    const onSelectionPrev = useCallback(() => {
        if (selectionStep <= 0) {
            handleBackToSelection();
            return;
        }
        setSelectionStep((s) => Math.max(s - 1, 0));
    }, [handleBackToSelection, selectionStep]);

    const onSelectionNext = useCallback(() => {
        if (!selectedType) return;

        if (selectionStep === 0) {
            if (subtypeConfig) {
                setSelectionStep(1);
                return;
            }
            return;
        }

        if (selectionStep === 1) {
            return;
        }
    }, [selectedType, selectionStep, subtypeConfig]);

    const onSelectionBackOrPrev = useCallback(() => {
        if (selectionStep === 0) {
            onSelectionBack();
            return;
        }
        onSelectionPrev();
    }, [onSelectionBack, onSelectionPrev, selectionStep]);

    const renderSelectionStep = useCallback((stepId) => {
        if (stepId === 0) {
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

        if (stepId === 1) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subtypeOptions.map((opt) => {
                        const id = opt.id || opt.value;
                        const label = opt.label || opt.name;
                        return (
                            <button
                                key={id}
                                onClick={() => setSelectedSubtypeId(id)}
                                className={`group relative flex flex-col items-start gap-3 p-6 rounded-3xl bg-white border transition-all duration-300 text-left w-full ${
                                    String(selectedSubtypeId) === String(id)
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
                                        String(selectedSubtypeId) === String(id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                    }`} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            );
        }

        return null;
    }, [handleTypeSelect, listingTypeOptions, selectedSubtypeId, subtypeOptions]);

    if (isReadyForForm && SelectedForm) {
        const initialDataKey = subtypeConfig?.initialDataKey || null;
        const initialData = initialDataKey && selectedSubtypeId ? { [initialDataKey]: selectedSubtypeId } : null;
        return <SelectedForm onBack={handleBackToSelection} initialData={initialData} />;
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
