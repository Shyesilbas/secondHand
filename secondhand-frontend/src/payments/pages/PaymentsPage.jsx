import { useTranslation } from "react-i18next";
import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Menu, Search, X as XMarkIcon, Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, Filter } from 'lucide-react';
import PaymentReceiptModal from '../../common/components/modals/PaymentReceiptModal.jsx';
import PaymentHistory from '../components/PaymentHistory.jsx';
import PaymentNavigation, { PaymentPagination } from '../components/PaymentNavigation.jsx';
import { usePayments } from '../hooks/usePayments.js';
import { usePaymentStatisticsQuery } from '../hooks/queries.js';
import { PAYMENT_DIRECTIONS, PAYMENT_DIRECTION_LABELS, PAYMENT_TRANSACTION_TYPES, pickPaymentStatistic, TRANSACTION_TYPE_LABELS } from '../paymentSchema.js';
import { formatCurrency } from '../../common/formatters.js';
import { ROUTES } from '../../common/constants/routes.js';
import { motion, AnimatePresence } from 'framer-motion';
const PaymentsPage = () => {
  const {
    t
  } = useTranslation();
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
  const {
    data: paymentStats
  } = usePaymentStatisticsQuery(undefined, {
    enabled: true
  });
  const toggleFilterSidebar = useCallback(() => setShowFilters(!showFilters), [showFilters, setShowFilters]);
  const closeFilterSidebar = useCallback(() => setShowFilters(false), [setShowFilters]);
  const statCards = useMemo(() => [{
    title: 'Available Balance',
    value: formatCurrency(pickPaymentStatistic(paymentStats, 'totalVolume')),
    icon: Wallet,
    color: 'indigo'
  }, {
    title: 'Incoming',
    value: formatCurrency(pickPaymentStatistic(paymentStats, 'incomingVolume')),
    icon: ArrowDownLeft,
    color: 'emerald'
  }, {
    title: 'Outgoing',
    value: formatCurrency(pickPaymentStatistic(paymentStats, 'outgoingVolume')),
    icon: ArrowUpRight,
    color: 'rose'
  }, {
    title: 'Protection (Escrow)',
    value: formatCurrency(pickPaymentStatistic(paymentStats, 'escrowAmount')),
    icon: ShieldCheck,
    color: 'amber'
  }], [paymentStats]);
  const visiblePayments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return payments.filter(payment => {
      const matchesDirection = !directionFilter || payment.paymentDirection === directionFilter;
      if (!matchesDirection) return false;
      if (!normalizedSearch) return true;
      const searchableValues = [payment.transactionType, TRANSACTION_TYPE_LABELS[payment.transactionType], payment.listingTitle, payment.senderDisplayName, payment.receiverDisplayName];
      return searchableValues.some(value => String(value || '').toLowerCase().includes(normalizedSearch));
    });
  }, [payments, directionFilter, searchTerm]);
  const exportCsv = useCallback(() => {
    const headers = ['Date', 'Type', 'Direction', 'Amount', 'Status', 'Listing'];
    const rows = visiblePayments.map(p => [p.processedAt || '', TRANSACTION_TYPE_LABELS[p.transactionType] || p.transactionType || '', p.paymentDirection, p.amount ?? 0, p.isSuccess ? 'Success' : 'Failed', p.listingTitle || '']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], {
      type: 'text/csv'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }, [visiblePayments]);
  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm font-medium text-slate-500">{t("loading_your_transactions")}</p>
                </div>
            </div>;
  }
  return <div className="min-h-screen bg-[#fafafa]">
            <PaymentNavigation showFilters={showFilters} onCloseFilters={closeFilterSidebar} filters={filters} onFilterChange={handleFilterChange} onResetFilters={clearFilters} hasActiveFilters={hasActiveFilters} />

            <div className={`flex flex-col transition-all duration-500 ${showFilters ? 'lg:ml-80' : ''}`}>
                {/* Modern Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={toggleFilterSidebar} className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all">
                                <Filter className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("finances")}</h1>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-caption font-bold text-slate-400 uppercase tracking-widest">{t("real_time_tracking")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={exportCsv} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                <Download className="w-4 h-4" />{t("export")}</button>
                            <Link to={`${ROUTES.PAYMENT_METHODS}?tab=ewallet`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 shadow-sm transition-all active:scale-95">
                                <Wallet className="w-4 h-4" />{t("my_wallet")}</Link>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8 w-full">
                    {/* Stats Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        {statCards.map((card, idx) => <motion.div key={card.title} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: idx * 0.1
          }} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 rounded-lg bg-${card.color}-50 text-${card.color}-600`}>
                                        <card.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-caption font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</span>
                                </div>
                            </motion.div>)}
                    </div>

                    {/* Content Section */}
                    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                        {/* Search & Tabs */}
                        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" placeholder={t("search_by_transaction_or_listing")} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all" />
                                </div>
                                
                                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                                    {[{
                  id: '',
                  label: 'All'
                }, {
                  id: PAYMENT_DIRECTIONS.INCOMING,
                  label: 'Incoming'
                }, {
                  id: PAYMENT_DIRECTIONS.OUTGOING,
                  label: 'Outgoing'
                }].map(tab => <button key={tab.id} onClick={() => setDirectionFilter(tab.id)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${directionFilter === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                            {tab.label}
                                        </button>)}
                                </div>
                            </div>
                        </div>

                        {/* Transaction List */}
                        <div className="p-0">
                            <PaymentHistory payments={visiblePayments} onShowReceipt={showReceipt} hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} isLoading={isLoading} layout="modern" />
                        </div>

                        {/* Pagination */}
                        {shouldShowPagination && <div className="p-6 border-t border-slate-50">
                                <PaymentPagination currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalItems={totalElements} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} />
                            </div>}
                    </div>
                </main>

                <PaymentReceiptModal isOpen={isReceiptModalOpen} onClose={closeReceipt} payment={selectedPayment} />
            </div>
        </div>;
};
export default PaymentsPage;