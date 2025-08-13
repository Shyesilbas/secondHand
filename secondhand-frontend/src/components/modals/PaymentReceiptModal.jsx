import React from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, PrinterIcon, ShareIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';

const PaymentReceiptModal = ({ isOpen, onClose, payment }) => {
  if (!isOpen || !payment) return null;

  const formatAmount = (amount) => formatCurrency(amount, 'TRY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatDate = (dateString) => formatDateTime(dateString);

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'CREDIT_CARD':
        return 'Kredi Kartı';
      case 'TRANSFER':
        return 'Banka Transferi';
      default:
        return type;
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'LISTING_CREATION':
        return 'İlan Oluşturma Ücreti';
      case 'ITEM_PURCHASE':
        return 'Ürün Satın Alma';
      default:
        return type;
    }
  };

  const getDirectionLabel = (direction) => {
    switch (direction) {
      case 'INCOMING':
        return 'Gelen Ödeme';
      case 'OUTGOING':
        return 'Giden Ödeme';
      default:
        return direction;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const notification = useNotification();

  const handleShare = async () => {
    const receiptText = `
SecondHand Ödeme Dekontu
Dekont No: ${payment.paymentId}
Tarih: ${formatDate(payment.createdAt)}
      Tutar: ${formatAmount(payment.amount)}
İşlem Türü: ${getTransactionTypeLabel(payment.transactionType)}
Durum: ${payment.isSuccess ? 'Başarılı' : 'Başarısız'}
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ödeme Dekontu',
          text: receiptText,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(receiptText);
        notification.showSuccess('Kopyalandı', 'Dekont bilgileri panoya kopyalandı');
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Ödeme Dekontu
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Yazdır"
              >
                <PrinterIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Paylaş"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Receipt Content */}
          <div className="p-6 bg-gradient-to-b from-white to-gray-50">
            {/* Company Header */}
            <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-300">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <span className="text-2xl">💳</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">SecondHand</h2>
              <p className="text-sm text-gray-600">Ödeme Dekontu</p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-4">
              {/* Transaction ID */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">Dekont No:</span>
                <span className="text-sm font-mono text-gray-900 break-all">
                  {payment.paymentId}
                </span>
              </div>

              {/* Date */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">İşlem Tarihi:</span>
                <span className="text-sm text-gray-900">
                  {formatDate(payment.createdAt)}
                </span>
              </div>

              {/* Transaction Type */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">İşlem Türü:</span>
                <span className="text-sm text-gray-900">
                  {getTransactionTypeLabel(payment.transactionType)}
                </span>
              </div>

              {/* Payment Direction */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">İşlem Yönü:</span>
                <span className={`text-sm font-medium ${
                  payment.paymentDirection === 'INCOMING' 
                    ? 'text-green-600' 
                    : 'text-blue-600'
                }`}>
                  {getDirectionLabel(payment.paymentDirection)}
                </span>
              </div>

              {/* Payment Type */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">Ödeme Yöntemi:</span>
                <span className="text-sm text-gray-900">
                  {getPaymentTypeLabel(payment.paymentType)}
                </span>
              </div>

              {/* Sender Info */}
              {payment.senderName && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Gönderen:</span>
                  <span className="text-sm text-gray-900">
                    {payment.senderName} {payment.senderSurname}
                  </span>
                </div>
              )}

              {/* Receiver Info */}
              {payment.receiverName && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Alıcı:</span>
                  <span className="text-sm text-gray-900">
                    {payment.receiverName} {payment.receiverSurname}
                  </span>
                </div>
              )}

              {/* Listing ID */}
              {payment.listingId && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">İlan No:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {payment.listingId}
                  </span>
                </div>
              )}

              {/* Amount */}
              <div className="flex justify-between items-center py-3 bg-gray-100 rounded-lg px-4 mt-4">
                <span className="text-base font-semibold text-gray-700">Tutar:</span>
                <span className={`text-xl font-bold ${
                  payment.paymentDirection === 'INCOMING' 
                    ? 'text-green-600' 
                    : 'text-gray-900'
                }`}>
                  {payment.paymentDirection === 'INCOMING' ? '+' : ''}
                  {formatCurrency(payment.amount)}
                </span>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Durum:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  payment.isSuccess 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {payment.isSuccess ? '✅ Başarılı' : '❌ Başarısız'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300 text-center">
              <p className="text-xs text-gray-500 mb-2">
                Bu dekont elektronik olarak oluşturulmuştur.
              </p>
              <p className="text-xs text-gray-400">
                SecondHand - Güvenli Al-Sat Platformu
              </p>
              <p className="text-xs text-gray-400">
                Dekont oluşturma zamanı: {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 p-4 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Kapat
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
            >
              Yazdır
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PaymentReceiptModal;