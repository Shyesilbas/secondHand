import React, { useState, useEffect, useMemo } from 'react';
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
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                        Create New Listing
                    </h1>
                    <p className="text-gray-600">
                        Choose the type of item you want to list
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        Select Listing Type
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {listingTypeOptions.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => handleTypeSelect(type.value)}
                                className="p-4 border border-gray-200 rounded hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="text-2xl">
                                        {type.icon || '📦'}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {type.label}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {type.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {selectedType && !SelectedForm && (
                        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
                            <p className="text-gray-700">
                                {selectedConfig?.label || selectedType} is not ready yet.
                            </p>
                            <button
                                onClick={handleBackToSelection}
                                className="mt-2 text-gray-600 hover:text-gray-800 underline"
                            >
                                Go Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default CreateListingPage;
