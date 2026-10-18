import { useTranslation } from "react-i18next";
import { useState, memo } from 'react';
import { Wallet, AlertCircle, Loader2, ArrowLeft, ArrowRight, PlusCircle, ShieldCheck, Lock, ArrowUpRight } from 'lucide-react';
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-light pb-5">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight">
            {t("payment", "Ödeme Yöntemi")}
          </h2>
          <p className="text-xs text-text-tertiary font-medium mt-0.5">
            {t("secure_escrow_payment_desc", "Ödemeniz güvenli havuz hesabında (Escrow) bloke edilir, onayınızdan sonra satıcıya aktarılır.")}
          </p>
        </div>

        <div className="text-right bg-background-secondary border border-border/80 px-4 py-2 rounded-md">
          <span className="text-xs font-semibold text-text-muted block">
            {t("order_total", "Ödenecek Tutar")}
          </span>
          <span className="text-lg font-semibold text-text-primary">
            {formatCurrency(totalAmount, cur)}
          </span>
        </div>
      </div>

      {/* ── Virtual Card Style Wallet Selector ──────────────────── */}
      <div>
        <label className={`group relative flex flex-col sm:flex-row cursor-pointer items-start justify-between gap-5 rounded-md border-2 p-6 transition-all duration-300 ${
          selectedPaymentType === CART_PAYMENT_TYPES.EWALLET
            ? 'border-primary bg-primary text-white ring-4'
            : 'border-border bg-white hover:border-card-border-hover'
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
              <Wallet className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <div>
                <span className="text-sm font-semibold tracking-tight block">
                  {t("wallet", "SecondHand Cüzdanım")}
                </span>
                <span className="text-xs font-medium text-secondary-300">
                  Anında Havuz Blokesi & Komisyonsuz
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-text-muted block font-semibold">
                Mevcut Bakiye
              </span>
              <span className="text-2xl font-semibold tracking-tight text-white mt-0.5 block">
                {eWallet ? formatCurrency(walletBalance, cur) : '0,00 ₺'}
              </span>
            </div>
          </div>

          {/* Right badge & status */}
          <div className="flex flex-col sm:items-end justify-between self-stretch gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 text-white px-3 py-1 rounded-sm border border-white/20">
              <ShieldCheck className="h-3.5 w-3.5 text-status-success" />
              %100 Escrow Korumalı
            </span>

            <span className="text-xs text-secondary-300 font-mono">
              •••• •••• •••• {eWallet?.id ? String(eWallet.id).padStart(4, '0').slice(-4) : '2026'}
            </span>
          </div>
        </label>
      </div>

      {/* ── Balance Calculation Ledger ─────────────────────────── */}
      <div className="rounded-md border border-border/90 bg-background-secondary/70 p-5 sm:p-6">
        <h4 className="text-xs font-semibold text-text-muted mb-4">
          Bakiye Hesap Özeti
        </h4>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center text-text-secondary font-semibold">
            <span>{t("available", "Kullanılabilir Cüzdan Bakiyesi")}</span>
            <span className="font-semibold text-text-primary">{formatCurrency(walletBalance, cur)}</span>
          </div>

          <div className="flex justify-between items-center text-text-secondary font-semibold">
            <span>{t("order_total", "Tahsil Edilecek Sipariş Tutarı")}</span>
            <span className="font-semibold text-text-primary">−{formatCurrency(totalAmount, cur)}</span>
          </div>

          <div className="border-t border-border pt-3 flex justify-between items-center text-sm">
            <span className="font-semibold text-text-primary">
              {hasEnoughBalance ? 'İşlem Sonrası Kalan Bakiye' : 'Yetersiz Bakiye (Eksik Tutar)'}
            </span>
            <span className={`font-semibold ${hasEnoughBalance ? 'text-text-primary' : 'text-status-error-text'}`}>
              {hasEnoughBalance
                ? formatCurrency(remainingBalance, cur)
                : `−${formatCurrency(Math.abs(remainingBalance), cur)}`}
            </span>
          </div>
        </div>

        {/* Insufficient Funds Warning & Quick Link */}
        {!hasEnoughBalance && (
          <div className="mt-5 rounded border border-border bg-background-secondary/90 p-4 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-status-error-text text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-status-error-text mt-0.5" />
                <div>
                  <strong className="font-semibold block text-status-error-text">Yetersiz Cüzdan Bakiyesi</strong>
                  <span>{t("insufficient_wallet_balance_add_funds_to", "Bu siparişi tamamlamak için cüzdanınıza bakiye yüklemeniz gerekmektedir.")}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(ROUTES.EWALLET || '/ewallet')}
                className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded bg-status-error px-4 py-2.5 text-xs font-semibold text-white hover:bg-status-error transition-colors"
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
      <div className="rounded-md border border-border/90 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-4 w-4 text-text-primary" />
          <h4 className="text-xs font-semibold text-text-primary">
            Yasal Onaylar ve Sözleşmeler
          </h4>
        </div>
        <p className="text-xs text-text-tertiary font-medium mb-4">
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
        <div className="rounded-md border border-border bg-background-secondary/90 p-5 duration-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-status-warning-text" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-status-warning-text">
                {t("spending_limit_warning", "Aylık Harcama Limiti Uyarısı")}
              </h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-status-warning-text">
                {t("with_this_order_monthly_spending_reaches", "Bu sipariş ile birlikte aylık harcama limitiniz")} {' '}
                <strong className="font-semibold text-status-warning-text">{formatCurrency(warningData.projectedSpending, cur)}</strong> seviyesine ulaşacaktır.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setWarningData(null)}
                  className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3"
                >
                  {t("cancel", "İptal Et")}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded bg-status-warning px-5 py-2 text-xs font-semibold text-white hover:bg-status-warning transition"
                >
                  {t("continue_anyway", "Yine de Devam Et")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Navigation ─────────────────────────────────────────── */
        <div className="border-t border-border-light pt-6">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              {t("back", "Adres Adımına Dön")}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed || isCheckingWarning}
              className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4"
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