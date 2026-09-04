import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState, memo } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  ArrowLeft, 
  RotateCw, 
  Clock, 
  CheckCircle2, 
  KeyRound, 
  MailCheck, 
  Sparkles 
} from 'lucide-react';
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
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-lg shadow-slate-900/10 ring-4 ring-slate-900/5">
          <KeyRound className="h-7 w-7" strokeWidth={2.2} />
        </div>

        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          {t("verify_your_purchase", "Ödeme Güvenlik Doğrulaması")}
        </h2>
        <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">
          Kayıtlı e-posta adresinize tek kullanımlık <strong>{OTP_CODE_LENGTH} haneli</strong> güvenlik doğrulama kodu gönderildi.
        </p>

        {/* TTL Countdown Pill */}
        {ttlActive && (
          <div className="mt-4 flex items-center justify-center">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              ttlExpired
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-xs'
            }`}>
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{ttlExpired ? '⚠️ Doğrulama kodunun süresi doldu — Yeni kod isteyin' : `Kalan Geçerlilik Süresi: ${ttlFormatted}`}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── OTP Suggestion Banner (Inbox sync) ───────────────────── */}
      {suggestedFromInbox && (
        <div className="mx-auto max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
          <OtpSuggestionBanner 
            suggestedCode={suggestedFromInbox} 
            sourceEmail={sourceEmail} 
            onApply={setPaymentVerificationCode} 
          />
        </div>
      )}

      {/* ── OTP Input Cells ─────────────────────────────────────── */}
      <div className="mx-auto max-w-md space-y-6">
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-6 shadow-xs">
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
              className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                canResend && !isResending
                  ? 'text-slate-900 hover:underline cursor-pointer'
                  : 'cursor-not-allowed text-slate-400'
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
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-900 py-4 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all"
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
        <div className="flex items-center justify-center gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 pt-5">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Lock className="h-3.5 w-3.5 text-slate-900" />
            256-Bit SSL
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Escrow Güvencesi
          </span>
          <span>·</span>
          <span className="text-slate-600">KVKK Uyumlu</span>
        </div>
      </div>

      {/* ── Back button ─────────────────────────────────────────── */}
      <div className="border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          <span>{t("back", "Sipariş Özetine Dön")}</span>
        </button>
      </div>
    </div>
  );
};

export default memo(CheckoutVerificationStep);