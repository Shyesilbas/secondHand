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
import Button from '../../../common/components/ui/Button.jsx';

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
    <div className="p-6 sm:p-8 space-y-6">
      {/* Security Header */}
      <div className="mx-auto max-w-md text-center space-y-2">
        <KeyRound className="mx-auto h-5 w-5 text-text-primary" strokeWidth={1.5} aria-hidden />

        <h2 className="text-sm font-semibold text-text-primary">
          {t("verify_your_purchase", "Ödeme Güvenlik Doğrulaması")}
        </h2>
        <p className="text-xs text-text-tertiary leading-relaxed">
          Kayıtlı e-posta adresinize tek kullanımlık <strong className="text-text-primary font-medium">{OTP_CODE_LENGTH} haneli</strong> güvenlik doğrulama kodu gönderildi.
        </p>

        {/* TTL Countdown */}
        {ttlActive && (
          <div className="pt-2 flex items-center justify-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-2xs font-medium border ${
              ttlExpired
                ? 'bg-background-secondary text-status-error-text border-border'
                : 'bg-background-secondary text-text-secondary border-border'
            }`}>
              <Clock className="h-3 w-3 shrink-0" />
              <span>{ttlExpired ? 'Doğrulama kodunun süresi doldu — Yeni kod isteyin' : `Kalan Geçerlilik Süresi: ${ttlFormatted}`}</span>
            </span>
          </div>
        )}
      </div>

      {/* OTP Suggestion Banner (Inbox sync) */}
      {suggestedFromInbox && (
        <div className="mx-auto max-w-md">
          <OtpSuggestionBanner 
            suggestedCode={suggestedFromInbox} 
            sourceEmail={sourceEmail} 
            onApply={setPaymentVerificationCode} 
          />
        </div>
      )}

      {/* OTP Input Card */}
      <div className="mx-auto max-w-md space-y-5">
        <div className="bg-background-secondary/50 border border-border rounded p-5">
          <OtpDigitInputGroup
            value={paymentVerificationCode}
            onChange={setPaymentVerificationCode}
            dataSlotPrefix="checkout-otp"
            disabled={!!isCheckingOut || ttlExpired}
          />

          {/* Resend Action */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || isResending}
              className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
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
        <Button
          variant="primary"
          onClick={onCheckout}
          disabled={proceedDisabled || isCheckingOut || !isCodeComplete || ttlExpired}
          className="w-full"
        >
          {isCheckingOut ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{t("processing", "Ödeme Onaylanıyor & Havuza Alınıyor...")}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>{t("complete_purchase", "Ödemeyi Tamamla ve Onayla")}</span>
            </>
          )}
        </Button>

        {/* Security Seals */}
        <div className="flex items-center justify-center gap-3 text-2xs text-text-tertiary border-t border-border-light pt-4">
          <span className="flex items-center gap-1 text-text-secondary">
            <Lock className="h-3 w-3 text-text-primary" />
            256-Bit SSL
          </span>
          <span>·</span>
          <span className="flex items-center gap-1 text-text-secondary">
            <ShieldCheck className="h-3 w-3 text-text-primary" />
            Escrow Güvencesi
          </span>
          <span>·</span>
          <span className="text-text-secondary">KVKK Uyumlu</span>
        </div>
      </div>

      {/* Back button */}
      <div className="border-t border-border-light pt-4">
        <Button
          variant="secondary"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("back", "Sipariş Özetine Dön")}</span>
        </Button>
      </div>
    </div>
  );
};

export default memo(CheckoutVerificationStep);