import React, { useState } from 'react';
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
  areAllAgreementsAccepted,
}) => {
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
    <div className="p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-[#111]">Payment</h2>
        <div className="text-sm font-semibold tabular-nums text-[#1466c6]">
          {formatCurrency(totalAmount, cur)}
        </div>
      </div>

      <div className="mb-5">
        <label className="flex items-center gap-4 rounded-xl border border-transparent bg-indigo-50/15 p-5 ring-2 ring-indigo-600 shadow-[0_8px_30px_rgb(79,70,229,0.05)]">
          <input
            type="radio"
            name="payment"
            value={CART_PAYMENT_TYPES.EWALLET}
            checked={selectedPaymentType === CART_PAYMENT_TYPES.EWALLET}
            onChange={(event) => setSelectedPaymentType(event.target.value)}
            className="sr-only"
          />
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-indigo-600">
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
          </span>
          <Wallet className="h-5 w-5 shrink-0 text-indigo-600" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold tracking-tight text-slate-900">Wallet</div>
            <div className="mt-0.5 text-xs font-medium text-slate-400">
              {eWallet ? `Balance: ${formatCurrency(walletBalance, cur)}` : 'No wallet available'}
            </div>
          </div>
        </label>

        <div className="mt-3 space-y-2 pl-9 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[#555]">Available</span>
            <span className="font-medium tabular-nums text-[#111]">{formatCurrency(walletBalance, cur)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#555]">Order total</span>
            <span className="font-medium tabular-nums text-[#111]">{formatCurrency(totalAmount, cur)}</span>
          </div>
          {!hasEnoughBalance && (
            <div className="mt-2 rounded-lg border border-[#f5d5d5] bg-[#fdf7f7] px-3 py-2.5 text-xs text-[#a4262c]">
              Insufficient wallet balance. Add funds to continue.
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <PaymentAgreementsSection
          acceptedAgreements={acceptedAgreements}
          onToggle={onAgreementToggle}
          onRequiredAgreementsChange={onRequiredAgreementsChange}
        />
      </div>

      {warningData ? (
        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/30 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">Spending limit warning</h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
                With this order, monthly spending reaches{' '}
                <strong>{formatCurrency(warningData.projectedSpending, cur)}</strong>.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setWarningData(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-black"
                >
                  Continue anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden items-center justify-between border-t border-slate-100 pt-6 sm:flex">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed || isCheckingWarning}
              className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 active:scale-[0.98]"
            >
              {isCheckingWarning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
              {!isCheckingWarning && <ArrowRight className="h-4 w-4" strokeWidth={2} />}
            </button>
          </div>

          <div className="sticky bottom-0 -mx-5 mt-6 grid grid-cols-2 gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:hidden">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition-all hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed || isCheckingWarning}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-black disabled:bg-slate-100 disabled:text-slate-400"
            >
              {isCheckingWarning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckoutPaymentStep;
