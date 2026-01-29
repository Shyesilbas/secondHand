import React, { useState, useEffect, useCallback } from "react";
import { useEnums } from "../../common/hooks/useEnums.js";
import CategorySelector from "./CategorySelector.jsx";
import PriceLocationFields from "./filters/shared/PriceLocationFields.jsx";
import VehicleFilters from "./filters/VehicleFilters.jsx";
import ElectronicsFilters from "./filters/ElectronicsFilters.jsx";
import ClothingFilters from "./filters/ClothingFilters.jsx";

const FilterModal = ({
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
    const [activeStep, setActiveStep] = useState("category");

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
            setLocalCategory(selectedCategory);
            setActiveStep("category");
        }
    }, [isOpen, filters, selectedCategory]);

    const handleInputChange = useCallback((field, value) => {
        setLocalFilters((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleCategoryChange = useCallback((category) => {
        setLocalCategory(category);
    }, []);

    const handleStepChange = useCallback((stepId) => {
        setActiveStep(stepId);
    }, []);

    const handleReset = useCallback(() => {
        setLocalFilters({});
        setLocalCategory("VEHICLE");
        onReset();
    }, [onReset]);

    const handleApplyFilters = useCallback(() => {
        console.log('🔍 FilterModal - localFilters before apply:', localFilters);
        onFiltersChange(localFilters);
        if (localCategory !== selectedCategory) {
            onCategoryChange(localCategory);
        }
        onClose();
    }, [localFilters, localCategory, selectedCategory, onFiltersChange, onCategoryChange, onClose]);

    const steps = [
        { id: "category", label: "Category", icon: "🏷️" },
        { id: "price", label: "Price & Location", icon: "💰" },
        { id: "filters", label: "Filters", icon: "⚙️" },
    ];

    if (!isOpen) return null;
    if (enumsLoading) return <div>Loading...</div>;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded border border-gray-200 w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 bg-white px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Advanced Filters</h2>
                            <p className="text-sm text-gray-600 mt-1">Refine your search with detailed options</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Step Navigation */}
                    <div className="mt-6">
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            {steps.map((step, index) => (
                                <button
                                    key={step.id}
                                    onClick={() => handleStepChange(step.id)}
                                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeStep === step.id
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                            activeStep === step.id 
                                                ? "bg-gray-900 text-white" 
                                                : "bg-gray-200 text-gray-600"
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <span>{step.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-6">
                        {activeStep === "category" && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <CategorySelector
                                    selectedCategory={localCategory}
                                    onCategoryChange={handleCategoryChange}
                                />
                            </div>
                        )}

                        {activeStep === "price" && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <PriceLocationFields
                                    filters={localFilters}
                                    onPriceChange={handleInputChange}
                                    onInputChange={handleInputChange}
                                />
                            </div>
                        )}

                        {activeStep === "filters" && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                                {localCategory === "CLOTHING" && (
                                    <ClothingFilters
                                        filters={localFilters}
                                        onInputChange={handleInputChange}
                                        enums={enums}
                                    />
                                )}
                                {localCategory !== "VEHICLE" && localCategory !== "ELECTRONICS" && localCategory !== "CLOTHING" && (
                                    <div className="text-center text-gray-500 py-8">
                                        <p>No specific filters available for this category.</p>
                                        <p className="text-sm mt-2">Use price and location filters instead.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-white px-6 py-5">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 transition-colors"
                        >
                            Reset All
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 hover:border-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyFilters}
                                className="px-6 py-2 bg-gray-900 text-white font-medium rounded hover:bg-gray-800 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
