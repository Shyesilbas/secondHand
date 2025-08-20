import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, PrinterIcon, ShareIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';

const PaymentReceiptModal = ({ isOpen, onClose, payment }) => {
  const notification = useNotification();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !payment) return null;

  const formatAmount = (amount) =>
      formatCurrency(amount, 'TRY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateString) => formatDateTime(dateString);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const receiptText = `SecondHand Payment Receipt\n\nReceipt: ${payment.paymentId}\nDate: ${formatDate(payment.createdAt)}\nAmount: ${formatAmount(payment.amount)}\nStatus: ${payment.isSuccess ? 'Successful' : 'Failed'}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Payment Receipt', text: receiptText });
      } else {
        await navigator.clipboard.writeText(receiptText);
        notification.showSuccess('Receipt copied to clipboard');
      }
    } catch (error) {
      console.error('Share/copy failed:', error);
    }
  };

  const isIncoming = payment.paymentDirection === 'INCOMING';
  const amountColor = isIncoming ? 'text-emerald-600' : 'text-gray-900';

  return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 overflow-y-auto">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm print:hidden"
            onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl print:shadow-none print:rounded-none overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-0 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Payment Receipt</h2>
                <p className="text-xs text-gray-500">SecondHand</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                  onClick={handlePrint}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <PrinterIcon className="w-5 h-5" />
              </button>
              <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
            {/* Amount */}
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-2">Transaction Amount</p>
              <p className={`text-4xl font-bold ${amountColor}`}>
                {isIncoming ? '+' : ''}{formatAmount(payment.amount)}
              </p>
              <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-sm font-medium ${
                  payment.isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                    payment.isSuccess ? 'bg-emerald-500' : 'bg-red-500'
                }`} />
                {payment.isSuccess ? 'Successful' : 'Failed'}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Receipt No</p>
                  <p className="font-mono text-gray-900">{payment.paymentId}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Date</p>
                  <p className="text-gray-900">{formatDate(payment.createdAt)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Method</p>
                  <p className="text-gray-900">{payment.paymentType}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Type</p>
                  <p className="text-gray-900">{payment.transactionType}</p>
                </div>
              </div>
              {payment.senderName && (
                  <div className="text-sm">
                    <p className="text-gray-500 mb-1">From</p>
                    <p className="text-gray-900">{payment.senderName} {payment.senderSurname || ''}</p>
                  </div>
              )}
              {payment.receiverName && (
                  <div className="text-sm">
                    <p className="text-gray-500 mb-1">To</p>
                    <p className="text-gray-900">{payment.receiverName} {payment.receiverSurname || ''}</p>
                  </div>
              )}
              {payment.listingId && (
                  <div className="text-sm">
                    <p className="text-gray-500 mb-1">Listing ID</p>
                    <p className="font-mono text-gray-900">{payment.listingId}</p>
                  </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">Digital receipt • No signature required</p>
              <p className="text-xs text-gray-400 mt-1">SecondHand © 2025</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 p-6 pt-0 print:hidden">
            <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              Close
            </button>
            <button
                onClick={handlePrint}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-colors"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>,
      document.body
  );
};

export default PaymentReceiptModal;
