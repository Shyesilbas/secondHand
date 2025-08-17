import React, { useState } from 'react';
import { useEnums } from '../../../hooks/useEnums';
import { createClothingFilterRequest } from '../../../types/clothing';

const ClothingFilters = ({ onFiltersChange, initialFilters = {} }) => {
    const { enums } = useEnums();
    const [filters, setFilters] = useState({
        brands: initialFilters.brands || [],
        types: initialFilters.types || [],
        colors: initialFilters.colors || [],
        conditions: initialFilters.conditions || [],
        minPrice: initialFilters.minPrice || '',
        maxPrice: initialFilters.maxPrice || '',
        minPurchaseDate: initialFilters.minPurchaseDate || '',
        maxPurchaseDate: initialFilters.maxPurchaseDate || '',
        sortBy: initialFilters.sortBy || '',
        sortOrder: initialFilters.sortOrder || 'desc'
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange(createClothingFilterRequest(newFilters));
    };

    const handleMultiSelectChange = (key, value, checked) => {
        const currentValues = filters[key] || [];
        const newValues = checked
            ? [...currentValues, value]
            : currentValues.filter(v => v !== value);
        
        handleFilterChange(key, newValues);
    };

    const clearFilters = () => {
        const clearedFilters = {
            brands: [],
            types: [],
            colors: [],
            conditions: [],
            minPrice: '',
            maxPrice: '',
            minPurchaseDate: '',
            maxPurchaseDate: '',
            sortBy: '',
            sortOrder: 'desc'
        };
        setFilters(clearedFilters);
        onFiltersChange(createClothingFilterRequest(clearedFilters));
    };

    const renderMultiSelect = (label, key, options) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
                {options?.map((option) => (
                    <label key={option.value} className="flex items-center">
                        <input
                            type="checkbox"
                            checked={filters[key]?.includes(option.value) || false}
                            onChange={(e) => handleMultiSelectChange(key, option.value, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderInput = (label, key, type = 'text', placeholder = '') => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
                type={type}
                value={filters[key]}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );

    const renderSelect = (label, key, options) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <select
                value={filters[key]}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All</option>
                {options?.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Clear All
                </button>
            </div>

            <div className="space-y-6">
                {/* Clothing Specific Filters */}
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Clothing Details</h4>
                    {renderMultiSelect('Brands', 'brands', enums?.clothingBrands)}
                    {renderMultiSelect('Types', 'types', enums?.clothingTypes)}
                    {renderMultiSelect('Colors', 'colors', enums?.colors)}
                    {renderMultiSelect('Conditions', 'conditions', enums?.clothingConditions)}
                </div>

                {/* Price Range */}
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {renderInput('Min Price', 'minPrice', 'number', 'Min')}
                        {renderInput('Max Price', 'maxPrice', 'number', 'Max')}
                    </div>
                </div>

                {/* Purchase Date Range */}
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Purchase Date</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {renderInput('From', 'minPurchaseDate', 'date')}
                        {renderInput('To', 'maxPurchaseDate', 'date')}
                    </div>
                </div>

                {/* Sort Options */}
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Sort By</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {renderSelect('Sort Field', 'sortBy', [
                            { value: 'price', label: 'Price' },
                            { value: 'createdAt', label: 'Date Created' },
                            { value: 'title', label: 'Title' },
                            { value: 'brand', label: 'Brand' },
                            { value: 'type', label: 'Type' },
                            { value: 'condition', label: 'Condition' }
                        ])}
                        {renderSelect('Order', 'sortOrder', [
                            { value: 'asc', label: 'Ascending' },
                            { value: 'desc', label: 'Descending' }
                        ])}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClothingFilters;
