import { useTranslation } from "react-i18next";
import React, { useState, memo } from 'react';
import { Wallet, AlertCircle, Loader2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import { formatCurrency } from '../../../common/formatters.js';
import { CART_PAYMENT_TYPES } from '../../cartConstants.js';
import { ewalletService } from '../../../ewallet/services/ewalletService.js';

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
  const totalAmount = calculateTotal();
  const cur = currency || 'TRY';
  const [warningData, setWarningData] = useState(null);
  const [isCheckingWarning, setIsCheckingWarning] = useState(false);
  const walletBalance = Number(eWallet?.balance || 0);
  const hasEnoughBalance = !!eWallet && totalAmount <= walletBalance;
  const canProceed = hasEnoughBalance && areAllAgreementsAccepted();

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
    <div className="p-5 sm:p-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-600" />
          {t("payment", "Ödeme Yöntemi")}
        </h2>
        <div className="text-base font-black font-mono text-emerald-700">
          {formatCurrency(totalAmount, cur)}
        </div>
      </div>

      {/* Wallet Option */}
      <div className="mb-6">
        <label className="flex items-center gap-4 rounded-2xl border border-emerald-600 bg-emerald-50/20 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-600/10 p-5 transition-all duration-200 cursor-pointer">
          <input
            type="radio"
            name="payment"
            value={CART_PAYMENT_TYPES.EWALLET}
            checked={selectedPaymentType === CART_PAYMENT_TYPES.EWALLET}
            onChange={event => setSelectedPaymentType(event.target.value)}
            className="sr-only"
          />
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-600 bg-emerald-600 text-white">
            <span className="h-2 w-2 rounded-full bg-white" />
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-slate-900">{t("wallet", "SecondHand Cüzdan (E-Wallet)")}</div>
            <div className="mt-0.5 text-xs font-semibold text-slate-500">
              {eWallet ? `${t("balance", "Mevcut Bakiye")}: ${formatCurrency(walletBalance, cur)}` : t("no_wallet_available", "Cüzdan verisi yüklenemedi")}
            </div>
          </div>
        </label>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">{t("available", "Mevcut Cüzdan Bakiyesi")}</span>
            <span className="font-extrabold font-mono text-slate-900">{formatCurrency(walletBalance, cur)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">{t("order_total", "Sipariş Tutarı")}</span>
            <span className="font-extrabold font-mono text-slate-900">{formatCurrency(totalAmount, cur)}</span>
          </div>

          {!hasEnoughBalance && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 flex items-center justify-between">
              <span>{t("insufficient_wallet_balance_add_funds_to", "Cüzdan bakiyeniz yetersiz. Lütfen bakiyenizi yükleyin.")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Agreements Section */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
        <PaymentAgreementsSection acceptedAgreements={acceptedAgreements} onToggle={onAgreementToggle} onRequiredAgreementsChange={onRequiredAgreementsChange} />
      </div>

      {/* Spending limit warning or Controls */}
      {warningData ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">{t("spending_limit_warning", "Harcama Limiti Uyarısı")}</h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-amber-800">
                {t("with_this_order_monthly_spending_reaches", "Bu sipariş ile birlikte aylık toplam harcama miktarınız")}{' '}
                <strong className="font-extrabold">{formatCurrency(warningData.projectedSpending, cur)}</strong> seviyesine ulaşacaktır.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button type="button" onClick={() => setWarningData(null)} className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-amber-900 hover:bg-amber-100 transition-all cursor-pointer">
                  {t("cancel", "İptal")}
                </button>
                <button type="button" onClick={handleNext} className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-amber-700 transition-all cursor-pointer">
                  {t("continue_anyway", "Yine de Devam Et")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {t("back", "Geri")}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed || isCheckingWarning}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-white transition-all shadow-md shadow-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none active:scale-[0.98] cursor-pointer"
          >
            {isCheckingWarning ? <Loader2 className="h-4 w-4 animate-spin" /> : t("continue", "Devam Et")}
            {!isCheckingWarning && <ArrowRight className="h-4 w-4" strokeWidth={2} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(CheckoutPaymentStep);