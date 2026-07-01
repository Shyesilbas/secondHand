import { useTranslation } from "react-i18next";
import React, { useState, memo } from 'react';
import { Wallet, AlertCircle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
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
  const {
    t
  } = useTranslation();
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
  return <div className="p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("payment")}</h2>
        <div className="text-sm font-semibold tabular-nums text-primary">
          {formatCurrency(totalAmount, cur)}
        </div>
      </div>

      <div className="mb-5">
        <label className="flex items-center gap-4 rounded-2xl border border-primary bg-primary/[0.02] shadow-[0_4px_20px_rgba(20,102,198,0.06)] ring-1 ring-primary/10 p-5 transition-all duration-300 active:scale-[0.99] cursor-pointer">
          <input type="radio" name="payment" value={CART_PAYMENT_TYPES.EWALLET} checked={selectedPaymentType === CART_PAYMENT_TYPES.EWALLET} onChange={event => setSelectedPaymentType(event.target.value)} className="sr-only" />
          <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border border-primary bg-white ring-4 ring-primary/10">
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
          <Wallet className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold tracking-tight text-text-primary">{t("wallet")}</div>
            <div className="mt-1 text-xs font-medium text-text-muted">
              {eWallet ? `Balance: ${formatCurrency(walletBalance, cur)}` : 'No wallet available'}
            </div>
          </div>
        </label>

        <div className="mt-3 space-y-2 pl-9 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-text-secondary">{t("available")}</span>
            <span className="font-medium tabular-nums text-text-primary">{formatCurrency(walletBalance, cur)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-secondary">{t("order_total")}</span>
            <span className="font-medium tabular-nums text-text-primary">{formatCurrency(totalAmount, cur)}</span>
          </div>
          {!hasEnoughBalance && <div className="mt-2 rounded-lg border border-status-error/20 bg-status-error-bg px-3 py-2.5 text-xs text-status-error">{t("insufficient_wallet_balance_add_funds_to")}</div>}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border-light bg-background-primary p-5 shadow-sm">
        <PaymentAgreementsSection acceptedAgreements={acceptedAgreements} onToggle={onAgreementToggle} onRequiredAgreementsChange={onRequiredAgreementsChange} />
      </div>

      {warningData ? <div className="mt-4 rounded-xl border border-amber-100 bg-status-warning-bg/30 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" />
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-text-primary">{t("spending_limit_warning")}</h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-text-secondary">{t("with_this_order_monthly_spending_reaches")}{' '}
                <strong>{formatCurrency(warningData.projectedSpending, cur)}</strong>.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setWarningData(null)} className="rounded-xl border border-border-light bg-background-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-secondary transition hover:bg-background-secondary">{t("cancel")}</button>
                <button type="button" onClick={handleNext} className="rounded-xl bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-primary-hover">{t("continue_anyway")}</button>
              </div>
            </div>
          </div>
        </div> : <>
          <div className="hidden items-center justify-between border-t border-border-light pt-6 sm:flex">
            <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary">
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />{t("back")}</button>
            <button type="button" onClick={handleNext} disabled={!canProceed || isCheckingWarning} className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-background-secondary disabled:text-text-muted active:scale-[0.98]">
              {isCheckingWarning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
              {!isCheckingWarning && <ArrowRight className="h-4 w-4" strokeWidth={2} />}
            </button>
          </div>

          <div className="sticky bottom-0 -mx-5 mt-6 grid grid-cols-2 gap-2 border-t border-border-light bg-background-primary px-5 py-4 sm:hidden">
            <button type="button" onClick={onBack} className="flex items-center justify-center gap-1.5 rounded-xl border border-border-light bg-background-primary py-3.5 text-xs font-bold uppercase tracking-wider text-text-secondary transition-all hover:bg-background-secondary">
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />{t("back")}</button>
            <button type="button" onClick={handleNext} disabled={!canProceed || isCheckingWarning} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-primary-hover disabled:bg-background-secondary disabled:text-text-muted">
              {isCheckingWarning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
            </button>
          </div>
        </>}
    </div>;
};
export default memo(CheckoutPaymentStep);