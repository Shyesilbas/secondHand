import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, PrinterIcon, ShareIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDateTime, resolveEnumLabel, replaceEnumCodesInHtml } from '../../formatters.js';
import { useEnums } from '../../hooks/useEnums.js';
import { useNotification } from '../../../notification/NotificationContext.jsx';

const useModalBodyOverflow = (isOpen) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);
};

const ActionButton = ({ onClick, children, variant = 'primary' }) => {
  const base = "flex-1 px-4 py-2.5 text-sm font-medium rounded-2xl transition-colors";
  const styles = variant === 'primary'
      ? 'text-white bg-btn-primary hover:bg-btn-primary-hover'
      : 'text-text-secondary bg-app-bg hover:bg-gray-100';
  return <button onClick={onClick} className={`${base} ${styles}`}>{children}</button>;
};

const PaymentStatusBadge = ({ isSuccess }) => {
  const bg = isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700';
  const dot = isSuccess ? 'bg-emerald-500' : 'bg-alert-error';
  const label = isSuccess ? 'Successful' : 'Failed';
  return (
      <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-sm font-medium ${bg}`}>
        <div className={`w-2 h-2 rounded-full ${dot}`} />
        {label}
      </div>
  );
};

const PaymentReceiptModal = ({ isOpen, onClose, payment }) => {
  const notification = useNotification();
  const { enums } = useEnums();
  useModalBodyOverflow(isOpen);

  if (!isOpen || !payment) return null;

  const formatAmount = (amount) => formatCurrency(amount, 'TRY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatDate = (dateString) => formatDateTime(dateString);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    let receiptText = `SecondHand Payment Receipt\n\nReceipt: ${payment.paymentId}\nDate: ${formatDate(payment.createdAt)}\nAmount: ${formatAmount(payment.amount)}\nStatus: ${payment.isSuccess ? 'Successful' : 'Failed'}`;
    
    if (payment.listingTitle) {
      receiptText += `\nListing: ${payment.listingTitle}`;
    }
    if (payment.listingNo) {
      receiptText += `\nListing No: ${payment.listingNo}`;
    }
    
    try {
      if (navigator.share) await navigator.share({ title: 'Payment Receipt', text: receiptText });
      else {
        await navigator.clipboard.writeText(receiptText);
        notification.showSuccess('Receipt copied to clipboard');
      }
    } catch (error) { console.error('Share/copy failed:', error); }
  };

  const isIncoming = payment.paymentDirection === 'INCOMING';
  const amountColor = isIncoming ? 'text-emerald-600' : 'text-text-primary';

  const paymentFields = [
    { label: 'Receipt No', value: payment.paymentId, mono: true },
    { label: 'Date', value: formatDate(payment.createdAt) },
    { label: 'Method', value: resolveEnumLabel(enums, 'paymentTypes', payment.paymentType) },
    { label: 'Type', value: replaceEnumCodesInHtml(payment.transactionType, enums, ['paymentTypes']) },
    payment.senderName && { label: 'From', value: `${payment.senderName} ${payment.senderSurname || ''}` },
    payment.receiverName && { label: 'To', value: `${payment.receiverName} ${payment.receiverSurname || ''}` },
    payment.listingTitle && { label: 'Listing', value: payment.listingTitle },
    payment.listingNo && { label: 'Listing No', value: payment.listingNo, mono: true },
    payment.listingId && { label: 'Listing ID', value: payment.listingId, mono: true },
  ].filter(Boolean);

  return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 overflow-y-auto">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm print:hidden" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl print:shadow-none print:rounded-none overflow-hidden">

          <div className="flex items-center justify-between p-6 pb-0 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-btn-primary rounded-2xl flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <div>
                <h2 className="font-semibold text-text-primary">Payment Receipt</h2>
                <p className="text-xs text-text-muted">SecondHand</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[{icon: PrinterIcon, onClick: handlePrint},{icon: ShareIcon, onClick: handleShare},{icon: XMarkIcon, onClick: onClose}].map((btn, i) => {
                const Icon = btn.icon;
                return (
                    <button key={i} onClick={btn.onClick} className="p-2 text-text-muted hover:text-text-secondary hover:bg-app-bg rounded-xl transition-colors">
                      <Icon className="w-5 h-5" />
                    </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
            <div className="text-center py-8">
              <p className="text-sm text-text-muted mb-2">Transaction Amount</p>
              <p className={`text-4xl font-bold ${amountColor}`}>{isIncoming ? '+' : ''}{formatAmount(payment.amount)}</p>
              <PaymentStatusBadge isSuccess={payment.isSuccess} />
            </div>

            <div className="space-y-4">
              {paymentFields.map(({ label, value, mono }) => (
                  <div key={label} className="text-sm">
                    <p className="text-text-muted mb-1">{label}</p>
                    <p className={`text-text-primary ${mono ? 'font-mono' : ''}`}>{value}</p>
                  </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100 text-center text-xs text-text-muted">
              <p>Digital receipt • No signature required</p>
              <p className="mt-1">SecondHand © 2025</p>
            </div>
          </div>

          <div className="flex gap-3 p-6 pt-0 print:hidden">
            <ActionButton onClick={onClose} variant="secondary">Close</ActionButton>
            <ActionButton onClick={handlePrint}>Print Receipt</ActionButton>
          </div>

        </div>
      </div>,
      document.body
  );
};

export default PaymentReceiptModal;
