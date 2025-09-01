import React, { useState } from 'react';
import { useEnums } from '../../hooks/useEnums';
import { filtersRegistry } from './filters/filtersRegistry';
import FiltersHeader from './filters/shared/FiltersHeader';
import PriceLocationFields from './filters/shared/PriceLocationFields';
import SortingControls from './filters/shared/SortingControls';

const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  onReset, 
  selectedCategory,
  updateSingleFilter}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { enums, isLoading: enumsLoading } = useEnums();

    const handleInputChange = (field, value) => {
        if (updateSingleFilter) {
            updateSingleFilter(field, value);
        } else {
            onFiltersChange({ [field]: value });
        }
    };


    const handlePriceChange = (field, value) => {
        const numericValue = value === '' ? null : parseFloat(value);
        handleInputChange(field, numericValue);
    };


    if (enumsLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-500">
                        <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Loading filters...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Header */}
            <FiltersHeader isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} onReset={onReset} selectedCategory={selectedCategory} />

            {/* Filter Content */}
            {isExpanded && (
                <div className="space-y-6">
                    <PriceLocationFields filters={filters} onPriceChange={handlePriceChange} onInputChange={handleInputChange} />

                    {(() => {
                        const entry = filtersRegistry[selectedCategory];
                        if (!entry?.component) return null;
                        const FilterComp = entry.component;
                        const onChange = (field, value) => handleInputChange(field, value);
                        return <FilterComp filters={filters} onChange={onChange} />;
                    })()}
                    <SortingControls 
                      filters={filters} 
                      onChange={handleInputChange} 
                      sortOptions={(filtersRegistry[selectedCategory]?.sortOptions) || []} 
                    />
                </div>
            )}
        </div>
    );
};

export default AdvancedFilters;