import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from 'react';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { EMAIL_TYPES } from '../../emails/emails.js';
import { OTP_CODE_LENGTH, VERIFICATION_STEPS, PAYMENT_TYPES } from '../paymentSchema.js';
import { formatPaymentAmount } from '../utils/formatPaymentAmount.js';
import { sanitizeOtpInput, findLatestOtpFromEmails } from '../utils/otp.js';
import OtpDigitInputGroup from './verification/OtpDigitInputGroup.jsx';
import OtpSuggestionBanner from './verification/OtpSuggestionBanner.jsx';
import { useOtpSuggestedToast } from '../hooks/useOtpSuggestedToast.js';
import { useOtpValidityCountdown } from '../hooks/useOtpValidityCountdown.js';
const toNumber = value => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const PaymentMethodsLoading = () => {
  const { t } = useTranslation();
  return <div className="flex items-center justify-center py-4">
    <LoadingIndicator size="h-6 w-6" />
    <span className="ml-2 text-text-secondary">{t("loading")}</span>
  </div>;
};
const EWalletPaymentMethod = ({
  eWallet,
  feeConfig
}) => {
  const {
    t
  } = useTranslation();
  if (!eWallet) {
    return <div className="text-center py-4 border border-dashed border-header-border rounded-lg">
        <svg className="w-12 h-12 text-text-muted mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        <p className="text-text-muted mb-2">{t("ewallet_not_found")}</p>
        <p className="text-sm text-text-muted">{t("you_need_to_create_an_ewallet_first_to_u")}</p>
      </div>;
  }
  const balance = toNumber(eWallet?.balance);
  const totalFee = toNumber(feeConfig?.totalCreationFee);
  const hasSufficientBalance = balance >= totalFee;
  return <div className="space-y-3">
      <div className={`border rounded-lg p-4 ${hasSufficientBalance ? 'bg-status-success-bg border-status-success-border' : 'bg-status-error-bg border-status-error-border'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${hasSufficientBalance ? 'bg-status-success-bg' : 'bg-status-error-bg'}`}>
              <svg className={`w-6 h-6 ${hasSufficientBalance ? 'text-status-success' : 'text-status-error'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-text-primary">{t("ewallet")}</p>
              <p className="text-sm text-text-secondary">{t("digital_wallet")}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-text-primary">
              {formatPaymentAmount(balance)}
            </p>
            <p className={`text-sm ${hasSufficientBalance ? 'text-status-success' : 'text-status-error'}`}>
              {hasSufficientBalance ? 'Sufficient Balance' : 'Insufficient Balance'}
            </p>
          </div>
        </div>
        {!hasSufficientBalance && <div className="mt-3 p-2 bg-status-error-bg rounded border border-status-error-border">
            <p className="text-sm text-status-error-text">{t("you_need")}{formatPaymentAmount(totalFee - balance)}{t("more_to_complete_this_payment")}</p>
          </div>}
      </div>
    </div>;
};
const PaymentMethodDetails = ({
  paymentType,
  paymentMethods,
  isLoadingPaymentMethods,
  eWallet,
  feeConfig,
  onNavigateToPaymentMethods
}) => {
  if (isLoadingPaymentMethods) {
    return <PaymentMethodsLoading />;
  }
  if (paymentType === PAYMENT_TYPES.EWALLET) {
    return <EWalletPaymentMethod eWallet={eWallet} feeConfig={feeConfig} />;
  }
  return null;
};
const canProceedWithPaymentMethod = ({
  paymentType,
  paymentMethods,
  isLoadingPaymentMethods,
  eWallet,
  feeConfig
}) => {
  if (isLoadingPaymentMethods) return false;
  const fee = toNumber(feeConfig?.totalCreationFee);
  if (paymentType === PAYMENT_TYPES.EWALLET) {
    return !!eWallet && toNumber(eWallet.balance) >= toNumber(feeConfig?.totalCreationFee);
  }
  return false;
};
const PaymentVerificationModal = ({
  isOpen,
  selectedListing,
  feeConfig,
  paymentType,
  paymentMethods,
  isLoadingPaymentMethods,
  eWallet,
  onStartVerification,
  onVerifyAndPay,
  onCancel,
  isProcessing,
  verificationCode,
  onChangeVerificationCode,
  codeExpiryTime,
  onResendCode,
  isResendingCode,
  emails,
  onFetchEmails,
  onClearEmails,
  onNavigateToPaymentMethods
}) => {
  const {
    t
  } = useTranslation();
  const [step, setStep] = useState(VERIFICATION_STEPS.REVIEW);
  useEffect(() => {
    if (!isOpen) return;
    setStep(VERIFICATION_STEPS.REVIEW);
  }, [isOpen]);
  const suggestedFromInbox = useMemo(() => findLatestOtpFromEmails(emails, {
    emailType: EMAIL_TYPES.PAYMENT_VERIFICATION,
    maxScan: 16
  }), [emails]);
  const otpExpiresAtMsVerify = useMemo(() => {
    if (step !== VERIFICATION_STEPS.VERIFY || !codeExpiryTime) return null;
    const t = codeExpiryTime instanceof Date ? codeExpiryTime.getTime() : new Date(codeExpiryTime).getTime();
    return Number.isFinite(t) ? t : null;
  }, [step, codeExpiryTime]);
  const {
    formatted: otpTtlFormatted,
    isExpired: otpTtlExpired,
    active: otpTtlActive
  } = useOtpValidityCountdown(otpExpiresAtMsVerify);
  useOtpSuggestedToast({
    suggestedCode: suggestedFromInbox,
    enabled: Boolean(isOpen && step === VERIFICATION_STEPS.VERIFY)
  });
  const canStartPayment = canProceedWithPaymentMethod({
    paymentType,
    paymentMethods,
    isLoadingPaymentMethods,
    eWallet,
    feeConfig
  });
  const handleClose = () => {
    onClearEmails?.();
    onCancel?.();
  };
  const handleStart = async () => {
    const ok = await onStartVerification?.();
    if (!ok) return;
    setStep(VERIFICATION_STEPS.VERIFY);
    try {
      await onFetchEmails?.();
    } catch {}
  };
  const handleVerify = async () => {
    const ok = await onVerifyAndPay?.();
    if (!ok) return;
    onClearEmails?.();
  };
  const handleResend = async () => {
    await onResendCode?.();
    try {
      await onFetchEmails?.();
    } catch {}
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xl">
      <div className="w-full max-w-3xl mx-4 overflow-hidden rounded-2xl bg-background-primary shadow-sm animate-in fade-in zoom-in-95">
        <div className="px-6 py-5 border-b border-slate-100 bg-background-primary/70">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary tracking-tight">
              {step === VERIFICATION_STEPS.REVIEW ? 'Payment Confirmation' : 'Verification'}
            </h3>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="mb-5 rounded-2xl border border-primary bg-gradient-to-r from-indigo-50 via-slate-50 to-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-primary/70">{t("listing")}</p>
                <p className="text-sm font-medium tracking-tight text-text-primary">{selectedListing?.title}</p>
              </div>
              <div className="text-right">
                <p className="text-caption text-primary/70">{t("amount")}</p>
                <p className="font-mono text-sm font-semibold tracking-tight text-text-primary">
                  {feeConfig ? formatPaymentAmount(feeConfig.totalCreationFee) : ''}
                </p>
              </div>
            </div>
          </div>

          {step === VERIFICATION_STEPS.REVIEW ? <div className="mb-6">
              <p className="mb-3 text-sm font-medium text-slate-700">{t("payment_method")}</p>
              <PaymentMethodDetails paymentType={paymentType} paymentMethods={paymentMethods} isLoadingPaymentMethods={isLoadingPaymentMethods} eWallet={eWallet} feeConfig={feeConfig} onNavigateToPaymentMethods={onNavigateToPaymentMethods} />
            </div> : <div className="space-y-4">
              {suggestedFromInbox ? <OtpSuggestionBanner suggestedCode={suggestedFromInbox} onApply={onChangeVerificationCode} /> : null}

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">{t("verification_code")}</label>
                <OtpDigitInputGroup value={verificationCode} onChange={v => onChangeVerificationCode?.(sanitizeOtpInput(v, OTP_CODE_LENGTH))} dataSlotPrefix="listing-fee-otp" disabled={!!isProcessing || otpTtlExpired} />

                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={handleResend} disabled={isResendingCode} className="rounded-xl border border-border-light px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                    {isResendingCode ? 'Sending...' : 'Resend Code'}
                  </button>
                  {otpTtlActive ? <div className={`text-xs font-medium tabular-nums ${otpTtlExpired ? 'text-amber-700' : 'text-slate-600'}`}>
                      {otpTtlExpired ? 'Code expired — resend required' : <>{t("expires_in")}<span>{otpTtlFormatted}</span>
                        </>}
                    </div> : null}
                </div>
              </div>
            </div>}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <button onClick={handleClose} className="rounded-xl border border-border-light px-4 py-2 text-sm text-slate-600 hover:bg-background-primary">{t("cancel")}</button>
          {step === VERIFICATION_STEPS.REVIEW ? <button onClick={handleStart} disabled={!canStartPayment || isProcessing} className="ml-auto rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold tracking-tight text-white shadow-md hover:bg-slate-800 disabled:opacity-60">
              {isProcessing ? 'Processing...' : 'Start Payment'}
            </button> : <button onClick={handleVerify} disabled={isProcessing || (verificationCode || '').length !== OTP_CODE_LENGTH || otpTtlExpired} className="ml-auto rounded-2xl bg-status-success-bg px-4 py-2 text-sm font-semibold tracking-tight text-white shadow-md hover:bg-status-success-bg disabled:opacity-60">
              {isProcessing ? 'Verifying...' : 'Verify & Pay'}
            </button>}
        </div>
      </div>
    </div>;
};
export default PaymentVerificationModal;