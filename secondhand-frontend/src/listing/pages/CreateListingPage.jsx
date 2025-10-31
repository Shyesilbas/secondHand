import React, { useState, useEffect, useMemo } from 'react';
import { PlusIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router-dom';
import { useEnums } from '../../common/hooks/useEnums.js';
import { getListingConfig, getListingTypeOptions, createFormRegistry } from '../config/listingConfig.js';

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
    };

    const handleBackToSelection = () => {
        setSelectedType(null);
        if (searchParams.has('type')) {
            searchParams.delete('type');
            setSearchParams(searchParams);
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
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <div className="border-b border-gray-200 bg-white/70 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                            <PlusIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Create New Listing</h1>
                            <p className="text-gray-600 mt-1">Choose the type of item you want to list</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Select Listing Type</h2>
                                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">Step 1/2</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {listingTypeOptions.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => handleTypeSelect(type.value)}
                                        className="group text-left relative p-5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                    <div className="min-w-0 pr-8">
                                            <h3 className="font-medium text-gray-900">{type.label}</h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{type.description}</p>
                                        </div>
                                    <ChevronRightIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                                    </button>
                                ))}
                            </div>

                            {selectedType && !SelectedForm && (
                                <div className="mt-6 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-700">{selectedConfig?.label || selectedType} is not ready yet.</p>
                                        <button
                                            onClick={handleBackToSelection}
                                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tips</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>Use clear photos for better visibility</li>
                                <li>Set a competitive price</li>
                                <li>Fill detailed specs to help filtering</li>
                            </ul>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Need help?</h3>
                            <p className="text-sm text-gray-600">You can update details after creation as well.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default CreateListingPage;
