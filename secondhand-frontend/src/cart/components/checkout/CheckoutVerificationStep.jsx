import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState, memo } from 'react';
import { Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { OTP_CODE_LENGTH, sanitizeOtpInput } from '../../../common/constants/otp.js';
import { findLatestOtpWithEmail } from '../../../payments/utils/otp.js';
import OtpDigitInputGroup from '../../../payments/components/verification/OtpDigitInputGroup.jsx';
import OtpSuggestionBanner from '../../../payments/components/verification/OtpSuggestionBanner.jsx';
import { useOtpSuggestedToast } from '../../../payments/hooks/useOtpSuggestedToast.js';
import { useOtpValidityCountdown } from '../../../payments/hooks/useOtpValidityCountdown.js';
import { EMAIL_TYPES } from '../../../emails/emails.js';
const CheckoutVerificationStep = ({
  paymentVerificationCode,
  setPaymentVerificationCode,
  paymentVerificationExpiresAtMs,
  emails,
  fetchEmails,
  sendVerificationCode,
  onCheckout,
  onBack,
  proceedDisabled,
  isCheckingOut
}) => {
  const {
    t
  } = useTranslation();
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const otpResult = useMemo(() => findLatestOtpWithEmail(emails, {
    emailType: EMAIL_TYPES.PAYMENT_VERIFICATION,
    maxScan: 16
  }), [emails]);
  const suggestedFromInbox = otpResult?.code || null;
  const sourceEmail = otpResult?.email || null;
  useOtpSuggestedToast({
    suggestedCode: suggestedFromInbox,
    enabled: true
  });
  const {
    formatted: ttlFormatted,
    isExpired: ttlExpired,
    active: ttlActive
  } = useOtpValidityCountdown(paymentVerificationExpiresAtMs ?? null);
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [resendTimer]);
  const handleResendCode = async () => {
    setCanResend(false);
    setResendTimer(60);
    setIsResending(true);
    try {
      await sendVerificationCode();
      await fetchEmails();
    } finally {
      setIsResending(false);
    }
  };
  const sanitized = sanitizeOtpInput(paymentVerificationCode, OTP_CODE_LENGTH);
  const isCodeComplete = sanitized.length === OTP_CODE_LENGTH;
  return <div className="p-5 sm:p-7">
      {/* Centered content */}
      <div className="mx-auto max-w-md">
        {/* Lock icon + heading */}
        <div className="mb-6 text-center select-none">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border-light bg-background-secondary shadow-sm">
            <Lock className="h-4 w-4 text-text-secondary" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("verify_your_purchase")}</h2>
          <p className="mt-1.5 text-sm text-text-muted font-medium">
            {`Enter the ${OTP_CODE_LENGTH}-digit code sent to your email.`}
          </p>
          {ttlActive && <p className={`mt-2.5 text-xs font-semibold tracking-wide uppercase tabular-nums ${ttlExpired ? 'text-status-error' : 'text-text-muted'}`}>
               {ttlExpired ? 'Code expired — request a new one.' : `Expires in ${ttlFormatted}`}
            </p>}
        </div>

        {/* OTP suggestion banner */}
        {suggestedFromInbox && <div className="mb-5">
            <OtpSuggestionBanner suggestedCode={suggestedFromInbox} sourceEmail={sourceEmail} onApply={setPaymentVerificationCode} />
          </div>}

        {/* OTP input */}
        <div className="mb-6">
          <OtpDigitInputGroup value={paymentVerificationCode} onChange={setPaymentVerificationCode} dataSlotPrefix="checkout-otp" disabled={!!isCheckingOut || ttlExpired} />

          <div className="mt-4 text-center">
            <button type="button" onClick={handleResendCode} disabled={!canResend || isResending} className={`text-xs font-bold uppercase tracking-wider transition-colors ${canResend && !isResending ? 'text-primary underline underline-offset-4 hover:text-primary-hover' : 'cursor-not-allowed text-text-muted'}`}>
              {isResending ? 'Sending…' : canResend ? 'Resend code' : `Resend in ${resendTimer}s`}
            </button>
          </div>
        </div>

        {/* Complete purchase button — prominent */}
        <button type="button" onClick={onCheckout} disabled={proceedDisabled || isCheckingOut || !isCodeComplete || ttlExpired} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-background-secondary disabled:text-text-muted shadow-sm active:scale-[0.98]">
          {isCheckingOut ? <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{t("processing")}</> : <>
              <ShieldCheck className="h-4 w-4 animate-pulse" strokeWidth={2} />{t("complete_purchase")}</>}
        </button>

        {/* Trust indicators */}
        <div className="mt-5 flex items-center justify-center gap-3 text-caption font-bold uppercase tracking-widest text-text-muted">
          <Lock className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
          <span>{t("256_bit_encrypted")}</span>
          <span className="text-border-light">·</span>
          <span>{t("secure_checkout")}</span>
        </div>
      </div>

      {/* Back link — desktop */}
      <div className="mt-6 hidden border-t border-border-light pt-6 sm:block">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />{t("back")}</button>
      </div>

      {/* Back — mobile */}
      <div className="mt-6 border-t border-border-light pt-5 sm:hidden">
        <button type="button" onClick={onBack} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border-light bg-background-primary py-3.5 text-xs font-bold uppercase tracking-wider text-text-secondary transition-all hover:bg-background-secondary">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />{t("back")}</button>
      </div>
    </div>;
};
export default memo(CheckoutVerificationStep);