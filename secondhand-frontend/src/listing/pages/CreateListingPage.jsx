import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEnums } from '../../common/hooks/useEnums.js';
import { getListingConfig, getListingTypeOptions, createFormRegistry } from '../config/listingConfig.js';
import { ROUTES } from '../../common/constants/routes.js';
import { 
  Sparkles, 
  ChevronRight, 
  HelpCircle, 
  Info,
  ArrowLeft,
  Bot,
  Lightbulb
} from 'lucide-react';

const CreateListingPage = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const { enums } = useEnums();

    useEffect(() => {
        const typeFromUrl = searchParams.get('type');
        if (typeFromUrl && createFormRegistry[typeFromUrl]) {
            setSelectedType(typeFromUrl);
        }
    }, [searchParams]);

    const handleTypeSelect = (type) => {
        const cfg = getListingConfig(type);
        const subtype = cfg?.createFlow?.subtypeSelector;
        if (subtype) {
            navigate(ROUTES.CREATE_LISTING_SUBTYPE(type));
            return;
        }
        const next = new URLSearchParams(searchParams);
        next.set('type', type);
        setSearchParams(next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToSelection = () => {
        setSelectedType(null);
        if (searchParams.has('type')) {
            const next = new URLSearchParams(searchParams);
            next.delete('type');
            setSearchParams(next);
        }
    };

    const listingTypeOptions = useMemo(() => {
        return getListingTypeOptions();
    }, []);

    const SelectedForm = selectedType ? createFormRegistry[selectedType] : null;
    const selectedConfig = selectedType ? getListingConfig(selectedType) : null;

    if (SelectedForm && selectedConfig?.createFlow?.subtypeSelector) {
        const { queryParamKey, initialDataKey } = selectedConfig.createFlow.subtypeSelector;
        const subtypeValue = searchParams.get(queryParamKey);
        if (!subtypeValue) {
            navigate(ROUTES.CREATE_LISTING_SUBTYPE(selectedType), { replace: true });
            return null;
        }
        return <SelectedForm onBack={handleBackToSelection} initialData={{ [initialDataKey]: subtypeValue }} />;
    }

    if (SelectedForm) {
        return <SelectedForm onBack={handleBackToSelection} />;
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Listing</h1>
                            <p className="text-slate-600 text-sm font-medium tracking-tight">Turn your items into cash in just a few steps</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">What are you listing today?</h2>
                                <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60 tracking-tight">
                                    Step 1 of 3
                                </span>
                            </div>

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
                        </div>

                        {/* Coming Soon Section */}
                        {selectedType && !SelectedForm && (
                            <div className="rounded-3xl bg-slate-900 text-white p-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-2 tracking-tight">Coming Soon</h3>
                                    <p className="text-slate-400 mb-6 max-w-md tracking-tight">
                                        The form for <span className="text-white font-semibold">{selectedConfig?.label || selectedType}</span> is currently under development. Stay tuned!
                                    </p>
                                    <button
                                        onClick={handleBackToSelection}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition-colors tracking-tight"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Choose Another Type
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Satış Asistanı */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-slate-50/50 border border-indigo-200/60 rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] sticky top-32">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 tracking-tight text-base">Satış Asistanı</h3>
                                    <p className="text-xs text-slate-600 tracking-tight">Size yardımcı oluyor</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex gap-3 p-4 bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm">
                                    <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <Lightbulb className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 leading-relaxed tracking-tight">
                                            Take clear, well-lit photos from different angles to attract more buyers.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 p-4 bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm">
                                    <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <Lightbulb className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 leading-relaxed tracking-tight">
                                            Write a detailed description including brand, condition, and any defects.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 p-4 bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm">
                                    <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <Lightbulb className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 leading-relaxed tracking-tight">
                                            Research similar items to set a competitive price.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-slate-200/60">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <HelpCircle className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 tracking-tight text-sm">Need Help?</h3>
                                </div>
                                <p className="text-xs text-slate-600 mb-4 tracking-tight leading-relaxed">
                                    Our support team is here to assist you with any questions.
                                </p>
                                <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline tracking-tight">
                                    Visit Help Center
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateListingPage;
