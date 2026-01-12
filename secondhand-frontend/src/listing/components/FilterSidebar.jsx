import React, { useState, useEffect, useCallback } from "react";
import { useEnums } from "../../common/hooks/useEnums.js";
import { X } from "lucide-react";
import CategorySelector from "./CategorySelector.jsx";
import PriceLocationFields from "./filters/shared/PriceLocationFields.jsx";
import VehicleFilters from "./filters/VehicleFilters.jsx";
import ElectronicsFilters from "./filters/ElectronicsFilters.jsx";

const FilterSidebar = ({
    isOpen,
    onClose,
    filters,
    onFiltersChange,
    onReset,
    selectedCategory,
    onCategoryChange,
}) => {
    const { enums, isLoading: enumsLoading } = useEnums();
    const [localFilters, setLocalFilters] = useState(filters);
    const [localCategory, setLocalCategory] = useState(selectedCategory);

    useEffect(() => {
        setLocalFilters(filters);
        setLocalCategory(selectedCategory);
    }, [filters, selectedCategory]);

    const handleInputChange = useCallback((field, value) => {
        setLocalFilters((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleCategoryChange = useCallback((category) => {
        setLocalCategory(category);
        onCategoryChange(category);
    }, [onCategoryChange]);

    const handleReset = useCallback(() => {
        setLocalFilters({});
        setLocalCategory("VEHICLE");
        onReset();
    }, [onReset]);

    const handleApplyFilters = useCallback(() => {
        onFiltersChange(localFilters);
    }, [localFilters, onFiltersChange]);
    if (enumsLoading) {
        return (
            <div className="fixed inset-0 z-50 lg:relative lg:z-auto">
                <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={onClose} />
                <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl lg:relative lg:shadow-none border-r border-gray-200 overflow-y-auto">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}
            <div className={`
                fixed left-0 top-0 h-screen w-80 bg-white shadow-xl z-50 border-r border-gray-200 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Filters</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50 overscroll-contain">
                    <div className="p-4 space-y-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <CategorySelector
                                selectedCategory={localCategory}
                                onCategoryChange={handleCategoryChange}
                                compact={true}
                            />
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <PriceLocationFields
                                filters={localFilters}
                                onPriceChange={handleInputChange}
                                onInputChange={handleInputChange}
                                compact={true}
                            />
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            {localCategory === "VEHICLE" && (
                                <VehicleFilters
                                    filters={localFilters}
                                    onInputChange={handleInputChange}
                                    enums={enums}
                                />
                            )}
                            {localCategory === "ELECTRONICS" && (
                                <ElectronicsFilters
                                    filters={localFilters}
                                    onInputChange={handleInputChange}
                                    enums={enums}
                                />
                            )}
                            {localCategory !== "VEHICLE" && localCategory !== "ELECTRONICS" && (
                                <div className="text-center text-gray-500 py-8">
                                    <p>No specific filters available for this category.</p>
                                    <p className="text-sm mt-2">Use price and location filters instead.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 bg-white px-4 py-3 flex-shrink-0">
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleApplyFilters}
                            className="w-full px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleReset}
                            className="w-full px-3 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FilterSidebar;

