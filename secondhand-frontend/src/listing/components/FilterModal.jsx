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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Advanced Filters</h2>
                    <div className="flex gap-2">
                        {steps.map((step) => (
                            <button
                                key={step.id}
                                onClick={() => setActiveStep(step.id)}
                                className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium ${
                                    activeStep === step.id
                                        ? "bg-gray-900 text-white"
                                        : "bg-white border text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <span>{step.icon}</span> {step.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 relative">
                    {activeStep === "category" && (
                        <CategorySelector
                            selectedCategory={localCategory}
                            onCategoryChange={(c) => setLocalCategory(c)}
                        />
                    )}

                    {activeStep === "price" && (
                        <PriceLocationFields
                            filters={localFilters}
                            onPriceChange={handleInputChange}
                            onInputChange={handleInputChange}
                        />
                    )}

                    {activeStep === "filters" && filterConfig && (
                        <div className="space-y-6">
                            {filterConfig.getFields().map((field) => {
                                if (field.type === "enum") {
                                    const selectedValues = localFilters[field.key] || [];

                                    return (
                                        <div key={field.key} className="space-y-3">
                                            <h4 className="font-medium text-gray-800">{field.label}</h4>
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
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        minHeight: '48px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '12px',
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
                                                        borderRadius: '8px',
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
                                                        borderRadius: '12px',
                                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                        zIndex: 9999,
                                                        position: 'absolute',
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
                                            <h4 className="font-medium text-gray-800">{field.label} Range</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="number"
                                                    placeholder={`Min ${field.label}`}
                                                    value={localFilters[minKey] || ""}
                                                    onChange={(e) => handleInputChange(minKey, e.target.value)}
                                                    min={field.min}
                                                    max={field.max}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder={`Max ${field.label}`}
                                                    value={localFilters[maxKey] || ""}
                                                    onChange={(e) => handleInputChange(maxKey, e.target.value)}
                                                    min={field.min}
                                                    max={field.max}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    );
                                }

                                return null;
                            })}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="border-t bg-white px-6 py-4 flex justify-between">
                    <button
                        onClick={() => {
                            setLocalFilters({});
                            setLocalCategory("VEHICLE");
                            onReset();
                        }}
                        className="px-5 py-2 rounded-xl border bg-white text-gray-700 hover:bg-gray-100"
                    >
                        Reset
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 rounded-xl border bg-white text-gray-700 hover:bg-gray-100"
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
                            className="px-6 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
