import { useTranslation } from "react-i18next";
import { Receipt, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { PAYMENT_DIRECTIONS, PAYMENT_STATUSES, TRANSACTION_TYPE_LABELS } from '../paymentSchema.js';
import { Button, SkeletonList, EmptyState } from '../../common/components/ui/index.js';
const StatusBadge = ({
 status,
 isSuccess
}) => {
 const {
 t
 } = useTranslation();
 const [dot, label] = status === PAYMENT_STATUSES.ESCROW ? ['bg-status-warning', t("escrow")] : isSuccess ? ['bg-status-success', t("success")] : ['bg-status-error', t("failed")];
 return <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
 <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
 {label}
 </span>;
};
const PaymentRow = ({
 payment,
 onShowReceipt
}) => {
 const {
 t
 } = useTranslation();
 const isIncoming = payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING;
 const isEscrow = payment.status === PAYMENT_STATUSES.ESCROW;
 const DirectionIcon = isEscrow ? ShieldCheck : isIncoming ? ArrowDownLeft : ArrowUpRight;
 const [date, time] = formatDateTime(payment.processedAt || payment.createdAt).split(' ');
 return <button type="button" onClick={() => onShowReceipt(payment)} className="group grid w-full grid-cols-12 items-center gap-4 border-b border-border-light px-6 py-3 text-left transition-colors last:border-0 hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus">
 <div className="col-span-5 flex items-center gap-3 min-w-0">
 <DirectionIcon className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <div className="min-w-0">
 <p className="truncate text-sm font-medium text-text-primary">
 {TRANSACTION_TYPE_LABELS[payment.transactionType] || payment.transactionType}
 </p>
 <p className="truncate text-xs text-text-tertiary">
 {payment.listingTitle || 'Platform Transaction'}
 </p>
 </div>
 </div>

 <div className="col-span-2 hidden md:block text-xs tabular-nums text-text-secondary">
 <p>{date}</p>
 <p className="text-text-tertiary">{time}</p>
 </div>

 <div className="col-span-2 hidden sm:flex items-center">
 <StatusBadge status={payment.status} isSuccess={payment.isSuccess} />
 </div>

 <div className="col-span-1 hidden lg:block text-center text-xs text-text-secondary">
 {payment.paymentType || 'Wallet'}
 </div>

 <div className="col-span-2 flex flex-col items-end shrink-0">
 <p className={`text-sm font-medium tabular-nums ${isIncoming ? 'text-status-success-text' : 'text-text-primary'}`}>
 {isIncoming ? '+' : '-'}{formatCurrency(payment.amount)}
 </p>
 <span className="text-xs text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{t("receipt")}</span>
 </div>
 </button>;
};
const PaymentHistory = ({
 payments,
 onShowReceipt,
 hasActiveFilters,
 onClearFilters,
 isLoading,
 error,
 onRetry
}) => {
 const {
 t
 } = useTranslation();
 if (isLoading) {
 return <div className="divide-y divide-border-light p-4 space-y-4">
 {[...Array(6)].map((_, i) => <SkeletonList key={i} />)}
 </div>;
 }
 if (error) {
 return <div role="alert" className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
 <p className="text-sm text-status-error-text">{error}</p>
 <Button variant="secondary" size="sm" onClick={onRetry}>{t("try_again")}</Button>
 </div>;
 }
 if (payments.length === 0) {
 return <EmptyState
 icon={Receipt}
 title={t("no_activity_found")}
 description={hasActiveFilters ? t("no_transactions_match_filters") : t("transaction_history_empty")}
 primaryAction={hasActiveFilters ? {
 label: t("reset_filters"),
 onClick: onClearFilters
 } : undefined}
 />;
 }
 return <div className="bg-background-primary">
 {/* Table Header */}
 <div className="grid grid-cols-12 items-center gap-4 px-6 py-3 bg-background-secondary border-b border-border-light">
 <div className="col-span-5">
 <span className="text-xs font-semibold text-text-muted">{t("transaction_details")}</span>
 </div>
 <div className="col-span-2 hidden md:block">
 <span className="text-xs font-semibold text-text-muted">{t("date_time")}</span>
 </div>
 <div className="col-span-2 hidden sm:block">
 <span className="text-xs font-semibold text-text-muted">{t("status")}</span>
 </div>
 <div className="col-span-1 hidden lg:block text-center">
 <span className="text-xs font-semibold text-text-muted">{t("method")}</span>
 </div>
 <div className="col-span-2 text-right">
 <span className="text-xs font-semibold text-text-muted">{t("amount")}</span>
 </div>
 </div>

 {/* Table Rows */}
 <div className="divide-y divide-border-light">
 {payments.map((payment, idx) => <PaymentRow key={payment.paymentId || payment.id || idx} payment={payment} onShowReceipt={onShowReceipt} />)}
 </div>
 </div>;
};
export default PaymentHistory;