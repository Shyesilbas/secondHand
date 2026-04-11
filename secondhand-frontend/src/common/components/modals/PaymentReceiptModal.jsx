import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDownLeft as ArrowDownLeftIcon,
  ArrowUpRight as ArrowUpRightIcon,
  BadgeCheck as CheckBadgeIcon,
  Printer as PrinterIcon,
  X as XMarkIcon,
} from 'lucide-react';
import {
  formatCurrency,
  formatDateTime,
  replaceEnumCodesInHtml,
  resolveEnumLabel,
} from '../../formatters.js';
import { useEnums } from '../../hooks/useEnums.js';
import { PAYMENT_DIRECTIONS } from '../../../payments/paymentSchema.js';

const DIRECTION_LABEL_TR = {
  [PAYMENT_DIRECTIONS.INCOMING]: 'Gelen',
  [PAYMENT_DIRECTIONS.OUTGOING]: 'Giden',
};

const useModalBodyOverflow = (isOpen) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
};

const fullName = (first, last) => [first, last].filter(Boolean).join(' ').trim();

// Özet satır: dekont detayı
const ReceiptRow = ({ label, value, mono }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-header-border/80 last:border-0">
    <span className="text-xs font-medium text-text-muted shrink-0 pt-0.5">{label}</span>
    <span
      className={`text-sm font-semibold text-text-primary text-right ${mono ? 'font-mono text-[13px] tracking-tight' : ''}`}
    >
      {value}
    </span>
  </div>
);

const PaymentReceiptModal = ({ isOpen, onClose, payment }) => {
  const { enums } = useEnums();
  useModalBodyOverflow(isOpen);

  if (!isOpen || !payment) return null;

  const formatAmount = (amount) => formatCurrency(amount, 'TRY');
  const formatDate = (dateString) => formatDateTime(dateString);

  const handlePrint = () => window.print();

  const isIncoming = payment.paymentDirection === 'INCOMING';
  const directionLabel =
    DIRECTION_LABEL_TR[payment.paymentDirection] || payment.paymentDirection;

  const transactionDisplay = replaceEnumCodesInHtml(
    payment.transactionType,
    enums,
    ['paymentTypes']
  );

  const senderFull = fullName(payment.senderName, payment.senderSurname);
  const receiverFull = fullName(payment.receiverName, payment.receiverSurname);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:static print:inset-auto print:p-0 print:overflow-visible">
      <div
        className="absolute inset-0 bg-secondary-900/45 backdrop-blur-sm transition-opacity print:hidden"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="relative w-full max-w-[420px] max-h-[min(90vh,720px)] flex flex-col bg-card-bg rounded-card-2xl shadow-2xl ring-1 ring-card-border print:shadow-none print:ring-0 print:max-w-none print:max-h-none overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-receipt-title"
      >
        {/* Üst çubuk */}
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 print:hidden flex-shrink-0 border-b border-header-border/60 bg-main-bg/80">
          <div className="min-w-0">
            <h2 id="payment-receipt-title" className="text-base font-bold text-text-primary truncate">
              Ödeme dekontu
            </h2>
            <p className="text-[11px] text-text-muted mt-0.5">Dijital işlem özeti</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-secondary-100 transition-colors"
              title="Yazdır"
            >
              <PrinterIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl text-text-muted hover:text-status-error-DEFAULT hover:bg-status-error-bg transition-colors"
              title="Kapat"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 sm:px-6">
          {/* Tutar bloğu */}
          <div
            className={`mt-5 mb-2 rounded-2xl px-5 py-6 text-center ${
              isIncoming
                ? 'bg-accent-emerald-50 ring-1 ring-accent-emerald-100'
                : 'bg-secondary-50 ring-1 ring-secondary-200/80'
            }`}
          >
            <div
              className={`mx-auto mb-3 w-14 h-14 rounded-2xl flex items-center justify-center ${
                isIncoming ? 'bg-white text-accent-emerald-600 shadow-sm' : 'bg-white text-secondary-700 shadow-sm'
              }`}
            >
              {isIncoming ? (
                <ArrowDownLeftIcon className="w-7 h-7" />
              ) : (
                <ArrowUpRightIcon className="w-7 h-7" />
              )}
            </div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
              İşlem tutarı
            </p>
            <p
              className={`text-4xl sm:text-[2.5rem] font-black font-mono tracking-tight ${
                isIncoming ? 'text-accent-emerald-600' : 'text-text-primary'
              }`}
            >
              {isIncoming ? '+' : '-'}
              {formatAmount(payment.amount)}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  payment.isSuccess
                    ? 'bg-status-success-bg text-status-success-text border-status-success-border'
                    : 'bg-status-error-bg text-status-error-text border-status-error-border'
                }`}
              >
                {payment.isSuccess && <CheckBadgeIcon className="w-3.5 h-3.5" />}
                {payment.isSuccess ? 'Başarılı' : 'Başarısız'}
              </span>
              <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold bg-secondary-100 text-text-secondary border border-header-border">
                {directionLabel}
              </span>
            </div>
          </div>

          {/* Detay listesi */}
          <div className="rounded-xl bg-main-bg/50 ring-1 ring-header-border px-4 mb-5">
            {payment.paymentId != null && payment.paymentId !== '' && (
              <ReceiptRow label="İşlem no" value={String(payment.paymentId)} mono />
            )}
            <ReceiptRow label="Tarih" value={formatDate(payment.createdAt)} />
            <ReceiptRow
              label="Ödeme yöntemi"
              value={resolveEnumLabel(enums, 'paymentTypes', payment.paymentType)}
            />
            <ReceiptRow label="İşlem türü" value={transactionDisplay} />
            {payment.listingTitle && (
              <ReceiptRow label="İlan" value={payment.listingTitle} />
            )}
            {payment.listingNo != null && payment.listingNo !== '' && (
              <ReceiptRow label="İlan no" value={String(payment.listingNo)} mono />
            )}
            {senderFull && <ReceiptRow label="Gönderen" value={senderFull} />}
            {receiverFull && <ReceiptRow label="Alıcı" value={receiverFull} />}
          </div>

          {/* Dekont kesik çizgisi */}
          <div className="relative h-6 flex items-center justify-center mb-5 print:mb-4">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-header-border to-transparent" />
            <div className="relative flex gap-1 px-2 bg-card-bg">
              {[...Array(14)].map((_, i) => (
                <span key={i} className="w-1 h-1 rounded-full bg-secondary-300/70" />
              ))}
            </div>
          </div>

          <div className="pb-6 flex flex-col items-center gap-1.5 text-center">
            <div className="flex items-center gap-2 text-text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-400 text-white text-xs font-black">
                S
              </span>
              <span className="text-sm font-bold tracking-tight">SecondHand</span>
            </div>
            <p className="text-[10px] text-text-muted max-w-[260px] leading-relaxed">
              Bu belge bilgilendirme amaçlıdır; fiziksel imza gerektirmez.
            </p>
          </div>
        </div>

        {/* Alt aksiyonlar */}
        <div className="p-4 sm:px-6 sm:pb-5 flex gap-3 print:hidden flex-shrink-0 border-t border-header-border bg-card-bg">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl bg-secondary-100 text-text-secondary hover:bg-secondary-200 transition-colors"
          >
            Kapat
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl bg-btn-primary text-white hover:bg-btn-primary-hover transition-colors shadow-md"
          >
            <PrinterIcon className="w-4 h-4" />
            Yazdır
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PaymentReceiptModal;
