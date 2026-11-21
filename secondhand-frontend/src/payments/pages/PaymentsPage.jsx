import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import PaymentReceiptModal from '../../common/components/modals/PaymentReceiptModal.jsx';
import PaymentHistory from '../components/PaymentHistory.jsx';
import PaymentNavigation from '../components/PaymentNavigation.jsx';
import { usePayments } from '../hooks/usePayments.js';
import { usePaymentStatisticsQuery } from '../hooks/queries.js';
import { PAYMENT_DIRECTIONS, transactionTypeLabel } from '../paymentSchema.js';
import { useDebouncedValue } from '../../common/hooks/useDebouncedValue.js';
import { formatCurrency } from '../../common/formatters.js';
import { ROUTES } from '../../common/constants/routes.js';
import PageHeader from '../../common/components/ui/PageHeader.jsx';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { inputNormal } from '../../common/components/forms/inputStyles.js';
import { PAGE_SIZE_OPTIONS_5_10_20_50 } from '../../common/constants/pagination.js';
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
 const {
 data: paymentStats
 } = usePaymentStatisticsQuery(undefined, {
 enabled: true
 });
 const toggleFilterSidebar = useCallback(() => setShowFilters(!showFilters), [showFilters, setShowFilters]);
 const closeFilterSidebar = useCallback(() => setShowFilters(false), [setShowFilters]);
 const summary = [
 { key: 'total', label: t('payments_total_volume'), value: paymentStats?.totalAmount },
 { key: 'in', label: t('incoming'), value: paymentStats?.incomingAmount, icon: ArrowDownLeft },
 { key: 'out', label: t('outgoing'), value: paymentStats?.outgoingAmount, icon: ArrowUpRight },
 { key: 'escrow', label: t('payments_escrow_protection'), value: paymentStats?.escrowAmount, icon: ShieldCheck },
 ];
 // Search and direction run on the backend (`searchTerm`, `paymentDirection`) across every page.
 // Only a change in this box writes the filter, so the sidebar's seller input is not overwritten.
 const debouncedSearch = useDebouncedValue(searchTerm, 300);
 const lastSentSearch = useRef(debouncedSearch);
 useEffect(() => {
 if (lastSentSearch.current === debouncedSearch) return;
 lastSentSearch.current = debouncedSearch;
 handleFilterChange('seller', debouncedSearch.trim());
 }, [debouncedSearch, handleFilterChange]);
 const directionFilter = filters.paymentDirection || '';
 // Resetting also empties the search box, which writes the `seller` filter.
 const resetAll = useCallback(() => {
 lastSentSearch.current = '';
 setSearchTerm('');
 clearFilters();
 }, [clearFilters]);
 // Quotes every cell, so titles with commas, quotes or line breaks stay in their column.
 const exportCsv = useCallback(() => {
 const cell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
 const headers = ['Date', 'Type', 'Direction', 'Amount', 'Currency', 'Status', 'Listing'];
 const rows = payments.map(p => [p.processedAt || '', transactionTypeLabel(t, p.transactionType), p.paymentDirection, p.amount, p.currency || '', p.status, p.listingTitle || '']);
 const csv = [headers, ...rows].map(r => r.map(cell).join(',')).join('\n');
 const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
 const a = document.createElement('a');
 a.href = url;
 a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
 a.click();
 URL.revokeObjectURL(url);
 }, [payments, t]);
 const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
 const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

 return <div className="min-h-screen bg-background-page">
 <PaymentNavigation showFilters={showFilters} onCloseFilters={closeFilterSidebar} filters={filters} onFilterChange={handleFilterChange} onResetFilters={resetAll} hasActiveFilters={hasActiveFilters} />

 <div className={`flex flex-col transition-all duration-300 ${showFilters ? 'lg:ml-80' : ''}`}>
 <PageContainer className="py-8">
 <PageHeader
 title={t("finances")}
 subtitle={t("payments_page_subtitle")}
 actions={
 <>
 <button type="button" onClick={exportCsv} disabled={!payments.length} className={`${buttonClasses('secondary')} hidden sm:inline-flex`}>
 <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden />{t("export")}</button>
 <Link to={`${ROUTES.PAYMENT_METHODS}?tab=ewallet`} className={buttonClasses()}>
 <Wallet className="h-4 w-4" strokeWidth={1.5} aria-hidden />{t("my_wallet")}</Link>
 </>
 }
 />

 {/* Summary: one panel, four figures. Only incoming is tinted; outgoing is normal spending, not an error. */}
 <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded border border-border-light bg-background-primary shadow-sm lg:grid-cols-4">
 {summary.map((item, index) => {
 const Icon = item.icon;
 return <div key={item.key} className={`p-5 ${index % 2 === 1 ? 'border-l border-border-light' : ''} ${index >= 2 ? 'border-t border-border-light lg:border-t-0' : ''} ${index === 2 ? 'lg:border-l' : ''}`}>
 <dt className="flex items-center gap-1.5 text-sm text-text-secondary">
 {Icon ? <Icon className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden /> : null}
 {item.label}
 </dt>
 <dd className={`mt-1.5 text-xl font-semibold tabular-nums tracking-tight ${item.key === 'in' ? 'text-status-success-text' : 'text-text-primary'}`}>
 {paymentStats ? formatCurrency(item.value) : <Skeleton className="h-7 w-28" />}
 </dd>
 </div>;
 })}
 </dl>

 {/* Toolbar: filters and search on the left, direction on the right. */}
 <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
 <div className="flex min-w-0 flex-1 items-center gap-2">
 <button type="button" onClick={toggleFilterSidebar} aria-expanded={showFilters} className="relative inline-flex h-10 shrink-0 items-center gap-2 rounded border border-border bg-background-primary px-3 text-sm font-medium text-text-primary transition-colors duration-150 hover:border-card-border-hover hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
 <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 <span className="hidden sm:inline">{t("filters")}</span>
 <span className="sr-only sm:hidden">{t("filters")}</span>
 {hasActiveFilters ? <span className="h-2 w-2 rounded-full bg-accent-teal" aria-hidden /> : null}
 </button>
 <div className="relative min-w-0 flex-1 md:max-w-md">
 <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={1.5} aria-hidden />
 <input type="search" placeholder={t("search_by_transaction_or_listing")} aria-label={t("search_by_transaction_or_listing")} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`${inputNormal} h-10 pl-10`} />
 </div>
 </div>
 <div className="flex items-center gap-0.5 self-start rounded border border-border bg-background-secondary p-0.5 md:self-auto" role="group" aria-label={t("payment_direction")}>
 {[{ id: '', label: t('all') }, { id: PAYMENT_DIRECTIONS.INCOMING, label: t('incoming') }, { id: PAYMENT_DIRECTIONS.OUTGOING, label: t('outgoing') }].map(tab => <button key={tab.id || 'all'} onClick={() => handleFilterChange('paymentDirection', tab.id)} type="button" aria-pressed={directionFilter === tab.id} className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${directionFilter === tab.id ? 'bg-background-primary text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
 {tab.label}
 </button>)}
 </div>
 </div>

 {/* Transactions */}
 <div className="mt-4 overflow-hidden rounded border border-border-light bg-background-primary shadow-sm">
 <PaymentHistory payments={payments} onShowReceipt={showReceipt} hasActiveFilters={hasActiveFilters} onClearFilters={resetAll} isLoading={isLoading} error={error} onRetry={refetch} />
 </div>

 {shouldShowPagination && totalPages > 1 && <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
 <p className="text-sm tabular-nums text-text-tertiary">
 {t('payments_range', { start: startItem, end: endItem, total: totalElements })}
 </p>
 <Pagination page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
 <label className="flex items-center gap-2 text-sm text-text-tertiary">
 {t("per_page")}
 <select value={pageSize} onChange={e => handlePageSizeChange(Number(e.target.value))} className={`${inputNormal} h-9 w-auto py-1`}>
 {PAGE_SIZE_OPTIONS_5_10_20_50.map(size => <option key={size} value={size}>{size}</option>)}
 </select>
 </label>
 </div>}
 </PageContainer>

 <PaymentReceiptModal isOpen={isReceiptModalOpen} onClose={closeReceipt} payment={selectedPayment} />
 </div>
 </div>;
};
export default PaymentsPage;