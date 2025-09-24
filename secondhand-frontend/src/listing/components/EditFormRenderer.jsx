import React from 'react';
import { listingTypeRegistry } from './typeRegistry.js';


export const renderEditForm = (listing, type, handleUpdate) => {
        if (!listing) {
        return (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">
                Error: Listing data is required
            </div>
        );
    }

    if (!type || !listingTypeRegistry[type]) {
        return (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">
                Error: No edit form configured for listing type '{type}'
            </div>
        );
    }

    if (!handleUpdate || typeof handleUpdate !== 'function') {
        return (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">
                Error: Invalid update handler provided
            </div>
        );
    }

    const EditComponent = listingTypeRegistry[type].editComponent;

    if (!EditComponent) {
        return (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">
                Error: Edit component is missing for listing type '{type}'
            </div>
        );
    }

    try {
        return (
            <EditComponent 
                initialData={listing} 
                isEdit={true}
                onUpdate={handleUpdate}
                onBack={() => window.history.back()}
            />
        );
    } catch (error) {
        console.error('Error rendering edit form:', error);
        return (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">
                Error: Failed to render edit form. Please try again later.
            </div>
        );
    }
};

export default renderEditForm;
