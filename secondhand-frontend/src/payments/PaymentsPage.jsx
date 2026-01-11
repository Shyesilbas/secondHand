import React from 'react';
import {useNavigate} from 'react-router-dom';
import { ArrowLeftIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import PaymentReceiptModal from '../common/components/modals/PaymentReceiptModal.jsx';
import PaymentFilters from './components/PaymentFilters.jsx';
import PaymentList from './components/PaymentList.jsx';
import PaymentPagination from './components/PaymentPagination.jsx';
import PaymentInfo from './components/PaymentInfo.jsx';
import {usePayments} from './hooks/usePayments.js';

const PaymentsPage = () => {
    const navigate = useNavigate();
    const {
        payments,
        allPayments,
        filteredPayments,
        isLoading,
        error,
        currentPage,
        pageSize,
        totalPages,
        selectedPayment,
        isReceiptModalOpen,
        filters,
        showFilters,
        hasActiveFilters,
        shouldShowPagination,
        handleFilterChange,
        clearFilters,
        showReceipt,
        closeReceipt,
        handlePageChange,
        handlePageSizeChange,
        setShowFilters
    } = usePayments();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50">
                <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-base font-semibold text-gray-900 tracking-tight mb-0.5">Payment History</h1>
                                <p className="text-xs text-gray-500 font-medium">Track and manage your payment transactions</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="animate-pulse space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white border border-gray-200/60 rounded-lg p-4">
                                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white border border-gray-200/60 rounded-lg p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-base font-semibold text-gray-900 tracking-tight mb-0.5">Payment History</h1>
                            <p className="text-xs text-gray-500 font-medium">Track and manage your payment transactions</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                    showFilters || hasActiveFilters
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/60'
                                }`}
                            >
                                <FunnelIcon className="w-3.5 h-3.5" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-white/20 text-white rounded-full">
                                        !
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">

                <div className="mb-6">
                    <PaymentInfo />
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200/60 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <XMarkIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <div>
                                <h3 className="text-xs font-semibold text-red-800">Error loading payments</h3>
                                <p className="text-[11px] text-red-600 mt-0.5">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {showFilters && (
                    <div className="mb-6 bg-white border border-gray-200/60 rounded-lg overflow-hidden">
                        <PaymentFilters
                            filters={filters}
                            showFilters={showFilters}
                            hasActiveFilters={hasActiveFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={clearFilters}
                            onToggleFilters={() => setShowFilters(!showFilters)}
                            filteredPayments={filteredPayments}
                            allPayments={allPayments}
                        />
                    </div>
                )}

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-semibold text-gray-900">Transaction History</h2>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-700">
                                {filteredPayments.length} {filteredPayments.length === 1 ? 'payment' : 'payments'}
                            </span>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" />
                                Clear filters
                            </button>
                        )}
                    </div>
                    <PaymentList
                        payments={payments}
                        onShowReceipt={showReceipt}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={clearFilters}
                        isLoading={isLoading}
                    />
                </div>

                {shouldShowPagination && (
                    <div className="mt-6">
                        <PaymentPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalItems={filteredPayments.length}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    </div>
                )}

                <PaymentReceiptModal
                    isOpen={isReceiptModalOpen}
                    onClose={closeReceipt}
                    payment={selectedPayment}
                />
            </div>
        </div>
    );
};

export default PaymentsPage;
