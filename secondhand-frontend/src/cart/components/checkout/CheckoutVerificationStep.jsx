import {useEffect, useMemo, useState} from 'react';
import {Lock, ShieldCheck as ShieldCheckIcon} from 'lucide-react';
import {OTP_CODE_LENGTH, sanitizeOtpInput} from '../../../common/constants/otp.js';
import {findLatestOtpFromEmails} from '../../../payments/utils/otp.js';
import OtpDigitInputGroup from '../../../payments/components/verification/OtpDigitInputGroup.jsx';
import OtpSuggestionBanner from '../../../payments/components/verification/OtpSuggestionBanner.jsx';
import {useOtpSuggestedToast} from '../../../payments/hooks/useOtpSuggestedToast.js';
import {useOtpValidityCountdown} from '../../../payments/hooks/useOtpValidityCountdown.js';
import {EMAIL_TYPES} from '../../../emails/emails.js';

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

  const suggestedFromInbox = useMemo(
    () =>
      findLatestOtpFromEmails(emails, {emailType: EMAIL_TYPES.PAYMENT_VERIFICATION, maxScan: 16}),
    [emails],
  );

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
    <div className="p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl border border-slate-200">
        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
          <Lock className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Secure Verification</h2>
          <p className="text-xs text-slate-500">{`A ${OTP_CODE_LENGTH}-digit code has been sent to your email.`}</p>
          {ttlActive ? (
            <p
              className={`text-[11px] font-semibold mt-1 tabular-nums ${
                ttlExpired ? 'text-amber-700' : 'text-slate-600'
              }`}
            >
              {ttlExpired ? 'Code expired — resend a new code.' : `Expires in: ${ttlFormatted}`}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-5">
        {suggestedFromInbox ? (
          <OtpSuggestionBanner suggestedCode={suggestedFromInbox} onApply={setPaymentVerificationCode} />
        ) : null}

        <div>
          <OtpDigitInputGroup
            value={paymentVerificationCode}
            onChange={setPaymentVerificationCode}
            dataSlotPrefix="checkout-otp"
            disabled={!!isCheckingOut || ttlExpired}
          />

          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || isResending}
              className={`text-xs font-semibold transition-colors ${
                canResend && !isResending
                  ? 'text-slate-600 hover:text-slate-900 underline underline-offset-2'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              {isResending ? 'Sending…' : canResend ? 'Resend code' : `Resend in ${resendTimer}s`}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden sm:flex items-center justify-between pt-6 mt-8 border-t border-slate-200/60">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onCheckout}
          disabled={proceedDisabled || isCheckingOut || !isCodeComplete || ttlExpired}
          className={`px-6 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all ${
            isCodeComplete && !proceedDisabled && !isCheckingOut
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700 hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed transform-none'
          }`}
        >
          {isCheckingOut ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Processing…</span>
            </>
          ) : (
            <>
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Complete Purchase</span>
            </>
          )}
        </button>
      </div>

      <div className="sm:hidden sticky bottom-0 -mx-5 mt-6 px-5 py-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-3.5 rounded-2xl border-2 border-slate-200/80 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onCheckout}
            disabled={proceedDisabled || isCheckingOut || !isCodeComplete || ttlExpired}
            className={`px-4 py-3.5 rounded-2xl text-sm font-bold shadow-lg flex justify-center items-center gap-1.5 transition-all ${
              isCodeComplete && !proceedDisabled && !isCheckingOut
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/25'
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
            }`}
          >
            {isCheckingOut ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-slate-400" />
                <span>Processing…</span>
              </>
            ) : (
              'Complete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutVerificationStep;
