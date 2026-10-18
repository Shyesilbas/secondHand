import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, ShoppingCart, Wallet, X } from "lucide-react";
import DataPagination from '../../common/components/ui/DataPagination.jsx';
import { useEscapeKey } from '../../common/hooks/useEscapeKey.js';
import { PAGE_SIZE_OPTIONS_5_10_20_50 } from '../../common/constants/pagination.js';
import { DEFAULT_CURRENCY_SYMBOL, DEFAULT_PAYMENT_FILTERS, PAYMENT_DIRECTIONS, PAYMENT_TRANSACTION_TYPES, PAYMENT_TYPES } from "../paymentSchema.js";
const PaymentFilterSidebar = ({
 isOpen,
 onClose,
 filters,
 onFilterChange,
 onReset
}) => {
 const {
 t
 } = useTranslation();
 const [localFilters, setLocalFilters] = useState(filters);
 useEffect(() => {
 setLocalFilters(filters);
 }, [filters]);
 useEscapeKey(onClose, isOpen);
 const handleInputChange = useCallback((field, value) => {
 setLocalFilters(prev => ({
 ...prev,
 [field]: value
 }));
 onFilterChange(field, value);
 }, [onFilterChange]);
 const handleReset = useCallback(() => {
 setLocalFilters(DEFAULT_PAYMENT_FILTERS);
 onReset();
 }, [onReset]);
 return <>
 {isOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
 <div className={`fixed left-0 top-0 h-screen w-80 bg-background-primary shadow-md z-50 border-r border-border-light flex flex-col
 transform transition-transform duration-300 ease-in-out
 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
 `}>
 <div className="border-b border-border-light bg-background-primary px-4 py-4 flex-shrink-0">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("filters")}</h2>
 <p className="text-xs text-text-tertiary mt-0.5">{t("refine_payment_history_with_precision")}</p>
 </div>
 <button type="button" onClick={onClose} aria-label={t("close")} className="rounded p-2 text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto bg-background-secondary overscroll-contain">
 <div className="p-4 space-y-4">
 <div className="bg-background-primary rounded-md border border-border-light p-4">
 <h3 className="text-sm font-medium text-text-primary mb-3">{t("quick_filters")}</h3>
 <div className="space-y-2">
 <button onClick={() => handleInputChange('paymentDirection', localFilters.paymentDirection === PAYMENT_DIRECTIONS.INCOMING ? '' : PAYMENT_DIRECTIONS.INCOMING)} className={`w-full p-2.5 rounded border transition-all duration-200 text-left ${localFilters.paymentDirection === PAYMENT_DIRECTIONS.INCOMING ? 'border-secondary-400 bg-background-secondary text-text-primary' : 'border-border-light bg-background-primary text-text-secondary hover:border-card-border-hover'}`}>
 <span className="text-sm font-medium inline-flex items-center gap-2">
 <ArrowDownCircle className="w-4 h-4" />{t("incoming")}</span>
 </button>
 <button onClick={() => handleInputChange('paymentDirection', localFilters.paymentDirection === PAYMENT_DIRECTIONS.OUTGOING ? '' : PAYMENT_DIRECTIONS.OUTGOING)} className={`w-full p-2.5 rounded border transition-all duration-200 text-left ${localFilters.paymentDirection === PAYMENT_DIRECTIONS.OUTGOING ? 'border-status-error bg-background-secondary text-status-error-text' : 'border-border-light bg-background-primary text-text-secondary hover:border-card-border-hover'}`}>
 <span className="text-sm font-medium inline-flex items-center gap-2">
 <ArrowUpCircle className="w-4 h-4" />{t("outgoing")}</span>
 </button>
 <button onClick={() => handleInputChange('transactionType', localFilters.transactionType === PAYMENT_TRANSACTION_TYPES.ITEM_PURCHASE ? '' : PAYMENT_TRANSACTION_TYPES.ITEM_PURCHASE)} className={`w-full p-2.5 rounded border transition-all duration-200 text-left ${localFilters.transactionType === PAYMENT_TRANSACTION_TYPES.ITEM_PURCHASE ? 'border-primary bg-background-tertiary text-primary' : 'border-border-light bg-background-primary text-text-secondary hover:border-card-border-hover'}`}>
 <span className="text-sm font-medium inline-flex items-center gap-2">
 <ShoppingCart className="w-4 h-4" />{t("purchases")}</span>
 </button>
 <button onClick={() => handleInputChange('paymentType', localFilters.paymentType === PAYMENT_TYPES.EWALLET ? '' : PAYMENT_TYPES.EWALLET)} className={`w-full p-2.5 rounded border transition-all duration-200 text-left ${localFilters.paymentType === PAYMENT_TYPES.EWALLET ? 'border-card-border-hover bg-primary text-text-inverse' : 'border-border-light bg-background-primary text-text-secondary hover:border-card-border-hover'}`}>
 <span className="text-sm font-medium inline-flex items-center gap-2">
 <Wallet className="w-4 h-4" />{t("ewallet")}</span>
 </button>
 </div>
 </div>

 <div className="bg-background-primary rounded-md border border-border-light p-4">
 <h3 className="text-sm font-medium text-text-primary mb-3">{t("seller")}</h3>
 <div className="relative">
 <input type="text" placeholder={t("search_seller")} value={localFilters.seller || ''} onChange={e => handleInputChange('seller', e.target.value)} className="w-full pl-8 pr-2 py-2.5 bg-background-secondary border border-border-light rounded text-xs focus:ring-4 focus:ring-primary-200 focus:border-primary focus:bg-background-primary transition-all" />
 <svg className="absolute left-2 top-3 w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 </div>
 </div>

 <div className="bg-background-primary rounded-md border border-border-light p-4">
 <h3 className="text-sm font-medium text-text-primary mb-3">{t("transaction_type")}</h3>
 <select value={localFilters.transactionType || ''} onChange={e => handleInputChange('transactionType', e.target.value)} className="w-full px-2 py-2.5 bg-background-secondary border border-border-light rounded text-xs focus:ring-4 focus:ring-primary-200 focus:border-primary focus:bg-background-primary transition-all">
 <option value="">{t("all_transaction_types")}</option>
 <option value={PAYMENT_TRANSACTION_TYPES.ITEM_PURCHASE}>{t("item_purchase")}</option>
 <option value={PAYMENT_TRANSACTION_TYPES.LISTING_CREATION}>{t("listing_creation")}</option>
 <option value={PAYMENT_TRANSACTION_TYPES.SHOWCASE_PAYMENT}>{t("showcase_payment")}</option>
 <option value={PAYMENT_TRANSACTION_TYPES.REFUND}>{t("refund")}</option>
 </select>
 </div>

 <div className="bg-background-primary rounded-md border border-border-light p-4">
 <h3 className="text-sm font-medium text-text-primary mb-3">{t("payment_method")}</h3>
 <select value={localFilters.paymentType || ''} onChange={e => handleInputChange('paymentType', e.target.value)} className="w-full px-2 py-2.5 bg-background-secondary border border-border-light rounded text-xs focus:ring-4 focus:ring-primary-200 focus:border-primary focus:bg-background-primary transition-all">
 <option value="">{t("all_payment_methods")}</option>
 <option value={PAYMENT_TYPES.EWALLET}>{t("ewallet")}</option>
 </select>
 </div>

 <div className="bg-background-primary rounded-md border border-border-light p-4">
 <h3 className="text-sm font-medium text-text-primary mb-3">{t("payment_direction")}</h3>
 <select value={localFilters.paymentDirection || ''} onChange={e => handleInputChange('paymentDirection', e.target.value)} className="w-full px-2 py-2.5 bg-background-secondary border border-border-light rounded text-xs focus:ring-4 focus:ring-primary-200 focus:border-primary focus:bg-background-primary transition-all">
 <option value="">{t("all_directions")}</option>
 <option value={PAYMENT_DIRECTIONS.INCOMING}>{t("incoming")}</option>
 <option value={PAYMENT_DIRECTIONS.OUTGOING}>{t("outgoing")}</option>
 </select>
 </div>

 <div className="bg-background-primary rounded-md border border-border-light p-4">
 <h3 className="text-sm font-medium text-text-primary mb-3">{t("date_range")}</h3>
 <div className="space-y-2">
 <div>
 <label className="text-xs text-text-secondary mb-1 block">{t("from_date")}</label>
 <input type="date" value={localFilters.dateFrom || ''} onChange={e => handleInputChange('dateFrom', e.target.value)} className="w-full px-2 py-2.5 bg-background-secondary border border-border-light rounded text-xs focus:ring-4 focus:ring-primary-200 focus:border-primary focus:bg-background-primary transition-all" />
 </div>
 <div>
 <label className="text-xs text-text-secondary mb-1 block">{t("to_date")}</label>
 <input type="date" value={localFilters.dateTo || ''} onChange={e => handleInputChange('dateTo', e.target.value)} className="w-full px-2 py-2.5 bg-background-secondary border border-border-light rounded text-xs focus:ring-4 focus:ring-primary-200 focus:border-primary focus:bg-background-primary transition-all" />
 </div>
 </div>
 </div>

 <div className="bg-background-primary rounded-md border border-border-light p-4">
 <h3 className="text-sm font-medium text-text-primary mb-3">{t("amount_range")}</h3>
 <div className="space-y-2">
 <div className="relative">
 <input type="number" placeholder={t("min")} min="0" step="0.01" value={localFilters.amountMin || ''} onChange={e => handleInputChange('amountMin', e.target.value)} className="w-full pl-6 pr-2 py-2.5 bg-background-secondary border border-border-light rounded text-xs focus:ring-4 focus:ring-primary-200 focus:border-primary focus:bg-background-primary transition-all" />
 <span className="absolute left-2 top-2.5 text-text-muted text-xs">{DEFAULT_CURRENCY_SYMBOL}</span>
 </div>
 <div className="relative">
 <input type="number" placeholder={t("max")} min="0" step="0.01" value={localFilters.amountMax || ''} onChange={e => handleInputChange('amountMax', e.target.value)} className="w-full pl-6 pr-2 py-2.5 bg-background-secondary border border-border-light rounded text-xs focus:ring-4 focus:ring-primary-200 focus:border-primary focus:bg-background-primary transition-all" />
 <span className="absolute left-2 top-2.5 text-text-muted text-xs">{DEFAULT_CURRENCY_SYMBOL}</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="border-t border-border-light bg-background-primary px-4 py-3 flex-shrink-0">
 <div className="flex flex-col gap-2">
 <button onClick={handleReset} className="w-full px-3 py-2 text-text-secondary text-sm font-medium hover:text-text-primary hover:bg-background-secondary rounded transition-colors">{t("reset_all")}</button>
 </div>
 </div>
 </div>
 </>;
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
 return <DataPagination shouldShowPagination={true} currentPage={currentPage} totalPages={totalPages} startItem={startItem} endItem={endItem} totalItems={totalItems} pageSize={pageSize} pageSizeOptions={PAGE_SIZE_OPTIONS_5_10_20_50} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />;
});
const PaymentNavigation = ({
 showFilters,
 onCloseFilters,
 filters,
 onFilterChange,
 onResetFilters,
 hasActiveFilters
}) => <PaymentFilterSidebar isOpen={showFilters} onClose={onCloseFilters} filters={filters} onFilterChange={onFilterChange} onReset={onResetFilters} hasActiveFilters={hasActiveFilters} />;
export default PaymentNavigation;
export { PaymentPagination };