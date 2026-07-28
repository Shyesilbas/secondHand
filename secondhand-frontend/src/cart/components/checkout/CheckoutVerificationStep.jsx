import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState, memo } from 'react';
import { Lock, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
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
  const { t } = useTranslation();
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

  useEffect(() => {
    if (!suggestedFromInbox) {
      fetchEmails().catch(() => {});
      let count = 0;
      const interval = setInterval(async () => {
        if (count >= 6 || suggestedFromInbox) {
          clearInterval(interval);
          return;
        }
        count++;
        try {
          await fetchEmails();
        } catch (err) {
          console.debug('Polling emails failed:', err);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [suggestedFromInbox, fetchEmails]);

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

  return (
    <div className="p-5 sm:p-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      {/* Centered container */}
      <div className="mx-auto max-w-md">
        {/* Lock icon + heading */}
        <div className="mb-6 text-center select-none">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-xs">
            <Lock className="h-6 w-6" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {t("verify_your_purchase", "Güvenli Sipariş Onayı")}
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 font-medium">
            {t("enter_otp_code_desc", "E-postanıza gönderilen 6 haneli güvenlik kodunu girin.")}
          </p>
          {ttlActive && (
            <p className={`mt-2.5 text-xs font-bold tracking-wide uppercase font-mono ${ttlExpired ? 'text-rose-600' : 'text-slate-500'}`}>
              {ttlExpired ? t("code_expired", "Kodun süresi doldu — yeni kod isteyin.") : `${t("expires_in", "Kalan Süre")}: ${ttlFormatted}`}
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
        <div className="mb-6">
          <OtpDigitInputGroup value={paymentVerificationCode} onChange={setPaymentVerificationCode} dataSlotPrefix="checkout-otp" disabled={!!isCheckingOut || ttlExpired} />

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || isResending}
              className={`text-xs font-extrabold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 ${
                canResend && !isResending ? 'text-emerald-600 underline underline-offset-4 hover:text-emerald-700 cursor-pointer' : 'cursor-not-allowed text-slate-400'
              }`}
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {t("sending", "Kod Gönderiliyor...")}
                </>
              ) : canResend ? (
                t("resend_code", "Tekrar Kod Gönder")
              ) : (
                `${t("resend_in", "Yeniden Gönder")}: ${resendTimer}s`
              )}
            </button>
          </div>
        </div>

        {/* Complete purchase button */}
        <button
          type="button"
          onClick={onCheckout}
          disabled={proceedDisabled || isCheckingOut || !isCodeComplete || ttlExpired}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all shadow-md shadow-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-[0.98]"
        >
          {isCheckingOut ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("processing", "İşleniyor...")}
            </>
          ) : (
            <>
              <ShieldCheck className="h-4.5 w-4.5" strokeWidth={2} />
              {t("complete_purchase", "Siparişi Tamamla")}
            </>
          )}
        </button>

        {/* Trust indicators */}
        <div className="mt-5 flex items-center justify-center gap-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          <Lock className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
          <span>{t("256_bit_encrypted", "256-Bit SSL Şifreleme")}</span>
          <span className="text-slate-300">·</span>
          <span>{t("secure_checkout", "Güvenli Ödeme")}</span>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          {t("back", "Geri")}
        </button>
      </div>
    </div>
  );
};

export default memo(CheckoutVerificationStep);