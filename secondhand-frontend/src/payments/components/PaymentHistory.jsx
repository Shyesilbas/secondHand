import React from 'react';
import {Banknote, Receipt, ArrowUpRight, ArrowDownLeft, ShieldCheck, Clock, CheckCircle2, XCircle, MoreVertical} from 'lucide-react';
import {formatCurrency, formatDateTime} from '../../common/formatters.js';
import {
  PAYMENT_DIRECTION_LABELS,
  PAYMENT_DIRECTIONS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
  TRANSACTION_TYPE_LABELS,
} from '../paymentSchema.js';
import { motion } from 'framer-motion';

const StatusBadge = ({ status, isSuccess }) => {
  if (status === PAYMENT_STATUSES.ESCROW) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
        <Clock className="w-2.5 h-2.5" />
        <span className="text-[10px] font-bold uppercase tracking-tight">Escrow</span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
        <CheckCircle2 className="w-2.5 h-2.5" />
        <span className="text-[10px] font-bold uppercase tracking-tight">Success</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
      <XCircle className="w-2.5 h-2.5" />
      <span className="text-[10px] font-bold uppercase tracking-tight">Failed</span>
    </div>
  );
};

const PaymentRow = ({ payment, onShowReceipt, idx }) => {
  const isIncoming = payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING;
  const isEscrow = payment.status === PAYMENT_STATUSES.ESCROW;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.01 }}
      onClick={() => onShowReceipt(payment)}
      className="group grid grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
    >
      {/* Transaction & Type */}
      <div className="col-span-5 flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isEscrow ? 'bg-amber-50 text-amber-600' :
          isIncoming ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
        }`}>
          {isEscrow ? <ShieldCheck className="w-4 h-4" /> : 
           isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">
            {TRANSACTION_TYPE_LABELS[payment.transactionType] || payment.transactionType}
          </p>
          <p className="text-[11px] text-slate-400 font-medium truncate">
            {payment.listingTitle || 'Platform Transaction'}
          </p>
        </div>
      </div>

      {/* Date */}
      <div className="col-span-2 hidden md:block">
        <p className="text-xs font-bold text-slate-500">
          {formatDateTime(payment.processedAt || payment.createdAt).split(' ')[0]}
        </p>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
          {formatDateTime(payment.processedAt || payment.createdAt).split(' ')[1]}
        </p>
      </div>

      {/* Status */}
      <div className="col-span-2 hidden sm:flex items-center">
        <StatusBadge status={payment.status} isSuccess={payment.isSuccess} />
      </div>

      {/* Payment Method */}
      <div className="col-span-1 hidden lg:block text-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded">
          {payment.paymentType || 'Wallet'}
        </span>
      </div>

      {/* Amount */}
      <div className="col-span-2 flex flex-col items-end shrink-0">
        <p className={`text-sm font-bold tracking-tight ${
          isIncoming ? 'text-emerald-600' : 'text-slate-900'
        }`}>
          {isIncoming ? '+' : '-'}{formatCurrency(payment.amount)}
        </p>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-indigo-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Receipt</span>
          <MoreVertical className="w-3 h-3 text-slate-300" />
        </div>
      </div>
    </motion.div>
  );
};

const PaymentHistory = ({ payments, onShowReceipt, hasActiveFilters, onClearFilters, isLoading }) => {
  if (isLoading) {
    return (
      <div className="divide-y divide-slate-50">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="px-6 py-6 animate-pulse grid grid-cols-12 gap-4">
            <div className="col-span-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="col-span-2 bg-slate-50 rounded h-4" />
            <div className="col-span-2 bg-slate-50 rounded h-4" />
            <div className="col-span-3 bg-slate-100 rounded h-6 ml-auto w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100/50">
          <Receipt className="w-7 h-7 text-slate-300" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">No activity found</h3>
        <p className="text-[11px] text-slate-400 font-medium max-w-[220px] mx-auto leading-relaxed">
          {hasActiveFilters 
            ? 'We couldn\'t find any transactions matching your current filters.' 
            : 'Your transaction history is empty. Start exploring the marketplace to see activity here.'}
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="mt-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Table Header */}
      <div className="grid grid-cols-12 items-center gap-4 px-6 py-3 bg-slate-50/50 border-b border-slate-100">
        <div className="col-span-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Transaction & Details</span>
        </div>
        <div className="col-span-2 hidden md:block">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Date & Time</span>
        </div>
        <div className="col-span-2 hidden sm:block">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Status</span>
        </div>
        <div className="col-span-1 hidden lg:block text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Method</span>
        </div>
        <div className="col-span-2 text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Amount</span>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-50">
        {payments.map((payment, idx) => (
          <PaymentRow
            key={payment.id || idx}
            payment={payment}
            onShowReceipt={onShowReceipt}
            idx={idx}
          />
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;
