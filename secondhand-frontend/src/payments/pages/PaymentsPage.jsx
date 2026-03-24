import React, {useCallback} from 'react';
import {Menu, X as XMarkIcon} from 'lucide-react';
import PaymentReceiptModal from '../../common/components/modals/PaymentReceiptModal.jsx';
import PaymentHistory from '../components/PaymentHistory.jsx';
import PaymentNavigation, {PaymentPagination} from '../components/PaymentNavigation.jsx';
import {PaymentInfo} from '../components/WalletOverview.jsx';
import {usePayments} from '../hooks/usePayments.js';
import {PAYMENT_DIRECTIONS} from '../paymentSchema.js';

const PaymentsPage = () => {
    const {
        payments,
        filteredPayments,
        isLoading,
        error,
        currentPage,
        pageSize,
        totalPages,
        totalElements,
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

    const toggleFilterSidebar = useCallback(() => {
        setShowFilters(!showFilters);
    }, [showFilters, setShowFilters]);

    const closeFilterSidebar = useCallback(() => {
        setShowFilters(false);
    }, [setShowFilters]);

    const incomingCount = payments.filter((p) => p.paymentDirection === PAYMENT_DIRECTIONS.INCOMING).length;
    const outgoingCount = payments.filter((p) => p.paymentDirection === PAYMENT_DIRECTIONS.OUTGOING).length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-24 rounded-3xl bg-white border border-slate-200/70" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white border border-slate-200/70 rounded-2xl p-4">
                                    <div className="h-3 bg-slate-200 rounded w-1/3 mb-2"></div>
                                    <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white border border-slate-200/70 rounded-2xl p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                                        </div>
                                        <div className="h-5 bg-slate-200 rounded w-20"></div>
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
        <div className="min-h-screen bg-[#F8FAFC] relative">
                <PaymentNavigation
                showFilters={showFilters}
                onCloseFilters={closeFilterSidebar}
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
            />

            <div className={`flex flex-col min-w-0 transition-all duration-300 ${showFilters ? 'lg:ml-80' : ''}`}>
                <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/70 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleFilterSidebar}
                                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-700 hover:text-slate-900 relative"
                                >
                                    <Menu className="w-6 h-6" />
                                    {hasActiveFilters && (
                                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600"></span>
                                    )}
                                </button>
                                <div>
                                    <h1 className="text-base font-semibold text-slate-900 tracking-tight mb-0.5">Payment History</h1>
                                    <p className="text-xs text-slate-500 font-medium">Track and manage your payment transactions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-6 w-full">
                <div className="mb-6 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.45)]">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Payments Overview</h2>
                            <p className="text-sm text-slate-500 mt-1">Monitor cash flow and inspect transactions quickly.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-medium">Total</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">{totalElements}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-700 font-medium">Incoming</p>
                            <p className="mt-1 text-2xl font-semibold text-emerald-900 tabular-nums">{incomingCount}</p>
                        </div>
                        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-indigo-700 font-medium">Outgoing</p>
                            <p className="mt-1 text-2xl font-semibold text-indigo-900 tabular-nums">{outgoingCount}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <PaymentInfo />
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200/60 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                            <XMarkIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <div>
                                <h3 className="text-xs font-semibold text-red-800">Error loading payments</h3>
                                <p className="text-[11px] text-red-600 mt-0.5">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-6 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.45)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-semibold text-slate-900">Transaction History</h2>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700">
                                {filteredPayments.length} {filteredPayments.length === 1 ? 'payment' : 'payments'}
                            </span>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" />
                                Clear filters
                            </button>
                        )}
                    </div>
                    <PaymentHistory
                        payments={payments}
                        onShowReceipt={showReceipt}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={clearFilters}
                        isLoading={isLoading}
                    />
                    {shouldShowPagination && (
                        <PaymentPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalItems={totalElements}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    )}
                </div>

                <PaymentReceiptModal
                    isOpen={isReceiptModalOpen}
                    onClose={closeReceipt}
                    payment={selectedPayment}
                />
                </div>
            </div>
        </div>
    );
};

export default PaymentsPage;

