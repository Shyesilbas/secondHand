import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEnums } from '../../common/hooks/useEnums.js';
import { getListingConfig, getListingTypeOptions, createFormRegistry } from '../config/listingConfig.js';
import { 
  Sparkles, 
  ChevronRight, 
  HelpCircle, 
  Info,
  ArrowLeft
} from 'lucide-react';

const CreateListingPage = () => {
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
        setSelectedType(type);
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

    if (SelectedForm) {
        return <SelectedForm onBack={handleBackToSelection} />;
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 bg-opacity-80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Listing</h1>
                            <p className="text-gray-500 text-sm font-medium">Turn your items into cash in just a few steps</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">What are you listing today?</h2>
                                <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                                    Step 1 of 2
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {listingTypeOptions.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => handleTypeSelect(type.value)}
                                        className="group relative flex items-start gap-4 p-6 rounded-2xl bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 text-left w-full"
                                    >
                                        <div className="w-14 h-14 shrink-0 rounded-2xl bg-gray-50 group-hover:bg-indigo-50 border border-gray-100 group-hover:border-indigo-100 flex items-center justify-center text-3xl transition-colors duration-300">
                                            {type.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                {type.label}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                                {type.description}
                                            </p>
                                        </div>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                            <ChevronRight className="w-5 h-5 text-indigo-500" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Coming Soon Section */}
                        {selectedType && !SelectedForm && (
                            <div className="rounded-2xl bg-gray-900 text-white p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                                    <p className="text-gray-400 mb-6 max-w-md">
                                        The form for <span className="text-white font-semibold">{selectedConfig?.label || selectedType}</span> is currently under development. Stay tuned!
                                    </p>
                                    <button
                                        onClick={handleBackToSelection}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Choose Another Type
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-32">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-gray-900">Pro Tips for Selling</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-sm text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                    <span>Take clear, well-lit photos from different angles to attract more buyers.</span>
                                </li>
                                <li className="flex gap-3 text-sm text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                    <span>Write a detailed description including brand, condition, and any defects.</span>
                                </li>
                                <li className="flex gap-3 text-sm text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                    <span>Research similar items to set a competitive price.</span>
                                </li>
                            </ul>
                            
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <HelpCircle className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Need Help?</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">
                                    Our support team is here to assist you with any questions.
                                </p>
                                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
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
