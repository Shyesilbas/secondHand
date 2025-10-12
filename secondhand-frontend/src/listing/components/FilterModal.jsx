import React, { useState, useEffect } from "react";
import { useEnums } from "../../common/hooks/useEnums.js";
import { filtersRegistry } from "./filters/filtersRegistry.js";
import CategorySelector from "./CategorySelector.jsx";
import PriceLocationFields from "./filters/shared/PriceLocationFields.jsx";
import Select from "react-select";

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

    const handleInputChange = (field, value) => {
        setLocalFilters((prev) => ({ ...prev, [field]: value }));
    };

    const steps = [
        { id: "category", label: "Category", icon: "🏷️" },
        { id: "price", label: "Price & Location", icon: "💰" },
        { id: "filters", label: "Filters", icon: "⚙️" },
    ];

    if (!isOpen) return null;
    if (enumsLoading) return <div>Loading...</div>;

    const filterConfig = filtersRegistry[localCategory]?.config;

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
                                    onClick={() => setActiveStep(step.id)}
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
                                    onCategoryChange={(c) => setLocalCategory(c)}
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

                        {activeStep === "filters" && filterConfig && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="space-y-8">
                                    {filterConfig.getFields().map((field) => {
                                        if (field.type === "enum") {
                                            const selectedValues = localFilters[field.key] || [];

                                            return (
                                                <div key={field.key} className="space-y-3">
                                                    <label className="block text-sm font-semibold text-gray-900">
                                                        {field.label}
                                                    </label>
                                                    <Select
                                                        isMulti
                                                        options={enums[field.enumKey]?.map((opt) => ({
                                                            value: opt.value,
                                                            label: opt.label,
                                                        }))}
                                                        value={selectedValues.map((v) => ({
                                                            value: v,
                                                            label: enums[field.enumKey]?.find((o) => o.value === v)?.label,
                                                        }))}
                                                        onChange={(selected) => {
                                                            handleInputChange(
                                                                field.key,
                                                                selected ? selected.map((s) => s.value) : []
                                                            );
                                                        }}
                                                        className="basic-multi-select"
                                                        classNamePrefix="select"
                                                        placeholder={`Select ${field.label.toLowerCase()}...`}
                                                        menuPortalTarget={document.body}
                                                        menuPosition="fixed"
                                                        styles={{
                                                            control: (base) => ({
                                                                ...base,
                                                                minHeight: '44px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '8px',
                                                                boxShadow: 'none',
                                                                '&:hover': {
                                                                    border: '1px solid #9ca3af',
                                                                },
                                                                '&:focus-within': {
                                                                    border: '2px solid #374151',
                                                                    boxShadow: '0 0 0 3px rgba(55, 65, 81, 0.1)',
                                                                },
                                                            }),
                                                            multiValue: (base) => ({
                                                                ...base,
                                                                backgroundColor: '#f3f4f6',
                                                                borderRadius: '6px',
                                                            }),
                                                            multiValueLabel: (base) => ({
                                                                ...base,
                                                                color: '#374151',
                                                                fontSize: '14px',
                                                            }),
                                                            multiValueRemove: (base) => ({
                                                                ...base,
                                                                color: '#6b7280',
                                                                '&:hover': {
                                                                    backgroundColor: '#ef4444',
                                                                    color: 'white',
                                                                },
                                                            }),
                                                            placeholder: (base) => ({
                                                                ...base,
                                                                color: '#9ca3af',
                                                                fontSize: '14px',
                                                            }),
                                                            menu: (base) => ({
                                                                ...base,
                                                                borderRadius: '8px',
                                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                                zIndex: 9999,
                                                                maxHeight: '200px',
                                                                overflowY: 'auto',
                                                            }),
                                                            menuPortal: (base) => ({
                                                                ...base,
                                                                zIndex: 9999,
                                                            }),
                                                            option: (base, state) => ({
                                                                ...base,
                                                                backgroundColor: state.isSelected 
                                                                    ? '#374151' 
                                                                    : state.isFocused 
                                                                        ? '#f3f4f6' 
                                                                        : 'white',
                                                                color: state.isSelected ? 'white' : '#374151',
                                                                '&:hover': {
                                                                    backgroundColor: state.isSelected ? '#374151' : '#f3f4f6',
                                                                },
                                                            }),
                                                        }}
                                                    />
                                                </div>
                                            );
                                        }

                                        if (field.type === "numericRange") {
                                            const minKey =
                                                "min" + field.key.charAt(0).toUpperCase() + field.key.slice(1);
                                            const maxKey =
                                                "max" + field.key.charAt(0).toUpperCase() + field.key.slice(1);
                                            return (
                                                <div key={field.key} className="space-y-3">
                                                    <label className="block text-sm font-semibold text-gray-900">
                                                        {field.label} Range
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <input
                                                                type="number"
                                                                placeholder={`Min ${field.label}`}
                                                                value={localFilters[minKey] || ""}
                                                                onChange={(e) => handleInputChange(minKey, e.target.value)}
                                                                min={field.min}
                                                                max={field.max}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                                                            />
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="number"
                                                                placeholder={`Max ${field.label}`}
                                                                value={localFilters[maxKey] || ""}
                                                                onChange={(e) => handleInputChange(maxKey, e.target.value)}
                                                                min={field.min}
                                                                max={field.max}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-white px-6 py-5">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => {
                                setLocalFilters({});
                                setLocalCategory("VEHICLE");
                                onReset();
                            }}
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
                                onClick={() => {
                                    onFiltersChange(localFilters);
                                    if (localCategory !== selectedCategory) {
                                        onCategoryChange(localCategory);
                                    }
                                    onClose();
                                }}
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
