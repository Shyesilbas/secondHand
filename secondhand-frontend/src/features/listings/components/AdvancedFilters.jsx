import React, { useState } from 'react';
import { useEnums } from '../../../hooks/useEnums';
import { LISTING_TYPE_ICONS } from '../../../utils/constants';

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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Gelişmiş Filtreler</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            İhtiyacınıza göre arama yapın
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onReset}
                            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Temizle
                        </button>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                        >
                            <span className="text-sm font-medium">
                                {isExpanded ? 'Gizle' : 'Filtreler'}
                            </span>
                            <svg 
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Content */}
            {isExpanded && (
                <div className="p-6 space-y-6">


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
                                <label className="block text-sm font-medium text-slate-700 mb-3">Markalar</label>
                                <div className="flex flex-wrap gap-2">
                                    {enums.carBrands.map((brand) => (
                                        <button
                                            key={brand.value}
                                            onClick={() => handleArrayChange('brands', brand.value)}
                                            className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                                                (filters.brands || []).includes(brand.value)
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {brand.label}
                                        </button>
                                    ))}
                                </div>
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
                                <label className="block text-sm font-medium text-slate-700 mb-3">Yakıt Türü</label>
                                <div className="flex flex-wrap gap-2">
                                    {enums.fuelTypes.map((fuel) => (
                                        <button
                                            key={fuel.value}
                                            onClick={() => handleArrayChange('fuelTypes', fuel.value)}
                                            className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                                                (filters.fuelTypes || []).includes(fuel.value)
                                                    ? 'bg-green-500 text-white border-green-500'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {fuel.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Renk */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 mb-3">Renk</label>
                                <div className="flex flex-wrap gap-2">
                                    {enums.colors.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => handleArrayChange('colors', color.value)}
                                            className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                                                (filters.colors || []).includes(color.value)
                                                    ? 'bg-purple-500 text-white border-purple-500'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {color.label}
                                        </button>
                                    ))}
                                </div>
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
            )}
        </div>
    );
};

export default AdvancedFilters;