import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState, memo } from 'react';
import { Lock, ShieldCheck, ArrowLeft, RotateCw, Clock, KeyRound } from 'lucide-react';
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
    <div className="p-6 sm:p-8 space-y-8">
      {/* ── Security Vault Vault Card ───────────────────────────── */}
      <div className="mx-auto max-w-md text-center">
        {/* Animated Vault Icon */}
        <KeyRound className="mx-auto mb-4 block h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />

        <h2 className="text-xl font-semibold text-text-primary tracking-tight">
          {t("verify_your_purchase", "Ödeme Güvenlik Doğrulaması")}
        </h2>
        <p className="mt-2 text-xs text-text-tertiary font-medium leading-relaxed">
          Kayıtlı e-posta adresinize tek kullanımlık <strong>{OTP_CODE_LENGTH} haneli</strong> güvenlik doğrulama kodu gönderildi.
        </p>

        {/* TTL Countdown Pill */}
        {ttlActive && (
          <div className="mt-4 flex items-center justify-center">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              ttlExpired
                ? 'bg-background-secondary text-status-error-text border-border'
                : 'bg-background-secondary text-status-warning-text border-border/80'
            }`}>
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{ttlExpired ? 'Doğrulama kodunun süresi doldu — Yeni kod isteyin' : `Kalan Geçerlilik Süresi: ${ttlFormatted}`}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── OTP Suggestion Banner (Inbox sync) ───────────────────── */}
      {suggestedFromInbox && (
        <div className="mx-auto max-w-md duration-300">
          <OtpSuggestionBanner 
            suggestedCode={suggestedFromInbox} 
            sourceEmail={sourceEmail} 
            onApply={setPaymentVerificationCode} 
          />
        </div>
      )}

      {/* ── OTP Input Cells ─────────────────────────────────────── */}
      <div className="mx-auto max-w-md space-y-6">
        <div className="bg-background-secondary/70 border border-border/90 rounded-md p-6">
          <OtpDigitInputGroup
            value={paymentVerificationCode}
            onChange={setPaymentVerificationCode}
            dataSlotPrefix="checkout-otp"
            disabled={!!isCheckingOut || ttlExpired}
          />

          {/* Resend Action */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || isResending}
              className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors ${
                canResend && !isResending
                  ? 'text-text-primary hover:underline cursor-pointer'
                  : 'cursor-not-allowed text-text-muted'
              }`}
            >
              <RotateCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>
                {isResending ? 'Yeni Kod İletiliyor…' : canResend ? 'Tekrar Kod Gönder' : `Yeni kod için bekle: ${resendTimer}s`}
              </span>
            </button>
          </div>
        </div>

        {/* Complete Purchase Button */}
        <button
          type="button"
          onClick={onCheckout}
          disabled={proceedDisabled || isCheckingOut || !isCodeComplete || ttlExpired}
          className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4 w-full"
        >
          {isCheckingOut ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{t("processing", "Ödeme Onaylanıyor & Havuza Alınıyor...")}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" strokeWidth={2.5} />
              <span>{t("complete_purchase", "Ödemeyi Tamamla ve Onayla")}</span>
            </>
          )}
        </button>

        {/* Security Seals */}
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-text-muted border-t border-border-light pt-5">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Lock className="h-3.5 w-3.5 text-text-primary" />
            256-Bit SSL
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5 text-text-secondary">
            <ShieldCheck className="h-3.5 w-3.5 text-status-success-text" />
            Escrow Güvencesi
          </span>
          <span>·</span>
          <span className="text-text-secondary">KVKK Uyumlu</span>
        </div>
      </div>

      {/* ── Back button ─────────────────────────────────────────── */}
      <div className="border-t border-border-light pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          <span>{t("back", "Sipariş Özetine Dön")}</span>
        </button>
      </div>
    </div>
  );
};

export default memo(CheckoutVerificationStep);