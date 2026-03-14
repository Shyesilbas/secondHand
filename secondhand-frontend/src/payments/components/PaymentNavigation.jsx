import React, { useCallback, useEffect, useState } from "react";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    ShoppingCart,
    Wallet,
    X
} from "lucide-react";
import { DEFAULT_PAYMENT_FILTERS } from "../paymentSchema.js";

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
        setLocalFilters(DEFAULT_PAYMENT_FILTERS);
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
                fixed left-0 top-0 h-screen w-80 bg-white shadow-xl z-50 border-r border-slate-200 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="border-b border-slate-200 bg-white px-4 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold tracking-tight text-slate-900">Filters</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Refine payment history with precision</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50 overscroll-contain">
                    <div className="p-4 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Filters</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleInputChange('paymentDirection', localFilters.paymentDirection === 'INCOMING' ? '' : 'INCOMING')}
                                    className={`w-full p-2.5 rounded-xl border transition-all duration-200 text-left ${
                                        localFilters.paymentDirection === 'INCOMING'
                                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-sm font-medium inline-flex items-center gap-2">
                                        <ArrowDownCircle className="w-4 h-4" />
                                        Incoming
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleInputChange('paymentDirection', localFilters.paymentDirection === 'OUTGOING' ? '' : 'OUTGOING')}
                                    className={`w-full p-2.5 rounded-xl border transition-all duration-200 text-left ${
                                        localFilters.paymentDirection === 'OUTGOING'
                                            ? 'border-rose-400 bg-rose-50 text-rose-700'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-sm font-medium inline-flex items-center gap-2">
                                        <ArrowUpCircle className="w-4 h-4" />
                                        Outgoing
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleInputChange('transactionType', localFilters.transactionType === 'ITEM_PURCHASE' ? '' : 'ITEM_PURCHASE')}
                                    className={`w-full p-2.5 rounded-xl border transition-all duration-200 text-left ${
                                        localFilters.transactionType === 'ITEM_PURCHASE'
                                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-sm font-medium inline-flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        Purchases
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleInputChange('paymentType', localFilters.paymentType === 'EWALLET' ? '' : 'EWALLET')}
                                    className={`w-full p-2.5 rounded-xl border transition-all duration-200 text-left ${
                                        localFilters.paymentType === 'EWALLET'
                                            ? 'border-violet-400 bg-violet-50 text-violet-700'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-sm font-medium inline-flex items-center gap-2">
                                        <Wallet className="w-4 h-4" />
                                        eWallet
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Seller</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search seller..."
                                    value={localFilters.seller || ''}
                                    onChange={(e) => handleInputChange('seller', e.target.value)}
                                    className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-all"
                                />
                                <svg className="absolute left-2 top-3 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Transaction Type</h3>
                            <select
                                value={localFilters.transactionType || ''}
                                onChange={(e) => handleInputChange('transactionType', e.target.value)}
                                className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-all"
                            >
                                <option value="">All Transaction Types</option>
                                <option value="ITEM_PURCHASE">Item Purchase</option>
                                <option value="LISTING_CREATION">Listing Creation</option>
                                <option value="SHOWCASE_PAYMENT">Showcase Payment</option>
                                <option value="REFUND">Refund</option>
                            </select>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Payment Method</h3>
                            <select
                                value={localFilters.paymentType || ''}
                                onChange={(e) => handleInputChange('paymentType', e.target.value)}
                                className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-all"
                            >
                                <option value="">All Payment Methods</option>
                                <option value="CREDIT_CARD">Credit Card</option>
                                <option value="TRANSFER">Bank Transfer</option>
                                <option value="EWALLET">eWallet</option>
                            </select>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Payment Direction</h3>
                            <select
                                value={localFilters.paymentDirection || ''}
                                onChange={(e) => handleInputChange('paymentDirection', e.target.value)}
                                className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-all"
                            >
                                <option value="">All Directions</option>
                                <option value="INCOMING">Incoming</option>
                                <option value="OUTGOING">Outgoing</option>
                            </select>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Date Range</h3>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs text-slate-600 mb-1 block">From Date</label>
                                    <input
                                        type="date"
                                        value={localFilters.dateFrom || ''}
                                        onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                                        className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-600 mb-1 block">To Date</label>
                                    <input
                                        type="date"
                                        value={localFilters.dateTo || ''}
                                        onChange={(e) => handleInputChange('dateTo', e.target.value)}
                                        className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Amount Range</h3>
                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        min="0"
                                        step="0.01"
                                        value={localFilters.amountMin || ''}
                                        onChange={(e) => handleInputChange('amountMin', e.target.value)}
                                        className="w-full pl-6 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-all"
                                    />
                                    <span className="absolute left-2 top-2.5 text-slate-400 text-xs">₺</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        min="0"
                                        step="0.01"
                                        value={localFilters.amountMax || ''}
                                        onChange={(e) => handleInputChange('amountMax', e.target.value)}
                                        className="w-full pl-6 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-all"
                                    />
                                    <span className="absolute left-2 top-2.5 text-slate-400 text-xs">₺</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 bg-white px-4 py-3 flex-shrink-0">
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleReset}
                            className="w-full px-3 py-2 text-slate-600 text-sm font-medium hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const PaymentPagination = React.memo(({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange
}) => {
    const startItem = totalItems === 0 ? 0 : currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

    return (
        <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white p-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                <span className="text-xs text-slate-500 tabular-nums">
                    Page {currentPage + 1} of {totalPages}
                </span>

                <button
                    onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="text-xs text-slate-500 tabular-nums">
                    Showing {startItem} to {endItem} of {totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="pageSize" className="text-xs text-slate-500">Per page:</label>
                    <select
                        id="pageSize"
                        className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
        </div>
    );
});

const PaymentNavigation = ({
    showFilters,
    onCloseFilters,
    filters,
    onFilterChange,
    onResetFilters,
    hasActiveFilters,
}) => (
    <PaymentFilterSidebar
        isOpen={showFilters}
        onClose={onCloseFilters}
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
        hasActiveFilters={hasActiveFilters}
    />
);

export default PaymentNavigation;
export { PaymentPagination };

