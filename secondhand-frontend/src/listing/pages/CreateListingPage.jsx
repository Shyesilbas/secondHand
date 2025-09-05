import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEnums } from '../../common/hooks/useEnums.js';
import { createFormRegistry } from '../components/createFormRegistry.js';

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

    const SelectedForm = selectedType ? createFormRegistry[selectedType] : null;

    if (SelectedForm) {
        return <SelectedForm onBack={handleBackToSelection} />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-card-text-primary mb-8">
                Publish Listing
            </h1>

            <div className="bg-card-bg rounded-card shadow-card border border-card-border p-6">
                <h2 className="text-xl font-semibold text-card-text-primary mb-6">
                    Select Listing Type
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enums.listingTypes?.map((type) => (
                        <button
                            key={type.value}
                            onClick={() => handleTypeSelect(type.value)}
                            className="p-6 border-2 border-card-border rounded-card hover:border-card-border-hover hover:text primary transition-all duration-200 text-left group"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="text-3xl">
                                    {type.icon || '📦'}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-card-text-primary group-hover:card-text primary">
                                        {type.label}
                                    </h3>
                                    <p className="text-sm text-card-text-muted mt-1">
                                        {getTypeDescription(type.value)}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {selectedType && !SelectedForm && (
                    <div className="mt-8 p-4 bg-warning-bg border border-warning-border rounded-lg">
                        <p className="text-warning-text">
                            {selectedType} is not ready now.
                        </p>
                        <button
                            onClick={handleBackToSelection}
                            className="mt-2 text-warning-text hover:text-warning-text underline"
                        >
                            Go Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const getTypeDescription = (type) => {
    switch (type) {
        case 'VEHICLE':
            return 'Vehicle, Motorcycle, Cycle eg..';
        case 'ELECTRONICS':
            return 'Mobile Phone, Laptop, TV eg...';
        case 'REAL_ESTATE':
            return 'House, Apartment, Land eg..';
        case 'CLOTHING':
            return 'Clothing and accessories eg..';
        case 'BOOKS':
            return 'Books, Magazines, Newspapers eg..';
        case 'SPORTS':
            return 'Sport equipment, accessories eg..';
        case 'OTHER':
            return 'Other categories eg..';
        default:
            return 'NULL';
    }
};

export default CreateListingPage;
