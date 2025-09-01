import React from 'react';
import { useEnums } from '../../hooks/useEnums';
import SearchableDropdown from '../../components/ui/SearchableDropdown';

const CategorySelector = ({ selectedCategory, onCategoryChange }) => {
    const { enums, isLoading: enumsLoading } = useEnums();

    if (enumsLoading) {
        return (
            <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2 text-slate-500">
                    <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm">Loading...</span>
                </div>
            </div>
        );
    }

    // Prepare options for dropdown with icons
    const categoryOptions = enums.listingTypes.map((type) => ({
        value: type.value,
        label: `${type.icon || '📦'} ${type.label}`
    }));

    const handleCategoryChange = (values) => {
        // Since this is single selection, take the first value
        const selectedValue = values.length > 0 ? values[0] : null;
        onCategoryChange(selectedValue);
    };

    const getCurrentSelection = () => {
        return selectedCategory ? [selectedCategory] : [];
    };

    return (
        <SearchableDropdown
            label="Category"
            options={categoryOptions}
            selectedValues={getCurrentSelection()}
            onSelectionChange={handleCategoryChange}
            placeholder="Select a category..."
            searchPlaceholder="Search categories..."
            multiple={false}
            maxDisplayItems={1}
        />
    );
};

export default CategorySelector;