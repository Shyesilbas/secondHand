import { useTranslation } from "react-i18next";
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownLeft, ArrowUpRight, BadgeCheck, Printer, X, ShieldCheck, Calendar, CreditCard, Hash, ShoppingBag, User as UserIcon, Clock, CheckCircle2, XCircle, Copy, Tag } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../formatters.js';
import { PAYMENT_DIRECTIONS, PAYMENT_STATUSES, TRANSACTION_TYPE_LABELS } from '../../../payments/paymentSchema.js';
import { motion, AnimatePresence } from 'framer-motion';
const StatusBadge = ({
  status,
  isSuccess
}) => {
  const {
    t
  } = useTranslation();
  if (status === PAYMENT_STATUSES.ESCROW) {
    return <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-caption font-bold uppercase tracking-tight">{t("in_escrow")}</span>
      </div>;
  }
  if (isSuccess) {
    return <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-caption font-bold uppercase tracking-tight">{t("confirmed")}</span>
      </div>;
  }
  return <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
      <XCircle className="w-3.5 h-3.5" />
      <span className="text-caption font-bold uppercase tracking-tight">{t("failed")}</span>
    </div>;
};
const InfoRow = ({
  label,
  value,
  icon: Icon,
  isCopyable,
  isHighlight
}) => <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 group">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg transition-colors ${isHighlight ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-500'}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-caption font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="flex items-center gap-2 max-w-[60%]">
      <span className={`text-xs font-bold text-right break-words ${isHighlight ? 'text-indigo-600' : 'text-slate-900'}`}>
        {value || '-'}
      </span>
      {isCopyable && value && <button onClick={() => navigator.clipboard.writeText(value)} className="p-1 text-slate-300 hover:text-indigo-500">
          <Copy className="w-3 h-3" />
        </button>}
    </div>
  </div>;
const PaymentReceiptModal = ({
  isOpen,
  onClose,
  payment
}) => {
  const {
    t
  } = useTranslation();
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  if (!isOpen || !payment) return null;
  const isIncoming = payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING;
  const transactionId = String(payment.paymentId || payment.id || 'N/A').slice(0, 12);
  const transactionLabel = TRANSACTION_TYPE_LABELS[payment.transactionType] || payment.transactionType;
  return createPortal(<AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-all print:bg-white print:p-0">
        <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} className="relative w-full max-w-[420px] max-h-[90vh] flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden print:shadow-none print:max-h-none">
          {/* Header - Fixed */}
          <div className="p-5 pb-2 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-caption">{t("s")}</div>
              <span className="text-caption font-bold text-slate-900 uppercase tracking-widest">{t("digital_invoice")}</span>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-50 transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 pt-2 text-center border-b border-dashed border-slate-100 relative bg-white">
              <div className="absolute -bottom-1.5 left-0 right-0 flex justify-between px-2">
                {[...Array(12)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-[#fafafa] -mb-1.5" />)}
              </div>

              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{t("total_amount")}</p>
              <h2 className={`text-lg font-semibold text-text-primary tracking-tighter mb-4 ${isIncoming ? '' : ''}`}>
                {isIncoming ? '+' : '-'}{formatCurrency(payment.amount)}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <StatusBadge status={payment.status} isSuccess={payment.isSuccess} />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
                  {isIncoming ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500" />}
                  <span className="text-caption font-bold uppercase tracking-tight">{isIncoming ? 'Incoming' : 'Outgoing'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 bg-[#fafafa]/50">
              {/* Transaction Type Highlight */}
              <div className="px-1">
                <div className="flex items-center gap-3 p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">{t("transaction_category")}</p>
                    <p className="text-sm font-bold uppercase tracking-tight">{transactionLabel}</p>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div>
                <h3 className="text-sm font-medium text-text-primary text-[9px] uppercase tracking-[0.2em] mb-3 px-1">{t("receipt_details")}</h3>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/50">
                  <InfoRow label={t("date")} value={formatDateTime(payment.processedAt || payment.createdAt)} icon={Calendar} />
                  <InfoRow label={t("payment_method")} value={payment.paymentType || 'E-Wallet'} icon={CreditCard} />
                  <InfoRow label={t("reference_id")} value={transactionId} icon={Hash} isCopyable />
                  {payment.listingTitle && <InfoRow label={t("product_item")} value={payment.listingTitle} icon={ShoppingBag} isHighlight />}
                </div>
              </div>

              {/* Parties Section */}
              <div>
                <h3 className="text-sm font-medium text-text-primary text-[9px] uppercase tracking-[0.2em] mb-3 px-1">{t("parties")}</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-100/50 shadow-sm">
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1.5">{t("sender")}</p>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-slate-50 flex items-center justify-center shrink-0">
                        <UserIcon className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                      <span className="text-caption font-bold text-slate-900 truncate">{payment.senderDisplayName || 'Anonymous'}</span>
                    </div>
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-100/50 shadow-sm">
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1.5">{t("recipient")}</p>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-slate-50 flex items-center justify-center shrink-0">
                        <UserIcon className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                      <span className="text-caption font-bold text-slate-900 truncate">{payment.receiverDisplayName || 'Anonymous'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Footer */}
              <div className="pt-2 flex flex-col items-center gap-2.5 text-center">
                <div className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">{t("verified_by_secondhand_pay")}</span>
                </div>
                <p className="text-[8px] text-slate-400 font-medium leading-relaxed px-4">{t("this_digital_invoice_is_a_confirmation_o")}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="p-5 bg-white border-t border-slate-100 flex gap-3 print:hidden shrink-0">
            <button onClick={onClose} className="flex-1 py-3 px-4 text-caption font-bold uppercase tracking-widest rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all active:scale-95">{t("back")}</button>
            <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-caption font-bold uppercase tracking-widest rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all active:scale-95">
              <Printer className="w-3.5 h-3.5" />{t("download_pdf")}</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>, document.body);
};
export default PaymentReceiptModal;