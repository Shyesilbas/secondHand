import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, Filter } from 'lucide-react';
import PaymentReceiptModal from '../../common/components/modals/PaymentReceiptModal.jsx';
import PaymentHistory from '../components/PaymentHistory.jsx';
import PaymentNavigation, { PaymentPagination } from '../components/PaymentNavigation.jsx';
import { usePayments } from '../hooks/usePayments.js';
import { usePaymentStatisticsQuery } from '../hooks/queries.js';
import { PAYMENT_DIRECTIONS, pickPaymentStatistic, TRANSACTION_TYPE_LABELS } from '../paymentSchema.js';
import { formatCurrency } from '../../common/formatters.js';
import { ROUTES } from '../../common/constants/routes.js';
import { motion } from 'framer-motion';
const PaymentsPage = () => {
 const {
 t
 } = useTranslation();
 const {
 payments,
 isLoading,
 error,
 refetch,
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
 icon: Wallet
 }, {
 title: 'Incoming',
 value: formatCurrency(pickPaymentStatistic(paymentStats, 'incomingVolume')),
 icon: ArrowDownLeft
 }, {
 title: 'Outgoing',
 value: formatCurrency(pickPaymentStatistic(paymentStats, 'outgoingVolume')),
 icon: ArrowUpRight
 }, {
 title: 'Protection (Escrow)',
 value: formatCurrency(pickPaymentStatistic(paymentStats, 'escrowAmount')),
 icon: ShieldCheck
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
 return <div className="min-h-screen bg-background-secondary">
 <PaymentNavigation showFilters={showFilters} onCloseFilters={closeFilterSidebar} filters={filters} onFilterChange={handleFilterChange} onResetFilters={clearFilters} hasActiveFilters={hasActiveFilters} />

 <div className={`flex flex-col transition-all duration-500 ${showFilters ? 'lg:ml-80' : ''}`}>
 {/* Modern Header */}
 <header className="sticky top-0 z-40 bg-background-primary border-b border-border-light">
 <PageContainer className="py-4 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button onClick={toggleFilterSidebar} className="p-2.5 rounded bg-background-secondary text-text-secondary hover:bg-background-tertiary transition-all">
 <Filter className="w-5 h-5" />
 </button>
 <div>
 <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("finances")}</h1>
 <div className="flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
 <p className="text-xs font-semibold text-text-muted">{t("real_time_tracking")}</p>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <button onClick={exportCsv} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-text-secondary hover:bg-background-secondary transition-colors">
 <Download className="w-4 h-4" />{t("export")}</button>
 <Link to={`${ROUTES.PAYMENT_METHODS}?tab=ewallet`} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4">
 <Wallet className="w-4 h-4" />{t("my_wallet")}</Link>
 </div>
 </PageContainer>
 </header>

 <PageContainer className="py-8 w-full">
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
 }} className="bg-background-primary border border-border-light rounded-md p-5">
 <div className="flex items-center justify-between mb-3">
 <card.icon className="h-5 w-5 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <span className="text-xs font-semibold text-text-muted">{card.title}</span>
 </div>
 <div className="flex items-baseline gap-1">
 <span className="text-2xl font-semibold text-text-primary tracking-tight">{card.value}</span>
 </div>
 </motion.div>)}
 </div>

 {/* Content Section */}
 <div className="bg-background-primary border border-border-light rounded-md overflow-hidden">
 {/* Search & Tabs */}
 <div className="p-6 border-b border-border-light bg-background-secondary/30">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
 <input type="text" placeholder={t("search_by_transaction_or_listing")} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-background-primary border border-border-light rounded-md text-sm outline-none focus:border-primary focus:ring-4 focus:ring-border transition-all" />
 </div>
 
 <div className="flex items-center gap-1.5 p-1 bg-background-tertiary rounded">
 {[{
 id: '',
 label: 'All'
 }, {
 id: PAYMENT_DIRECTIONS.INCOMING,
 label: 'Incoming'
 }, {
 id: PAYMENT_DIRECTIONS.OUTGOING,
 label: 'Outgoing'
 }].map(tab => <button key={tab.id} onClick={() => setDirectionFilter(tab.id)} className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${directionFilter === tab.id ? 'bg-background-primary text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
 {tab.label}
 </button>)}
 </div>
 </div>
 </div>

 {/* Transaction List */}
 <div className="p-0">
 <PaymentHistory payments={visiblePayments} onShowReceipt={showReceipt} hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} isLoading={isLoading} error={error} onRetry={refetch} />
 </div>

 {/* Pagination */}
 {shouldShowPagination && <div className="p-6 border-t border-border-light">
 <PaymentPagination currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalItems={totalElements} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} />
 </div>}
 </div>
 </PageContainer>

 <PaymentReceiptModal isOpen={isReceiptModalOpen} onClose={closeReceipt} payment={selectedPayment} />
 </div>
 </div>;
};
export default PaymentsPage;