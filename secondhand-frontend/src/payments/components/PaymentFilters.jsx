import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';

const PaymentFilters = React.memo(({
    filters,
    showFilters,
    hasActiveFilters,
    onFilterChange,
    onClearFilters,
    onToggleFilters,
    filteredPayments,
    allPayments
}) => {
    return (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Advanced Filters
                            </h3>
                            <p className="text-sm text-gray-500">
                                Filter your payment history
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear All
                            </button>
                        )}
                        <button
                            onClick={onToggleFilters}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>
                </div>
            </div>

            {showFilters && (
                <div className="p-6 bg-gray-50">
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h4>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => onFilterChange('paymentDirection', 'INCOMING')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                    filters.paymentDirection === 'INCOMING'
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                💰 Incoming
                            </button>
                            <button
                                onClick={() => onFilterChange('paymentDirection', 'OUTGOING')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                    filters.paymentDirection === 'OUTGOING'
                                        ? 'bg-red-100 text-red-800 border border-red-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                💸 Outgoing
                            </button>
                            <button
                                onClick={() => onFilterChange('transactionType', 'ITEM_PURCHASE')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                    filters.transactionType === 'ITEM_PURCHASE'
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                🛒 Purchases
                            </button>
                            <button
                                onClick={() => onFilterChange('paymentType', 'EWALLET')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                    filters.paymentType === 'EWALLET'
                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                💳 eWallet
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Seller Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search seller..."
                                        value={filters.seller}
                                        onChange={(e) => onFilterChange('seller', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Transaction Type
                                </label>
                                <select
                                    value={filters.transactionType}
                                    onChange={(e) => onFilterChange('transactionType', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">All Transaction Types</option>
                                    <option value="ITEM_PURCHASE">🛒 Item Purchase</option>
                                    <option value="LISTING_CREATION">📝 Listing Creation</option>
                                    <option value="SHOWCASE_PAYMENT">⭐ Showcase Payment</option>
                                    <option value="REFUND">↩️ Refund</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Payment Method
                                </label>
                                <select
                                    value={filters.paymentType}
                                    onChange={(e) => onFilterChange('paymentType', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">All Payment Methods</option>
                                    <option value="CREDIT_CARD">💳 Credit Card</option>
                                    <option value="TRANSFER">🏦 Bank Transfer</option>
                                    <option value="EWALLET">💰 eWallet</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                    Payment Direction
                                </label>
                                <select
                                    value={filters.paymentDirection}
                                    onChange={(e) => onFilterChange('paymentDirection', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">All Directions</option>
                                    <option value="INCOMING">📈 Incoming</option>
                                    <option value="OUTGOING">📉 Outgoing</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => onFilterChange('dateTo', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    Minimum Amount (TRY)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        value={filters.amountMin}
                                        onChange={(e) => onFilterChange('amountMin', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm">₺</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    Maximum Amount (TRY)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="∞"
                                        min="0"
                                        step="0.01"
                                        value={filters.amountMax}
                                        onChange={(e) => onFilterChange('amountMax', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm">₺</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-blue-800">
                                        Filter Results
                                    </span>
                                </div>
                                <span className="text-sm text-blue-700">
                                    {filteredPayments.length} of {allPayments.length} payments
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default PaymentFilters;
