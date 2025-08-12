import React from 'react';
import { useEnums } from '../../../hooks/useEnums';
import { LISTING_TYPE_ICONS } from '../../../utils/constants';

const CategorySelector = ({ selectedCategory, onCategoryChange }) => {
    const { enums, isLoading: enumsLoading } = useEnums();

    if (enumsLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-500">
                        <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Loading categories...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Categories</h3>
                <p className="text-sm text-slate-500 mt-1">
                    Choose a category to see relevant filters
                </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
                {/* All Categories Button */}
                <button
                    onClick={() => onCategoryChange(null)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        selectedCategory === null
                            ? 'bg-slate-600 text-white border-slate-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                >
                    <span className="text-lg">🏷️</span>
                    <span>All Categories</span>
                </button>

                {/* Category Buttons */}
                {enums.listingTypes.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => onCategoryChange(type.value)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                            selectedCategory === type.value
                                ? 'bg-slate-600 text-white border-slate-600 shadow-md'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                    >
                        <span className="text-lg">
                            {LISTING_TYPE_ICONS[type.value] || type.icon || '📦'}
                        </span>
                        <span>{type.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategorySelector;