import React, { useState } from 'react';
import { useEnums } from '../../hooks/useEnums';
import { createFormRegistry } from '../../features/listings/components/createFormRegistry';

const CreateListingPage = () => {
    const [selectedType, setSelectedType] = useState(null);
    const { enums } = useEnums();

    const handleTypeSelect = (type) => {
        setSelectedType(type);
    };

    const handleBackToSelection = () => {
        setSelectedType(null);
    };

    const SelectedForm = selectedType ? createFormRegistry[selectedType] : null;

    if (SelectedForm) {
        return <SelectedForm onBack={handleBackToSelection} />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Publish Listing
            </h1>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Select Listing Type
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enums.listingTypes?.map((type) => (
                        <button
                            key={type.value}
                            onClick={() => handleTypeSelect(type.value)}
                            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="text-3xl">
                                    {type.icon || '📦'}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                                        {type.label}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {getTypeDescription(type.value)}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {selectedType && !SelectedForm && (
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">
                            {selectedType} is not ready now.
                        </p>
                        <button
                            onClick={handleBackToSelection}
                            className="mt-2 text-yellow-600 hover:text-yellow-800 underline"
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