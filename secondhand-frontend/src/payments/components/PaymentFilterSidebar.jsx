import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

const PaymentFilterSidebar = ({
    isOpen,
    onClose,
    filters,
    onFilterChange,
    onReset,
    hasActiveFilters,
}) => {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleInputChange = useCallback((field, value) => {
        setLocalFilters((prev) => ({ ...prev, [field]: value }));
        onFilterChange(field, value);
    }, [onFilterChange]);

    const handleReset = useCallback(() => {
        const resetFilters = {
            seller: '',
            transactionType: '',
            paymentType: '',
            dateFrom: '',
            dateTo: '',
            amountMin: '',
            amountMax: '',
            paymentDirection: ''
        };
        setLocalFilters(resetFilters);
        onReset();
    }, [onReset]);

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}
            <div className={`
                fixed left-0 top-0 h-screen w-80 bg-white shadow-xl z-50 border-r border-gray-200 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Filters</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50 overscroll-contain">
                    <div className="p-4 space-y-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Filters</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleInputChange('paymentDirection', localFilters.paymentDirection === 'INCOMING' ? '' : 'INCOMING')}
                                    className={`w-full p-2.5 rounded-lg border transition-all duration-200 text-left ${
                                        localFilters.paymentDirection === 'INCOMING'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="text-sm font-medium">💰 Incoming</span>
                                </button>
                                <button
                                    onClick={() => handleInputChange('paymentDirection', localFilters.paymentDirection === 'OUTGOING' ? '' : 'OUTGOING')}
                                    className={`w-full p-2.5 rounded-lg border transition-all duration-200 text-left ${
                                        localFilters.paymentDirection === 'OUTGOING'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="text-sm font-medium">💸 Outgoing</span>
                                </button>
                                <button
                                    onClick={() => handleInputChange('transactionType', localFilters.transactionType === 'ITEM_PURCHASE' ? '' : 'ITEM_PURCHASE')}
                                    className={`w-full p-2.5 rounded-lg border transition-all duration-200 text-left ${
                                        localFilters.transactionType === 'ITEM_PURCHASE'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="text-sm font-medium">🛒 Purchases</span>
                                </button>
                                <button
                                    onClick={() => handleInputChange('paymentType', localFilters.paymentType === 'EWALLET' ? '' : 'EWALLET')}
                                    className={`w-full p-2.5 rounded-lg border transition-all duration-200 text-left ${
                                        localFilters.paymentType === 'EWALLET'
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="text-sm font-medium">💳 eWallet</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Seller</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search seller..."
                                    value={localFilters.seller || ''}
                                    onChange={(e) => handleInputChange('seller', e.target.value)}
                                    className="w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                                />
                                <svg className="absolute left-2 top-2.5 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Transaction Type</h3>
                            <select
                                value={localFilters.transactionType || ''}
                                onChange={(e) => handleInputChange('transactionType', e.target.value)}
                                className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                            >
                                <option value="">All Transaction Types</option>
                                <option value="ITEM_PURCHASE">🛒 Item Purchase</option>
                                <option value="LISTING_CREATION">📝 Listing Creation</option>
                                <option value="SHOWCASE_PAYMENT">⭐ Showcase Payment</option>
                                <option value="REFUND">↩️ Refund</option>
                            </select>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Method</h3>
                            <select
                                value={localFilters.paymentType || ''}
                                onChange={(e) => handleInputChange('paymentType', e.target.value)}
                                className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                            >
                                <option value="">All Payment Methods</option>
                                <option value="CREDIT_CARD">💳 Credit Card</option>
                                <option value="TRANSFER">🏦 Bank Transfer</option>
                                <option value="EWALLET">💰 eWallet</option>
                            </select>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Direction</h3>
                            <select
                                value={localFilters.paymentDirection || ''}
                                onChange={(e) => handleInputChange('paymentDirection', e.target.value)}
                                className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                            >
                                <option value="">All Directions</option>
                                <option value="INCOMING">📈 Incoming</option>
                                <option value="OUTGOING">📉 Outgoing</option>
                            </select>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Date Range</h3>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">From Date</label>
                                    <input
                                        type="date"
                                        value={localFilters.dateFrom || ''}
                                        onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                                        className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">To Date</label>
                                    <input
                                        type="date"
                                        value={localFilters.dateTo || ''}
                                        onChange={(e) => handleInputChange('dateTo', e.target.value)}
                                        className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Amount Range</h3>
                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        min="0"
                                        step="0.01"
                                        value={localFilters.amountMin || ''}
                                        onChange={(e) => handleInputChange('amountMin', e.target.value)}
                                        className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                    <span className="absolute left-2 top-2 text-gray-400 text-xs">₺</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        min="0"
                                        step="0.01"
                                        value={localFilters.amountMax || ''}
                                        onChange={(e) => handleInputChange('amountMax', e.target.value)}
                                        className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                    <span className="absolute left-2 top-2 text-gray-400 text-xs">₺</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 bg-white px-4 py-3 flex-shrink-0">
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleReset}
                            className="w-full px-3 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentFilterSidebar;

