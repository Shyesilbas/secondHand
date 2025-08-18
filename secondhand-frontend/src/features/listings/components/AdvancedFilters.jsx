import React, { useState } from 'react';
import { useEnums } from '../../../hooks/useEnums';
import EnumDropdown from '../../../components/ui/EnumDropdown';

const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  onReset, 
  selectedCategory,
  updateSingleFilter,
  updateArrayFilter 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { enums, isLoading: enumsLoading } = useEnums();

    const handleInputChange = (field, value) => {
        if (updateSingleFilter) {
            updateSingleFilter(field, value);
        } else {
            onFiltersChange({ [field]: value });
        }
    };

    const handleArrayChange = (field, value) => {
        if (updateArrayFilter) {
            updateArrayFilter(field, value);
        } else {
            const currentArray = filters[field] || [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            onFiltersChange({ [field]: newArray });
        }
    };

    const handlePriceChange = (field, value) => {
        const numericValue = value === '' ? null : parseFloat(value);
        handleInputChange(field, numericValue);
    };

    const handleYearChange = (field, value) => {
        const numericValue = value === '' ? null : parseInt(value);
        handleInputChange(field, numericValue);
    };

    const currentYear = new Date().getFullYear();

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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-slate-800">Advanced Filters</h3>
                    </div>
                    {selectedCategory && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>•</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        {isExpanded ? 'Hide' : 'Show'} Filters
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={onReset}
                        className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 underline transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Filter Content */}
            {isExpanded && (
                <div className="space-y-6">
                    {/* Price Range */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Min Price</label>
                            <input
                                type="number"
                                value={filters.minPrice || ''}
                                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Max Price</label>
                            <input
                                type="number"
                                value={filters.maxPrice || ''}
                                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                placeholder="∞"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                            <EnumDropdown 
                                label="" 
                                enumKey="currencies" 
                                value={filters.currency || 'TRY'} 
                                onChange={(value) => handleInputChange('currency', value)} 
                                multiple={false} 
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                            <input
                                type="text"
                                value={filters.city || ''}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                placeholder="Istanbul"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">District</label>
                            <input
                                type="text"
                                value={filters.district || ''}
                                onChange={(e) => handleInputChange('district', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                placeholder="Kadikoy"
                            />
                        </div>
                    </div>

                    {/* Vehicle-specific filters */}
                    {selectedCategory === 'VEHICLE' && (
                        <div className="border-t border-slate-200 pt-6">
                            <h4 className="text-md font-medium text-slate-800 mb-4">Vehicle Filters</h4>
                            
                            {/* Brands */}
                            <div className="mb-4">
                                <EnumDropdown 
                                    label="Brands" 
                                    enumKey="carBrands" 
                                    value={filters.brands || []} 
                                    onChange={(values) => handleInputChange('brands', values)} 
                                    multiple={true} 
                                />
                            </div>

                            {/* Year and Mileage */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Year</label>
                                    <input
                                        type="number"
                                        min="1980"
                                        max={currentYear}
                                        value={filters.minYear || ''}
                                        onChange={(e) => handleYearChange('minYear', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="2000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Year</label>
                                    <input
                                        type="number"
                                        min="1980"
                                        max={currentYear}
                                        value={filters.maxYear || ''}
                                        onChange={(e) => handleYearChange('maxYear', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder={currentYear.toString()}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Mileage</label>
                                    <input
                                        type="number"
                                        value={filters.maxMileage || ''}
                                        onChange={(e) => handleYearChange('maxMileage', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="200000"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Vehicle specifications */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <EnumDropdown 
                                        label="Fuel Type" 
                                        enumKey="fuelTypes" 
                                        value={filters.fuelTypes || []} 
                                        onChange={(values) => handleInputChange('fuelTypes', values)} 
                                        multiple={true} 
                                    />
                                </div>
                                <div>
                                    <EnumDropdown 
                                        label="Gear Type" 
                                        enumKey="gearTypes" 
                                        value={filters.gearTypes || []} 
                                        onChange={(values) => handleInputChange('gearTypes', values)} 
                                        multiple={true} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <EnumDropdown 
                                        label="Seat Count" 
                                        enumKey="seatCounts" 
                                        value={filters.seatCounts || []} 
                                        onChange={(values) => handleInputChange('seatCounts', values)} 
                                        multiple={true} 
                                    />
                                </div>
                                <div>
                                    <EnumDropdown 
                                        label="Color" 
                                        enumKey="colors" 
                                        value={filters.colors || []} 
                                        onChange={(values) => handleInputChange('colors', values)} 
                                        multiple={true} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Electronics-specific filters */}
                    {selectedCategory === 'ELECTRONICS' && (
                        <div className="border-t border-slate-200 pt-6">
                            <h4 className="text-md font-medium text-slate-800 mb-4">Electronics Filters</h4>
                            
                            {/* Electronics specifications */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <EnumDropdown 
                                        label="Electronic Type" 
                                        enumKey="electronicTypes" 
                                        value={filters.electronicTypes || []} 
                                        onChange={(values) => handleInputChange('electronicTypes', values)} 
                                        multiple={true} 
                                    />
                                </div>
                                <div>
                                    <EnumDropdown 
                                        label="Electronic Brand" 
                                        enumKey="electronicBrands" 
                                        value={filters.electronicBrands || []} 
                                        onChange={(values) => handleInputChange('electronicBrands', values)} 
                                        multiple={true} 
                                    />
                                </div>
                            </div>

                            {/* Year and Color for electronics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Year</label>
                                    <input
                                        type="number"
                                        min="1990"
                                        max={currentYear}
                                        value={filters.minYear || ''}
                                        onChange={(e) => handleYearChange('minYear', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="2020"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Year</label>
                                    <input
                                        type="number"
                                        min="1990"
                                        max={currentYear}
                                        value={filters.maxYear || ''}
                                        onChange={(e) => handleYearChange('maxYear', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder={currentYear.toString()}
                                    />
                                </div>
                                <div>
                                    <EnumDropdown 
                                        label="Color" 
                                        enumKey="colors" 
                                        value={filters.colors || []} 
                                        onChange={(values) => handleInputChange('colors', values)} 
                                        multiple={true} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Real Estate-specific filters */}
                    {selectedCategory === 'REAL_ESTATE' && (
                        <div className="border-t border-slate-200 pt-6">
                            <h4 className="text-md font-medium text-slate-800 mb-4">Real Estate Filters</h4>
                            
                            {/* Ad Type and Owner Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <EnumDropdown 
                                        label="Ad Type" 
                                        enumKey="realEstateAdTypes" 
                                        value={filters.adType || ''} 
                                        onChange={(value) => handleInputChange('adType', value)} 
                                        multiple={false} 
                                    />
                                </div>
                                <div>
                                    <EnumDropdown 
                                        label="Owner Type" 
                                        enumKey="ownerTypes" 
                                        value={filters.ownerType || ''} 
                                        onChange={(value) => handleInputChange('ownerType', value)} 
                                        multiple={false} 
                                    />
                                </div>
                            </div>

                            {/* Property Type and Heating Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <EnumDropdown 
                                        label="Property Type" 
                                        enumKey="realEstateTypes" 
                                        value={filters.realEstateTypes || []} 
                                        onChange={(values) => handleInputChange('realEstateTypes', values)} 
                                        multiple={true} 
                                    />
                                </div>
                                <div>
                                    <EnumDropdown 
                                        label="Heating Type" 
                                        enumKey="heatingTypes" 
                                        value={filters.heatingTypes || []} 
                                        onChange={(values) => handleInputChange('heatingTypes', values)} 
                                        multiple={true} 
                                    />
                                </div>
                            </div>

                            {/* Square Meters Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Square Meters</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.minSquareMeters || ''}
                                        onChange={(e) => handleYearChange('minSquareMeters', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Square Meters</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.maxSquareMeters || ''}
                                        onChange={(e) => handleYearChange('maxSquareMeters', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="200"
                                    />
                                </div>
                            </div>

                            {/* Room Count Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Room Count</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.minRoomCount || ''}
                                        onChange={(e) => handleYearChange('minRoomCount', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Room Count</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.maxRoomCount || ''}
                                        onChange={(e) => handleYearChange('maxRoomCount', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="5"
                                    />
                                </div>
                            </div>

                            {/* Bathroom Count Range and Floor */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Bathroom Count</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.minBathroomCount || ''}
                                        onChange={(e) => handleYearChange('minBathroomCount', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Bathroom Count</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.maxBathroomCount || ''}
                                        onChange={(e) => handleYearChange('maxBathroomCount', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="3"
                                    />
                                </div>
                            </div>

                            {/* Floor and Building Age */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Floor</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.floor || ''}
                                        onChange={(e) => handleYearChange('floor', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Building Age</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.minBuildingAge || ''}
                                        onChange={(e) => handleYearChange('minBuildingAge', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Max Building Age and Furnished */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Building Age</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.maxBuildingAge || ''}
                                        onChange={(e) => handleYearChange('maxBuildingAge', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Furnished</label>
                                    <select
                                        value={filters.furnished ? 'true' : 'false'}
                                        onChange={(e) => handleInputChange('furnished', e.target.value === 'true')}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                    >
                                        <option value="">Any</option>
                                        <option value="true">Furnished</option>
                                        <option value="false">Not Furnished</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Clothing-specific filters */}
                    {selectedCategory === 'CLOTHING' && (
                        <div className="border-t border-slate-200 pt-6">
                            <h4 className="text-md font-medium text-slate-800 mb-4">Clothing Filters</h4>
                            
                            {/* Brand and Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <EnumDropdown 
                                        label="Brand" 
                                        enumKey="clothingBrands" 
                                        value={filters.brands || []} 
                                        onChange={(values) => handleInputChange('brands', values)} 
                                        multiple={true} 
                                    />
                                </div>
                                <div>
                                    <EnumDropdown 
                                        label="Type" 
                                        enumKey="clothingTypes" 
                                        value={filters.types || []} 
                                        onChange={(values) => handleInputChange('types', values)} 
                                        multiple={true} 
                                    />
                                </div>
                            </div>

                            {/* Color and Condition */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <EnumDropdown 
                                        label="Color" 
                                        enumKey="colors" 
                                        value={filters.colors || []} 
                                        onChange={(values) => handleInputChange('colors', values)} 
                                        multiple={true} 
                                    />
                                </div>
                                <div>
                                    <EnumDropdown 
                                        label="Condition" 
                                        enumKey="clothingConditions" 
                                        value={filters.conditions || []} 
                                        onChange={(values) => handleInputChange('conditions', values)} 
                                        multiple={true} 
                                    />
                                </div>
                            </div>

                            {/* Purchase Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Purchase Date</label>
                                    <input
                                        type="date"
                                        value={filters.minPurchaseDate || ''}
                                        onChange={(e) => handleInputChange('minPurchaseDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Purchase Date</label>
                                    <input
                                        type="date"
                                        value={filters.maxPurchaseDate || ''}
                                        onChange={(e) => handleInputChange('maxPurchaseDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Books-specific filters */}
                    {selectedCategory === 'BOOKS' && (
                        <div className="border-t border-slate-200 pt-6">
                            <h4 className="text-md font-medium text-slate-800 mb-4">Books Filters</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <EnumDropdown 
                                        label="Genre" 
                                        enumKey="bookGenres" 
                                        value={filters.genres || []} 
                                        onChange={(values) => handleInputChange('genres', values)} 
                                        multiple={true} 
                                    />
                                </div>
                                <div>
                                    <EnumDropdown 
                                        label="Language" 
                                        enumKey="bookLanguages" 
                                        value={filters.languages || []} 
                                        onChange={(values) => handleInputChange('languages', values)} 
                                        multiple={true} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <EnumDropdown 
                                        label="Format" 
                                        enumKey="bookFormats" 
                                        value={filters.formats || []} 
                                        onChange={(values) => handleInputChange('formats', values)} 
                                        multiple={true} 
                                    />
                                </div>
                                <div>
                                    <EnumDropdown 
                                        label="Condition" 
                                        enumKey="bookConditions" 
                                        value={filters.conditions || []} 
                                        onChange={(values) => handleInputChange('conditions', values)} 
                                        multiple={true} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Year</label>
                                    <input
                                        type="number"
                                        min="1450"
                                        max={currentYear}
                                        value={filters.minYear || ''}
                                        onChange={(e) => handleYearChange('minYear', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="2000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Year</label>
                                    <input
                                        type="number"
                                        min="1450"
                                        max={currentYear}
                                        value={filters.maxYear || ''}
                                        onChange={(e) => handleYearChange('maxYear', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder={currentYear.toString()}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Page Count</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.minPageCount || ''}
                                        onChange={(e) => handleYearChange('minPageCount', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="50"
                                    />
                                </div>
                                <div>
                                    <label className="block text sm font-medium text-slate-700 mb-2">Max Page Count</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.maxPageCount || ''}
                                        onChange={(e) => handleYearChange('maxPageCount', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="1000"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sorting */}
                    <div className="border-t border-slate-200 pt-6">
                        <h4 className="text-md font-medium text-slate-800 mb-4">Sorting</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                                <select
                                    value={filters.sortBy || 'createdAt'}
                                    onChange={(e) => handleInputChange('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                >
                                    <option value="createdAt">Date</option>
                                    <option value="price">Price</option>
                                    {selectedCategory === 'VEHICLE' && (
                                        <>
                                            <option value="year">Year</option>
                                            <option value="mileage">Mileage</option>
                                            <option value="brand">Brand</option>
                                        </>
                                    )}
                                    {selectedCategory === 'ELECTRONICS' && (
                                        <>
                                            <option value="year">Year</option>
                                            <option value="brand">Brand</option>
                                            <option value="type">Type</option>
                                        </>
                                    )}
                                    {selectedCategory === 'REAL_ESTATE' && (
                                        <>
                                            <option value="squareMeters">Square Meters</option>
                                            <option value="roomCount">Room Count</option>
                                            <option value="buildingAge">Building Age</option>
                                            <option value="floor">Floor</option>
                                        </>
                                    )}
                                    {selectedCategory === 'CLOTHING' && (
                                        <>
                                            <option value="brand">Brand</option>
                                            <option value="type">Type</option>
                                            <option value="condition">Condition</option>
                                            <option value="purchaseDate">Purchase Date</option>
                                        </>
                                    )}
                                    {selectedCategory === 'BOOKS' && (
                                        <>
                                            <option value="author">Author</option>
                                            <option value="publicationYear">Year</option>
                                            <option value="pageCount">Page Count</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Sort Direction</label>
                                <select
                                    value={filters.sortDirection || 'DESC'}
                                    onChange={(e) => handleInputChange('sortDirection', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                >
                                    <option value="DESC">Descending</option>
                                    <option value="ASC">Ascending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilters;