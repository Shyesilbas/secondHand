import { useTranslation } from "react-i18next";
import React, { useState, memo } from 'react';
import { 
  Wallet, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  ArrowRight, 
  PlusCircle, 
  CheckCircle2, 
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import { formatCurrency } from '../../../common/formatters.js';
import { CART_PAYMENT_TYPES } from '../../cartConstants.js';
import { ewalletService } from '../../../ewallet/services/ewalletService.js';
import { ROUTES } from '../../../common/constants/routes.js';

const CheckoutPaymentStep = ({
  selectedPaymentType,
  setSelectedPaymentType,
  eWallet,
  calculateTotal,
  currency,
  onNext,
  onBack,
  acceptedAgreements,
  onAgreementToggle,
  onRequiredAgreementsChange,
  areAllAgreementsAccepted
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const totalAmount = calculateTotal();
  const cur = currency || 'TRY';
  const [warningData, setWarningData] = useState(null);
  const [isCheckingWarning, setIsCheckingWarning] = useState(false);

  const walletBalance = Number(eWallet?.balance || 0);
  const hasEnoughBalance = !!eWallet && totalAmount <= walletBalance;
  const canProceed = hasEnoughBalance && areAllAgreementsAccepted();
  const remainingBalance = walletBalance - totalAmount;

  const handleNext = async () => {
    if (!canProceed) return;
    if (!warningData) {
      try {
        setIsCheckingWarning(true);
        const res = await ewalletService.checkSpendingWarning(totalAmount);
        if (res?.warningTriggered) {
          setWarningData(res);
          return;
        }
      } catch (e) {
        console.error('Failed to check spending warning', e);
      } finally {
        setIsCheckingWarning(false);
      }
    }
    onNext();
  };

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            {t("payment", "Ödeme Yöntemi")}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t("secure_escrow_payment_desc", "Ödemeniz güvenli havuz hesabında (Escrow) bloke edilir, onayınızdan sonra satıcıya aktarılır.")}
          </p>
        </div>

        <div className="text-right bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-2xl">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            {t("order_total", "Ödenecek Tutar")}
          </span>
          <span className="text-lg font-black text-slate-900">
            {formatCurrency(totalAmount, cur)}
          </span>
        </div>
      </div>

      {/* ── Virtual Card Style Wallet Selector ──────────────────── */}
      <div>
        <label className={`group relative flex flex-col sm:flex-row cursor-pointer items-start justify-between gap-5 rounded-3xl border-2 p-6 transition-all duration-300 ${
          selectedPaymentType === CART_PAYMENT_TYPES.EWALLET
            ? 'border-slate-900 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-xl shadow-slate-900/10 ring-4 ring-slate-900/5'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}>
          <input
            type="radio"
            name="payment"
            value={CART_PAYMENT_TYPES.EWALLET}
            checked={selectedPaymentType === CART_PAYMENT_TYPES.EWALLET}
            onChange={event => setSelectedPaymentType(event.target.value)}
            className="sr-only"
          />

          {/* Left card content */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md border border-white/20">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-black tracking-tight block">
                  {t("wallet", "SecondHand Cüzdanım")}
                </span>
                <span className="text-[11px] font-medium text-slate-300">
                  Anında Havuz Blokesi & Komisyonsuz
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 block font-bold">
                Mevcut Bakiye
              </span>
              <span className="text-2xl font-black tracking-tight text-white mt-0.5 block">
                {eWallet ? formatCurrency(walletBalance, cur) : '0,00 ₺'}
              </span>
            </div>
          </div>

          {/* Right badge & status */}
          <div className="flex flex-col sm:items-end justify-between self-stretch gap-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/10 text-white px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              %100 Escrow Korumalı
            </span>

            <span className="text-xs text-slate-300 font-mono tracking-wider">
              •••• •••• •••• {eWallet?.id ? String(eWallet.id).padStart(4, '0').slice(-4) : '2026'}
            </span>
          </div>
        </label>
      </div>

      {/* ── Balance Calculation Ledger ─────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 sm:p-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Bakiye Hesap Özeti
        </h4>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center text-slate-600 font-semibold">
            <span>{t("available", "Kullanılabilir Cüzdan Bakiyesi")}</span>
            <span className="font-bold text-slate-900">{formatCurrency(walletBalance, cur)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 font-semibold">
            <span>{t("order_total", "Tahsil Edilecek Sipariş Tutarı")}</span>
            <span className="font-bold text-slate-900">−{formatCurrency(totalAmount, cur)}</span>
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm">
            <span className="font-bold text-slate-800">
              {hasEnoughBalance ? 'İşlem Sonrası Kalan Bakiye' : 'Yetersiz Bakiye (Eksik Tutar)'}
            </span>
            <span className={`font-black ${hasEnoughBalance ? 'text-slate-900' : 'text-rose-600'}`}>
              {hasEnoughBalance
                ? formatCurrency(remainingBalance, cur)
                : `−${formatCurrency(Math.abs(remainingBalance), cur)}`}
            </span>
          </div>
        </div>

        {/* Insufficient Funds Warning & Quick Link */}
        {!hasEnoughBalance && (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50/90 p-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-rose-800 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <strong className="font-bold block text-rose-900">Yetersiz Cüzdan Bakiyesi</strong>
                  <span>{t("insufficient_wallet_balance_add_funds_to", "Bu siparişi tamamlamak için cüzdanınıza bakiye yüklemeniz gerekmektedir.")}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(ROUTES.EWALLET || '/ewallet')}
                className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-xs transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Bakiye Yükle</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Payment Agreements ──────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-4 w-4 text-slate-900" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Yasal Onaylar ve Sözleşmeler
          </h4>
        </div>
        <p className="text-xs text-slate-500 font-medium mb-4">
          Siparişinizi tamamlayabilmek için lütfen aşağıdaki satış ve ön bilgilendirme koşullarını onaylayınız.
        </p>

        <PaymentAgreementsSection
          acceptedAgreements={acceptedAgreements}
          onToggle={onAgreementToggle}
          onRequiredAgreementsChange={onRequiredAgreementsChange}
        />
      </div>

      {/* ── Spending Limit Warning Prompt ────────────────────────── */}
      {warningData ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-amber-900">
                {t("spending_limit_warning", "Aylık Harcama Limiti Uyarısı")}
              </h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-amber-800">
                {t("with_this_order_monthly_spending_reaches", "Bu sipariş ile birlikte aylık harcama limitiniz")} {' '}
                <strong className="font-bold text-amber-950">{formatCurrency(warningData.projectedSpending, cur)}</strong> seviyesine ulaşacaktır.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setWarningData(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition shadow-xs"
                >
                  {t("cancel", "İptal Et")}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-amber-700 transition shadow-xs"
                >
                  {t("continue_anyway", "Yine de Devam Et")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Navigation ─────────────────────────────────────────── */
        <div className="border-t border-slate-100 pt-6">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              {t("back", "Adres Adımına Dön")}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed || isCheckingWarning}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all"
            >
              {isCheckingWarning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Kontrol Ediliyor...</span>
                </>
              ) : (
                <>
                  <span>{t("continue", "Siparişi İncele")}</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(CheckoutPaymentStep);