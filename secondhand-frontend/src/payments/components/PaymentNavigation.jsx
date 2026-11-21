import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { X } from "lucide-react";
import Button from '../../common/components/ui/Button.jsx';
import { inputNormal } from '../../common/components/forms/inputStyles.js';
import { useEscapeKey } from '../../common/hooks/useEscapeKey.js';
import { DEFAULT_CURRENCY_SYMBOL, PAYMENT_TRANSACTION_TYPES, transactionTypeLabel } from "../paymentSchema.js";
const FIELD_LABEL = 'mb-1.5 block text-sm font-medium text-text-primary';

// Type, date and amount filters. Direction and the text search live in the page toolbar, so they are
// not repeated here; every change applies at once (React Query refetches).
const PaymentFilterSidebar = ({
 isOpen,
 onClose,
 filters,
 onFilterChange,
 onReset,
 hasActiveFilters
}) => {
 const {
 t
 } = useTranslation();
 useEscapeKey(onClose, isOpen);
 const set = useCallback((field) => (e) => onFilterChange(field, e.target.value), [onFilterChange]);
 const dateInvalid = filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo;
 const amountInvalid = filters.amountMin !== '' && filters.amountMax !== '' && Number(filters.amountMin) > Number(filters.amountMax);
 return <>
 {isOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
 <aside aria-label={t("filters")} className={`fixed left-0 top-0 z-50 flex h-screen w-80 flex-col border-r border-border-light bg-background-primary shadow-md lg:top-16 lg:bottom-0 lg:z-30 lg:h-auto lg:shadow-none
 transform transition-transform duration-300 ease-in-out
 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
 `}>
 <div className="flex shrink-0 items-center justify-between border-b border-border-light px-5 py-4">
 <h2 className="text-lg font-semibold text-text-primary">{t("filters")}</h2>
 <button type="button" onClick={onClose} aria-label={t("close")} className="rounded p-2 text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </div>

 <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain p-5">
 <div>
 <label htmlFor="payment-filter-type" className={FIELD_LABEL}>{t("transaction_type")}</label>
 <select id="payment-filter-type" value={filters.transactionType || ''} onChange={set('transactionType')} className={inputNormal}>
 <option value="">{t("all_transaction_types")}</option>
 {Object.values(PAYMENT_TRANSACTION_TYPES).map(type => <option key={type} value={type}>{transactionTypeLabel(t, type)}</option>)}
 </select>
 </div>

 <fieldset>
 <legend className={FIELD_LABEL}>{t("date_range")}</legend>
 <div className="grid grid-cols-2 gap-2">
 <label className="text-sm text-text-secondary">
 <span className="mb-1 block">{t("from_date")}</span>
 <input type="date" value={filters.dateFrom || ''} max={filters.dateTo || undefined} onChange={set('dateFrom')} className={inputNormal} />
 </label>
 <label className="text-sm text-text-secondary">
 <span className="mb-1 block">{t("to_date")}</span>
 <input type="date" value={filters.dateTo || ''} min={filters.dateFrom || undefined} onChange={set('dateTo')} className={inputNormal} />
 </label>
 </div>
 {dateInvalid && <p className="mt-1.5 text-sm text-status-error-text">{t("payments_filter_date_invalid")}</p>}
 </fieldset>

 <fieldset>
 <legend className={FIELD_LABEL}>{t("amount_range")}</legend>
 <div className="grid grid-cols-2 gap-2">
 {[['amountMin', t("min")], ['amountMax', t("max")]].map(([field, label]) => <div key={field} className="relative">
 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">{DEFAULT_CURRENCY_SYMBOL}</span>
 <input type="number" inputMode="decimal" min="0" step="0.01" placeholder={label} aria-label={label} value={filters[field] || ''} onChange={set(field)} className={`${inputNormal} pl-7 tabular-nums`} />
 </div>)}
 </div>
 {amountInvalid && <p className="mt-1.5 text-sm text-status-error-text">{t("payments_filter_amount_invalid")}</p>}
 </fieldset>
 </div>

 <div className="flex shrink-0 gap-2 border-t border-border-light px-5 py-4">
 <Button variant="secondary" className="flex-1" onClick={onReset} disabled={!hasActiveFilters}>{t("reset_all")}</Button>
 <Button className="flex-1 lg:hidden" onClick={onClose}>{t("show_results")}</Button>
 </div>
 </aside>
 </>;
};
const PaymentNavigation = ({
 showFilters,
 onCloseFilters,
 filters,
 onFilterChange,
 onResetFilters,
 hasActiveFilters
}) => <PaymentFilterSidebar isOpen={showFilters} onClose={onCloseFilters} filters={filters} onFilterChange={onFilterChange} onReset={onResetFilters} hasActiveFilters={hasActiveFilters} />;
export default PaymentNavigation;
