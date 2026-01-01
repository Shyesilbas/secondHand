import React, {useEffect} from 'react';
import {createPortal} from 'react-dom';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CheckBadgeIcon,
  DocumentDuplicateIcon,
  PrinterIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {formatCurrency, formatDateTime, replaceEnumCodesInHtml, resolveEnumLabel} from '../../formatters.js';
import {useEnums} from '../../hooks/useEnums.js';
import {useNotification} from '../../../notification/NotificationContext.jsx';

const useModalBodyOverflow = (isOpen) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);
};

// --- Modern Aksiyon Butonu ---
const ActionButton = ({ onClick, children, variant = 'primary', icon: Icon }) => {
  const base = "flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold rounded-2xl transition-all duration-200";
  const styles = variant === 'primary'
      ? 'text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-[0.98]'
      : 'text-slate-600 bg-slate-50 hover:bg-slate-100 active:scale-[0.98]';

  return (
      <button onClick={onClick} className={`${base} ${styles}`}>
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </button>
  );
};

const PaymentReceiptModal = ({ isOpen, onClose, payment }) => {
  const notification = useNotification();
  const { enums } = useEnums();
  useModalBodyOverflow(isOpen);

  if (!isOpen || !payment) return null;

  const formatAmount = (amount) => formatCurrency(amount, 'TRY');
  const formatDate = (dateString) => formatDateTime(dateString);

  const handlePrint = () => window.print();

  const handleCopyId = () => {
    navigator.clipboard.writeText(payment.paymentId);
    notification.showSuccess('Transaction ID copied');
  };

  const isIncoming = payment.paymentDirection === 'INCOMING';

  const details = [
    { label: 'Payment Date', value: formatDate(payment.createdAt) },
    { label: 'Payment Method', value: resolveEnumLabel(enums, 'paymentTypes', payment.paymentType) },
    { label: 'Transaction', value: replaceEnumCodesInHtml(payment.transactionType, enums, ['paymentTypes']) },
    { label: 'Reference', value: payment.listingTitle || 'General Payment' },
  ].filter(Boolean);

  return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity print:hidden" onClick={onClose} />

        {/* Modal Container */}
        <div className="relative w-full max-w-[440px] max-h-[90vh] bg-white rounded-[2.5rem] sm:rounded-[2.5rem] rounded-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] print:shadow-none print:rounded-none overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">

          {/* Header Controls */}
          <div className="flex items-center justify-between p-4 sm:p-8 pb-0 print:hidden flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verified Receipt</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors" title="Print">
                <PrinterIcon className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Receipt Content */}
          <div className="p-4 sm:p-8 pt-6 space-y-6 sm:space-y-8 overflow-y-auto flex-1">

            {/* Main Visual: Amount & Status */}
            <div className="relative flex flex-col items-center py-6">
              <div className={`mb-4 w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner ${isIncoming ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-900'}`}>
                {isIncoming ? <ArrowDownLeftIcon className="w-8 h-8" /> : <ArrowUpRightIcon className="w-8 h-8" />}
              </div>

              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
              <h2 className={`text-4xl font-black tracking-tighter ${isIncoming ? 'text-emerald-600' : 'text-slate-900'}`}>
                {isIncoming ? '+' : ''}{formatAmount(payment.amount)}
              </h2>

              {payment.isSuccess ? (
                  <div className="mt-4 px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-100 flex items-center gap-1.5">
                    <CheckBadgeIcon className="w-4 h-4" /> Transaction Successful
                  </div>
              ) : (
                  <div className="mt-4 px-3 py-1 bg-rose-50 text-rose-700 text-[11px] font-bold rounded-full border border-rose-100">
                    Transaction Failed
                  </div>
              )}
            </div>

            {/* Info Sections */}
            <div className="space-y-6">
              {/* Transaction ID Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transaction ID</p>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-slate-600 truncate">{payment.paymentId}</code>
                  <button onClick={handleCopyId} className="p-1 text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Field Grid */}
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 px-1">
                {details.map((field) => (
                    <div key={field.label}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">{field.label}</p>
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{field.value}</p>
                    </div>
                ))}
              </div>

              {/* Sender/Receiver (Dynamic) */}
              {(payment.senderName || payment.receiverName) && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Sender</p>
                        <p className="text-sm font-semibold text-slate-900">{payment.senderName || 'Anonymous'}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-100" />
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Receiver</p>
                        <p className="text-sm font-semibold text-slate-900">{payment.receiverName || 'SecondHand User'}</p>
                      </div>
                    </div>
                  </div>
              )}
            </div>

            {/* Footer Branding */}
            <div className="pt-4 flex flex-col items-center gap-2">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <div className="flex items-center gap-2 mt-4 opacity-30">
                <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-[10px] font-black">S</span>
                </div>
                <span className="text-xs font-black tracking-tighter text-slate-900">SecondHand Inc.</span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium">© 2026 Digital Document • No Physical Signature Required</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-8 pt-0 flex gap-3 print:hidden flex-shrink-0 border-t border-slate-100">
            <ActionButton variant="secondary" onClick={onClose}>
              Close
            </ActionButton>
            <ActionButton variant="primary" onClick={handlePrint} icon={PrinterIcon}>
              Print Document
            </ActionButton>
          </div>

        </div>
      </div>,
      document.body
  );
};

export default PaymentReceiptModal;