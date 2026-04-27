import React, {useCallback, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {Download, Menu, Search, X as XMarkIcon} from 'lucide-react';
import PaymentReceiptModal from '../../common/components/modals/PaymentReceiptModal.jsx';
import PaymentHistory from '../components/PaymentHistory.jsx';
import PaymentNavigation, {PaymentPagination} from '../components/PaymentNavigation.jsx';
import {PaymentInfo} from '../components/WalletOverview.jsx';
import {usePayments} from '../hooks/usePayments.js';
import {usePaymentStatisticsQuery} from '../hooks/queries.js';
import {
    PAYMENT_DIRECTIONS,
    PAYMENT_DIRECTION_LABELS,
    PAYMENT_TRANSACTION_TYPES,
    pickPaymentStatistic,
    TRANSACTION_TYPE_LABELS
} from '../paymentSchema.js';
import {formatCurrency} from '../../common/formatters.js';
import {ROUTES} from '../../common/constants/routes.js';

const PaymentsPage = () => {
    const {
        payments,
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
    const [searchTerm, setSearchTerm] = useState('');
    const [directionFilter, setDirectionFilter] = useState('');

    const {data: paymentStats} = usePaymentStatisticsQuery(undefined, {enabled: true});

    const toggleFilterSidebar = useCallback(() => {
        setShowFilters(!showFilters);
    }, [showFilters, setShowFilters]);

    const closeFilterSidebar = useCallback(() => {
        setShowFilters(false);
    }, [setShowFilters]);

    const directionOptions = useMemo(() => ([
        {value: '', label: 'All directions'},
        {value: PAYMENT_DIRECTIONS.INCOMING, label: PAYMENT_DIRECTION_LABELS[PAYMENT_DIRECTIONS.INCOMING]},
        {value: PAYMENT_DIRECTIONS.OUTGOING, label: PAYMENT_DIRECTION_LABELS[PAYMENT_DIRECTIONS.OUTGOING]},
    ]), []);

    const categoryTabs = useMemo(() => ([
        {value: '', label: 'All'},
        ...Object.values(PAYMENT_TRANSACTION_TYPES).map((type) => ({
            value: type,
            label: TRANSACTION_TYPE_LABELS[type] || type
        }))
    ]), []);

    const visiblePayments = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        return payments.filter((payment) => {
            const matchesDirection = !directionFilter || payment.paymentDirection === directionFilter;
            if (!matchesDirection) return false;

            if (!normalizedSearch) return true;

            const searchableValues = [
                payment.transactionType,
                TRANSACTION_TYPE_LABELS[payment.transactionType],
                payment.paymentType,
                payment.listingTitle,
                ...(payment.orderItems || []),
                payment.senderDisplayName,
                payment.receiverDisplayName,
            ];

            return searchableValues.some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
        });
    }, [payments, directionFilter, searchTerm]);

    const statCards = useMemo(() => ([
        {
            title: 'Total volume',
            value: formatCurrency(pickPaymentStatistic(paymentStats, 'totalVolume')),
            tone: 'slate'
        },
        {
            title: 'Incoming volume',
            value: formatCurrency(pickPaymentStatistic(paymentStats, 'incomingVolume')),
            tone: 'emerald'
        },
        {
            title: 'Outgoing volume',
            value: formatCurrency(pickPaymentStatistic(paymentStats, 'outgoingVolume')),
            tone: 'indigo'
        },
        {
            title: 'In Escrow',
            value: formatCurrency(pickPaymentStatistic(paymentStats, 'escrowAmount')),
            tone: 'blue'
        },
        {
            title: 'Successful transactions',
            value: pickPaymentStatistic(paymentStats, 'successfulCount').toString(),
            tone: 'amber'
        },
    ]), [paymentStats]);

    const exportCurrentPageAsCsv = useCallback(() => {
        const headers = ['Date', 'Transaction Type', 'Direction', 'Method', 'Amount', 'Status', 'Listing Title'];
        const rows = visiblePayments.map((payment) => ([
            payment.processedAt || '',
            TRANSACTION_TYPE_LABELS[payment.transactionType] || payment.transactionType || '',
            PAYMENT_DIRECTION_LABELS[payment.paymentDirection] || payment.paymentDirection || '',
            payment.paymentType || '',
            payment.amount ?? 0,
            payment.isSuccess ? 'Success' : 'Failed',
            payment.listingTitle || ''
        ]));
        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments-page-${currentPage + 1}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [visiblePayments, currentPage]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-24 rounded-3xl bg-white border border-slate-200/70" />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
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
                            <Link
                                to={`${ROUTES.PAYMENT_METHODS}?tab=ewallet`}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                View balance
                            </Link>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                        {statCards.map((card) => (
                            <div
                                key={card.title}
                                className={`rounded-2xl px-4 py-3 border ${
                                    card.tone === 'emerald' ? 'border-emerald-200 bg-emerald-50/60' :
                                        card.tone === 'indigo' ? 'border-indigo-200 bg-indigo-50/60' :
                                            card.tone === 'blue' ? 'border-blue-200 bg-blue-50/60' :
                                                card.tone === 'amber' ? 'border-amber-200 bg-amber-50/60' :
                                                    'border-slate-200 bg-slate-50/70'
                                }`}
                            >
                                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-medium">{card.title}</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">{card.value}</p>
                            </div>
                        ))}
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
                                {visiblePayments.length} {visiblePayments.length === 1 ? 'payment' : 'payments'}
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
                    <div className="mb-4 flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                            {categoryTabs.map((tab) => {
                                const isActive = (filters.transactionType || '') === tab.value;
                                return (
                                    <button
                                        key={tab.value || 'all'}
                                        onClick={() => handleFilterChange('transactionType', tab.value)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                            isActive
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 bg-white">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search transaction, listing, person"
                                    className="w-full text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={directionFilter}
                                    onChange={(e) => setDirectionFilter(e.target.value)}
                                    className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700"
                                >
                                    {directionOptions.map((option) => (
                                        <option key={option.value || 'all'} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={exportCurrentPageAsCsv}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    <Download className="w-4 h-4" />
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </div>
                    <PaymentHistory
                        payments={visiblePayments}
                        onShowReceipt={showReceipt}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={clearFilters}
                        isLoading={isLoading}
                        layout="modern"
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

