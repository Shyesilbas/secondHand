import React, { useState } from 'react';
import { useEnums } from '../../../hooks/useEnums';
import { LISTING_TYPE_ICONS } from '../../../utils/constants';
import SearchableDropdown from '../../../components/ui/SearchableDropdown';

const AdvancedFilters = ({ filters, onFiltersChange, onReset, selectedCategory }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { enums, isLoading: enumsLoading } = useEnums();

    const handleInputChange = (field, value) => {
        onFiltersChange({ [field]: value });
    };

    const handleArrayChange = (field, value) => {
        const currentArray = filters[field] || [];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];
        onFiltersChange({ [field]: newArray });
    };

    const handlePriceChange = (field, value) => {
        const numericValue = value === '' ? '' : parseFloat(value);
        onFiltersChange({ [field]: numericValue });
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
                        Filtreler yükleniyor...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Reset Button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onReset}
                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Clear All
                </button>
            </div>

            {/* Filters Content */}
            <div className="space-y-6">


                    {/* Fiyat Aralığı */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Min Fiyat</label>
                            <input
                                type="number"
                                value={filters.minPrice || ''}
                                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Max Fiyat</label>
                            <input
                                type="number"
                                value={filters.maxPrice || ''}
                                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                placeholder="∞"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Para Birimi</label>
                            <select
                                value={filters.currency || 'TRY'}
                                onChange={(e) => handleInputChange('currency', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                            >
                                {enums.currencies.map((currency) => (
                                    <option key={currency.value} value={currency.value}>
                                        {currency.label} ({currency.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Konum */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Şehir</label>
                            <input
                                type="text"
                                value={filters.city || ''}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                placeholder="İstanbul"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">İlçe</label>
                            <input
                                type="text"
                                value={filters.district || ''}
                                onChange={(e) => handleInputChange('district', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                placeholder="Kadıköy"
                            />
                        </div>
                    </div>

                    {/* Araç Spesifik Filtreler */}
                    {selectedCategory === 'VEHICLE' && (
                        <div className="border-t border-slate-200 pt-6">
                            <h4 className="text-md font-medium text-slate-800 mb-4">Araç Filtreleri</h4>
                            
                            {/* Markalar */}
                            <div className="mb-4">
                                <SearchableDropdown
                                    label="Markalar"
                                    options={enums.carBrands}
                                    selectedValues={filters.brands || []}
                                    onSelectionChange={(values) => handleInputChange('brands', values)}
                                    placeholder="Select brands..."
                                    searchPlaceholder="Search brands..."
                                    multiple={true}
                                />
                            </div>

                            {/* Yıl ve Kilometre */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Yıl</label>
                                    <input
                                        type="number"
                                        min="1980"
                                        max={currentYear}
                                        value={filters.minYear || ''}
                                        onChange={(e) => handleInputChange('minYear', parseInt(e.target.value) || '')}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="2000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Yıl</label>
                                    <input
                                        type="number"
                                        min="1980"
                                        max={currentYear}
                                        value={filters.maxYear || ''}
                                        onChange={(e) => handleInputChange('maxYear', parseInt(e.target.value) || '')}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder={currentYear.toString()}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Kilometre</label>
                                    <input
                                        type="number"
                                        value={filters.maxMileage || ''}
                                        onChange={(e) => handleInputChange('maxMileage', parseInt(e.target.value) || '')}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="200000"
                                    />
                                </div>
                            </div>

                            {/* Yakıt Türü */}
                            <div className="mt-4">
                                <SearchableDropdown
                                    label="Yakıt Türü"
                                    options={enums.fuelTypes}
                                    selectedValues={filters.fuelTypes || []}
                                    onSelectionChange={(values) => handleInputChange('fuelTypes', values)}
                                    placeholder="Select fuel types..."
                                    searchPlaceholder="Search fuel types..."
                                    multiple={true}
                                />
                            </div>

                            {/* Renk */}
                            <div className="mt-4">
                                <SearchableDropdown
                                    label="Renk"
                                    options={enums.colors}
                                    selectedValues={filters.colors || []}
                                    onSelectionChange={(values) => handleInputChange('colors', values)}
                                    placeholder="Select colors..."
                                    searchPlaceholder="Search colors..."
                                    multiple={true}
                                />
                            </div>

                            {/* Vites Türü */}
                            <div className="mt-4">
                                <SearchableDropdown
                                    label="Vites Türü"
                                    options={enums.gearTypes}
                                    selectedValues={filters.gearTypes || []}
                                    onSelectionChange={(values) => handleInputChange('gearTypes', values)}
                                    placeholder="Vites türü seçin..."
                                    searchPlaceholder="Vites ara..."
                                    multiple={true}
                                />
                            </div>

                            {/* Koltuk Sayısı */}
                            <div className="mt-4">
                                <SearchableDropdown
                                    label="Koltuk Sayısı"
                                    options={enums.seatCounts}
                                    selectedValues={filters.seatCounts || []}
                                    onSelectionChange={(values) => handleInputChange('seatCounts', values)}
                                    placeholder="Koltuk sayısı seçin..."
                                    searchPlaceholder="Koltuk ara..."
                                    multiple={true}
                                />
                            </div>
                        </div>
                    )}

                    {/* Sıralama */}
                    <div className="border-t border-slate-200 pt-6">
                        <h4 className="text-md font-medium text-slate-800 mb-4">Sıralama</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Sırala</label>
                                <select
                                    value={filters.sortBy || 'createdAt'}
                                    onChange={(e) => handleInputChange('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                >
                                    <option value="createdAt">Tarih</option>
                                    <option value="price">Fiyat</option>
                                    {selectedCategory === 'VEHICLE' && (
                                        <>
                                            <option value="year">Yıl</option>
                                            <option value="mileage">Kilometre</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Yön</label>
                                <select
                                    value={filters.sortDirection || 'DESC'}
                                    onChange={(e) => handleInputChange('sortDirection', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                >
                                    <option value="DESC">Azalan</option>
                                    <option value="ASC">Artan</option>
                                </select>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    );
};

export default AdvancedFilters;