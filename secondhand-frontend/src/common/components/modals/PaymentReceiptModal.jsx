import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  Printer,
  X,
  ShieldCheck,
  Info,
  Calendar,
  CreditCard,
  Hash,
  ShoppingBag,
  User as UserIcon
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
  [PAYMENT_DIRECTIONS.INCOMING]: 'Gelen Ödeme',
  [PAYMENT_DIRECTIONS.OUTGOING]: 'Giden Ödeme',
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

// Modernized row component
const ReceiptRow = ({ label, value, icon: Icon, mono }) => (
  <div className="flex items-center justify-between gap-4 py-3.5 group">
    <div className="flex items-center gap-2.5 shrink-0">
      {Icon && <Icon className="w-3.5 h-3.5 text-text-muted/70 group-hover:text-primary-500 transition-colors" />}
      <span className="text-[12px] font-medium text-text-muted">{label}</span>
    </div>
    <span
      className={`text-[13px] font-bold text-text-primary text-right break-words max-w-[200px] ${
        mono ? 'font-mono tracking-tight text-secondary-700' : ''
      }`}
    >
      {value || '-'}
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-[2px] transition-all print:static print:inset-auto print:p-0 print:overflow-visible">
      <div
        className="absolute inset-0 transition-opacity print:hidden"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="relative w-full max-w-[440px] max-h-[min(95vh,820px)] flex flex-col bg-card-bg rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] ring-1 ring-white/10 print:shadow-none print:ring-0 print:max-w-none overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Decorative Top Gradient */}
        <div className={`h-2 w-full shrink-0 ${isIncoming ? 'bg-emerald-500' : 'bg-primary-500'}`} />

        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isIncoming ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-text-primary tracking-tight">
                İşlem Dekontu
              </h2>
              <p className="text-[11px] font-medium text-text-muted/80">Referans: {String(payment.paymentId || 'N/A').slice(0, 8)}...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary-100 text-text-muted hover:text-text-primary transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 overflow-y-auto custom-scrollbar">
          {/* Main Amount Card */}
          <div className="relative mt-2 mb-8 p-8 rounded-[1.75rem] bg-gradient-to-br from-secondary-50 to-white ring-1 ring-secondary-200/50 shadow-inner overflow-hidden text-center">
             {/* Background Pattern */}
             <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
             
             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">
               Toplam Tutar
             </p>
             <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`text-5xl font-black tracking-tighter ${isIncoming ? 'text-emerald-600' : 'text-text-primary'}`}>
                  {isIncoming ? '+' : '-'}
                  {formatAmount(payment.amount)}
                </span>
             </div>

             <div className="flex justify-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ring-1 ${
                  payment.isSuccess 
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' 
                    : 'bg-rose-50 text-rose-700 ring-rose-200'
                }`}>
                  {payment.isSuccess ? <BadgeCheck className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                  {payment.isSuccess ? 'Onaylandı' : 'Reddedildi'}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white text-text-secondary ring-1 ring-secondary-200 shadow-sm uppercase tracking-wide">
                   {isIncoming ? <ArrowDownLeft className="w-3 h-3 text-emerald-500" /> : <ArrowUpRight className="w-3 h-3 text-primary-500" />}
                   {directionLabel}
                </div>
             </div>
          </div>

          {/* Details Section */}
          <div className="space-y-1">
             <h3 className="text-[11px] font-black text-text-muted/60 uppercase tracking-widest px-1 mb-3">İşlem Detayları</h3>
             <div className="bg-secondary-50/50 rounded-2xl ring-1 ring-secondary-200/40 divide-y divide-secondary-200/40 px-4">
                <ReceiptRow 
                  label="İşlem Tarihi" 
                  value={formatDate(payment.createdAt)} 
                  icon={Calendar}
                />
                <ReceiptRow 
                  label="Ödeme Yöntemi" 
                  value={resolveEnumLabel(enums, 'paymentTypes', payment.paymentType)} 
                  icon={CreditCard}
                />
                <ReceiptRow 
                  label="İşlem Türü" 
                  value={transactionDisplay} 
                  icon={Info}
                />
                {payment.listingTitle && (
                  <ReceiptRow 
                    label="İlgili İlan" 
                    value={payment.listingTitle} 
                    icon={ShoppingBag}
                  />
                )}
                {payment.paymentId && (
                   <ReceiptRow 
                    label="İşlem Numarası" 
                    value={String(payment.paymentId)} 
                    icon={Hash}
                    mono
                  />
                )}
             </div>
          </div>

          {/* Parties Section */}
          <div className="mt-6 space-y-1">
             <h3 className="text-[11px] font-black text-text-muted/60 uppercase tracking-widest px-1 mb-3">TARAFLAR</h3>
             <div className="bg-secondary-50/50 rounded-2xl ring-1 ring-secondary-200/40 divide-y divide-secondary-200/40 px-4">
                {senderFull && (
                  <ReceiptRow 
                    label="Gönderen" 
                    value={senderFull} 
                    icon={UserIcon}
                  />
                )}
                {receiverFull && (
                  <ReceiptRow 
                    label="Alıcı" 
                    value={receiverFull} 
                    icon={UserIcon}
                  />
                )}
             </div>
          </div>

          {/* Security Stamp & Footer */}
          <div className="mt-10 pt-8 border-t border-dashed border-secondary-300 relative">
             {/* Scissors Icon for cut line effect */}
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card-bg px-4 flex gap-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-secondary-300" />
                ))}
             </div>

             <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary-500/20">S</div>
                   <span className="text-sm font-black tracking-tight text-text-primary">SecondHand <span className="text-primary-500">Pay</span></span>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] text-text-muted font-medium leading-relaxed max-w-[280px]">
                     Bu dekont sistem tarafından otomatik oluşturulmuştur ve 
                     mali bir geçerliliği yoktur.
                   </p>
                   <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full ring-1 ring-emerald-100">
                      <ShieldCheck className="w-3 h-3" />
                      GÜVENLİ DİJİTAL İŞLEM SERTİFİKALI
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-secondary-50/80 backdrop-blur-md border-t border-secondary-200 flex gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 text-sm font-bold rounded-2xl bg-white text-text-secondary hover:bg-secondary-100 ring-1 ring-secondary-200 transition-all active:scale-95"
          >
            Kapat
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-bold rounded-2xl bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Yazdır
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PaymentReceiptModal;
