import React, { useState, useEffect, useCallback } from "react";
import { useEnums } from "../../common/hooks/useEnums.js";
import { X, ChevronDown, ChevronRight } from "lucide-react";

const FilterSectionAccordion = ({ title, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left"
      >
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
      </button>
      {isOpen && <div className="p-4 border-t border-slate-100">{children}</div>}
    </div>
  );
};
import PriceLocationFields from "./filters/shared/PriceLocationFields.jsx";
import FilterRenderer from "./filters/FilterRenderer.jsx";
import { getListingConfig } from "../config/listingConfig.js";

const LISTING_STATUSES = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SOLD', label: 'Sold' },
    { value: 'RESERVED', label: 'Reserved' },
];

const FilterSidebar = ({
    mode = 'browse',
    isOpen,
    onClose,
    filters,
    onFiltersChange,
    onReset,
    selectedCategory,
    onCategoryChange,
    selectedStatus,
    onStatusChange,
}) => {
    const { enums, isLoading: enumsLoading } = useEnums();
    const [localFilters, setLocalFilters] = useState(filters);
    const [localCategory, setLocalCategory] = useState(selectedCategory);
    const [localStatus, setLocalStatus] = useState(selectedStatus ?? null);
    const [mineActiveTab, setMineActiveTab] = useState('category');

    useEffect(() => {
        setLocalFilters(filters);
        setLocalCategory(selectedCategory);
        setLocalStatus(selectedStatus ?? null);
    }, [filters, selectedCategory, selectedStatus]);

    const handleInputChange = useCallback((field, value) => {
        setLocalFilters((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleCategoryChange = useCallback((category) => {
        setLocalCategory(category);
        onCategoryChange(category);
    }, [onCategoryChange]);

    const handleStatusChange = useCallback((status) => {
        const next = status === localStatus ? null : status;
        setLocalStatus(next);
        onStatusChange?.(next);
    }, [localStatus, onStatusChange]);

    const handleReset = useCallback(() => {
        if (mode === 'mine') {
            setLocalFilters({ ...(filters || {}), page: 0, listingType: null });
            setLocalCategory(null);
            setLocalStatus(null);
            onReset();
            return;
        }
        setLocalFilters({});
        onReset();
    }, [filters, mode, onReset]);

    const handleApplyFilters = useCallback(() => {
        if (mode === 'mine') return;
        onFiltersChange(localFilters);
    }, [localFilters, mode, onFiltersChange]);

    const listingConfig = getListingConfig(selectedCategory);
    const filterConfig = listingConfig?.filterConfig;
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
                fixed left-0 top-0 h-screen w-80 bg-white shadow-xl z-50 border-r border-slate-200 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="border-b border-slate-200 bg-white px-4 py-3.5 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">Filters</h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            aria-label="Close filters"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/80 overscroll-contain">
                    <div className="p-4 space-y-3">
                        {mode === 'mine' ? (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setMineActiveTab('category')}
                                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                            mineActiveTab === 'category'
                                                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        Category
                                    </button>
                                    <button
                                        onClick={() => setMineActiveTab('status')}
                                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                            mineActiveTab === 'status'
                                                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        Status
                                    </button>
                                </div>
                                <div className="p-4">
                                    {mineActiveTab === 'category' && (
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => handleCategoryChange(null)}
                                                className={`w-full p-2.5 rounded-lg border transition-all duration-200 text-left ${
                                                    localCategory === null
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">All Categories</span>
                                                    {localCategory === null ? <div className="w-2 h-2 rounded-full bg-indigo-500"></div> : null}
                                                </div>
                                            </button>
                                            {(enums?.listingTypes || []).map((type) => (
                                                <button
                                                    key={type.value}
                                                    onClick={() => handleCategoryChange(type.value)}
                                                    className={`w-full p-2.5 rounded-lg border transition-all duration-200 text-left ${
                                                        localCategory === type.value
                                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">{type.label}</span>
                                                        {localCategory === type.value ? <div className="w-2 h-2 rounded-full bg-indigo-500"></div> : null}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {mineActiveTab === 'status' && (
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => handleStatusChange(null)}
                                                className={`w-full p-2.5 rounded-lg border transition-all duration-200 text-left ${
                                                    localStatus === null
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">All Statuses</span>
                                                    {localStatus === null ? <div className="w-2 h-2 rounded-full bg-indigo-500"></div> : null}
                                                </div>
                                            </button>
                                            {LISTING_STATUSES.map((status) => (
                                                <button
                                                    key={status.value}
                                                    onClick={() => handleStatusChange(status.value)}
                                                    className={`w-full p-2.5 rounded-lg border transition-all duration-200 text-left ${
                                                        localStatus === status.value
                                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">{status.label}</span>
                                                        {localStatus === status.value ? <div className="w-2 h-2 rounded-full bg-indigo-500"></div> : null}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category</h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => onCategoryChange(null)}
                                                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                    !selectedCategory
                                                        ? 'bg-slate-900 text-white shadow-sm'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                All
                                            </button>
                                            {(enums?.listingTypes || []).map((t) => {
                                                const typeConfig = getListingConfig(t.value);
                                                const icon = t.icon ?? typeConfig?.icon ?? '📦';
                                                return (
                                                    <button
                                                        key={t.value}
                                                        onClick={() => onCategoryChange(t.value)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                            selectedCategory === t.value
                                                                ? 'bg-slate-900 text-white shadow-sm'
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        <span>{icon}</span>
                                                        <span>{t.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Price & Location</h3>
                                    </div>
                                    <div className="p-4">
                                        <PriceLocationFields
                                            filters={localFilters}
                                            onPriceChange={handleInputChange}
                                            onInputChange={handleInputChange}
                                            compact={true}
                                        />
                                    </div>
                                </div>

                                {selectedCategory && (
                                    <FilterSectionAccordion
                                        title={`${listingConfig?.label || selectedCategory} Filters`}
                                        defaultOpen={true}
                                    >
                                        {filterConfig ? (
                                            <FilterRenderer
                                                config={filterConfig}
                                                filters={localFilters}
                                                onChange={handleInputChange}
                                                title=""
                                            />
                                        ) : (
                                            <div className="py-6 text-center">
                                                <p className="text-sm text-slate-500">No additional filters for this category.</p>
                                            </div>
                                        )}
                                    </FilterSectionAccordion>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="border-t border-slate-200 bg-white px-4 py-3 flex-shrink-0">
                    <div className="flex flex-col gap-2">
                        {mode === 'mine' ? null : (
                            <button
                                onClick={handleApplyFilters}
                                className="w-full px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
                            >
                                Apply Filters
                            </button>
                        )}
                        <button
                            onClick={handleReset}
                            className="w-full px-4 py-2 text-slate-600 text-sm font-medium hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FilterSidebar;

