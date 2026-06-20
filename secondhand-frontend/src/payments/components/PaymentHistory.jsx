import { useTranslation } from "react-i18next";
import React from 'react';
import { Banknote, Receipt, ArrowUpRight, ArrowDownLeft, ShieldCheck, Clock, CheckCircle2, XCircle, MoreVertical } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { PAYMENT_DIRECTION_LABELS, PAYMENT_DIRECTIONS, PAYMENT_STATUS_LABELS, PAYMENT_STATUSES, TRANSACTION_TYPE_LABELS } from '../paymentSchema.js';
import { SkeletonList, EmptyState } from '../../common/components/ui/index.js';
const StatusBadge = ({
  status,
  isSuccess
}) => {
  const {
    t
  } = useTranslation();
  if (status === PAYMENT_STATUSES.ESCROW) {
    return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning border border-amber-100">
        <Clock className="w-2.5 h-2.5" />
        <span className="text-caption font-bold uppercase tracking-tight">{t("escrow")}</span>
      </div>;
  }
  if (isSuccess) {
    return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-success-bg text-status-success border border-emerald-100">
        <CheckCircle2 className="w-2.5 h-2.5" />
        <span className="text-caption font-bold uppercase tracking-tight">{t("success")}</span>
      </div>;
  }
  return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
      <XCircle className="w-2.5 h-2.5" />
      <span className="text-caption font-bold uppercase tracking-tight">{t("failed")}</span>
    </div>;
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
  return <div onClick={() => onShowReceipt(payment)} className="group grid grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-50 last:border-0">
      {/* Transaction & Type */}
      <div className="col-span-5 flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isEscrow ? 'bg-status-warning-bg text-status-warning' : isIncoming ? 'bg-status-success-bg text-status-success' : 'bg-slate-100 text-slate-500'}`}>
          {isEscrow ? <ShieldCheck className="w-4 h-4" /> : isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-primary truncate">
            {TRANSACTION_TYPE_LABELS[payment.transactionType] || payment.transactionType}
          </p>
          <p className="text-caption text-slate-400 font-medium truncate">
            {payment.listingTitle || 'Platform Transaction'}
          </p>
        </div>
      </div>

      {/* Date */}
      <div className="col-span-2 hidden md:block">
        <p className="text-xs font-bold text-slate-500">
          {formatDateTime(payment.processedAt || payment.createdAt).split(' ')[0]}
        </p>
        <p className="text-caption text-slate-400 font-medium uppercase tracking-tight">
          {formatDateTime(payment.processedAt || payment.createdAt).split(' ')[1]}
        </p>
      </div>

      {/* Status */}
      <div className="col-span-2 hidden sm:flex items-center">
        <StatusBadge status={payment.status} isSuccess={payment.isSuccess} />
      </div>

      {/* Payment Method */}
      <div className="col-span-1 hidden lg:block text-center">
        <span className="text-caption font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded">
          {payment.paymentType || 'Wallet'}
        </span>
      </div>

      {/* Amount */}
      <div className="col-span-2 flex flex-col items-end shrink-0">
        <p className={`text-sm font-bold tracking-tight ${isIncoming ? 'text-status-success' : 'text-text-primary'}`}>
          {isIncoming ? '+' : '-'}{formatCurrency(payment.amount)}
        </p>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-primary uppercase opacity-0 group-hover:opacity-100 transition-opacity">{t("receipt")}</span>
          <MoreVertical className="w-3 h-3 text-slate-300" />
        </div>
      </div>
    </div>;
};
const PaymentHistory = ({
  payments,
  onShowReceipt,
  hasActiveFilters,
  onClearFilters,
  isLoading
}) => {
  const {
    t
  } = useTranslation();
  if (isLoading) {
    return <div className="divide-y divide-slate-50 p-4 space-y-4">
        {[...Array(6)].map((_, i) => <SkeletonList key={i} />)}
      </div>;
  }
  if (payments.length === 0) {
    return <EmptyState
        icon={Receipt}
        title={t("no_activity_found")}
        description={hasActiveFilters ? t("no_transactions_match_filters", "We couldn't find any transactions matching your current filters.") : t("transaction_history_empty", "Your transaction history is empty. Start exploring the marketplace to see activity here.")}
        primaryAction={hasActiveFilters ? {
          label: t("reset_filters"),
          onClick: onClearFilters
        } : undefined}
      />;
  }
  return <div className="bg-background-primary">
      {/* Table Header */}
      <div className="grid grid-cols-12 items-center gap-4 px-6 py-3 bg-slate-50/50 border-b border-slate-100">
        <div className="col-span-5">
          <span className="text-caption font-bold text-slate-400 uppercase tracking-[0.1em]">{t("transaction_details")}</span>
        </div>
        <div className="col-span-2 hidden md:block">
          <span className="text-caption font-bold text-slate-400 uppercase tracking-[0.1em]">{t("date_time")}</span>
        </div>
        <div className="col-span-2 hidden sm:block">
          <span className="text-caption font-bold text-slate-400 uppercase tracking-[0.1em]">{t("status")}</span>
        </div>
        <div className="col-span-1 hidden lg:block text-center">
          <span className="text-caption font-bold text-slate-400 uppercase tracking-[0.1em]">{t("method")}</span>
        </div>
        <div className="col-span-2 text-right">
          <span className="text-caption font-bold text-slate-400 uppercase tracking-[0.1em]">{t("amount")}</span>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-50">
        {payments.map((payment, idx) => <PaymentRow key={payment.id || idx} payment={payment} onShowReceipt={onShowReceipt} />)}
      </div>
    </div>;
};
export default PaymentHistory;