import { useEffect, useMemo, useState } from 'react';
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
  isCheckingOut,
}) => {
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isResending, setIsResending] = useState(false);

  const otpResult = useMemo(
    () => findLatestOtpWithEmail(emails, { emailType: EMAIL_TYPES.PAYMENT_VERIFICATION, maxScan: 16 }),
    [emails]
  );
  const suggestedFromInbox = otpResult?.code || null;
  const sourceEmail = otpResult?.email || null;

  useOtpSuggestedToast({ suggestedCode: suggestedFromInbox, enabled: true });

  const { formatted: ttlFormatted, isExpired: ttlExpired, active: ttlActive } =
    useOtpValidityCountdown(paymentVerificationExpiresAtMs ?? null);

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

  return (
    <div className="p-5 sm:p-7">
      {/* Centered content */}
      <div className="mx-auto max-w-md">
        {/* Lock icon + heading */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[#e5e3df] bg-[#fafaf9]">
            <Lock className="h-5 w-5 text-[#555]" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-[#111]">Verify your purchase</h2>
          <p className="mt-1 text-sm text-[#999]">
            {`Enter the ${OTP_CODE_LENGTH}-digit code sent to your email.`}
          </p>
          {ttlActive && (
            <p
              className={`mt-2 text-xs font-medium tabular-nums ${
                ttlExpired ? 'text-[#a4262c]' : 'text-[#555]'
              }`}
            >
              {ttlExpired ? 'Code expired — request a new one.' : `Expires in ${ttlFormatted}`}
            </p>
          )}
        </div>

        {/* OTP suggestion banner */}
        {suggestedFromInbox && (
          <div className="mb-5">
            <OtpSuggestionBanner suggestedCode={suggestedFromInbox} sourceEmail={sourceEmail} onApply={setPaymentVerificationCode} />
          </div>
        )}

        {/* OTP input */}
        <div className="mb-5">
          <OtpDigitInputGroup
            value={paymentVerificationCode}
            onChange={setPaymentVerificationCode}
            dataSlotPrefix="checkout-otp"
            disabled={!!isCheckingOut || ttlExpired}
          />

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || isResending}
              className={`text-xs font-medium transition-colors ${
                canResend && !isResending
                  ? 'text-[#555] underline underline-offset-2 hover:text-[#1466c6]'
                  : 'cursor-not-allowed text-[#ccc]'
              }`}
            >
              {isResending ? 'Sending…' : canResend ? 'Resend code' : `Resend in ${resendTimer}s`}
            </button>
          </div>
        </div>

        {/* Complete purchase button — prominent */}
        <button
          type="button"
          onClick={onCheckout}
          disabled={proceedDisabled || isCheckingOut || !isCodeComplete || ttlExpired}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1466c6] bg-[#1466c6] py-3.5 text-sm font-medium text-white transition-all duration-150 hover:border-[#0f529e] hover:bg-[#0f529e] disabled:cursor-not-allowed disabled:border-[#e8e6e4] disabled:bg-[#e8e6e4] disabled:text-[#9c9894] active:scale-[0.99]"
        >
          {isCheckingOut ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing…
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
              Complete purchase
            </>
          )}
        </button>

        {/* Trust indicators */}
        <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-[#bbb]">
          <Lock className="h-3 w-3" strokeWidth={1.5} />
          <span>256-bit encrypted</span>
          <span className="text-[#e0deda]">·</span>
          <span>Secure checkout</span>
        </div>
      </div>

      {/* Back link — desktop */}
      <div className="mt-6 hidden border-t border-[#f0efed] pt-5 sm:block">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-[#555] transition-colors hover:text-[#111]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back
        </button>
      </div>

      {/* Back — mobile */}
      <div className="mt-4 border-t border-[#f0efed] pt-4 sm:hidden">
        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#e5e3df] bg-white py-3 text-sm font-medium text-[#111] transition-all hover:bg-[#fafaf9]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back
        </button>
      </div>
    </div>
  );
};

export default CheckoutVerificationStep;
