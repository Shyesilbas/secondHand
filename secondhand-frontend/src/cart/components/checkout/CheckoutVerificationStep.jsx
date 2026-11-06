import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState, memo } from 'react';
import { RotateCw, Clock, KeyRound, Loader2 } from 'lucide-react';
import { OTP_CODE_LENGTH, sanitizeOtpInput } from '../../../common/constants/otp.js';
import { findLatestOtpWithEmail } from '../../../payments/utils/otp.js';
import OtpDigitInputGroup from '../../../payments/components/verification/OtpDigitInputGroup.jsx';
import OtpSuggestionBanner from '../../../payments/components/verification/OtpSuggestionBanner.jsx';
import { useOtpSuggestedToast } from '../../../payments/hooks/useOtpSuggestedToast.js';
import { useOtpValidityCountdown } from '../../../payments/hooks/useOtpValidityCountdown.js';
import { EMAIL_TYPES } from '../../../emails/emails.js';
import Button from '../../../common/components/ui/Button.jsx';
import { formatCurrency } from '../../../common/formatters.js';
import CheckoutStepFooter from './CheckoutStepFooter.jsx';

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
  totalAmount,
  currency
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

  let resendLabel = t('checkout_resend_code', 'Kodu tekrar gönder');
  if (isResending) resendLabel = t('checkout_resending_code', 'Gönderiliyor…');
  else if (!canResend) resendLabel = t('checkout_resend_wait', { defaultValue: 'Tekrar göndermek için {{seconds}} sn', seconds: resendTimer });

  return (
    <div>
      <div className="mx-auto max-w-md space-y-5 px-5 py-8 sm:px-6">
        <div className="text-center">
          <KeyRound className="mx-auto h-5 w-5 text-text-tertiary" strokeWidth={1.5} aria-hidden />
          <h2 className="mt-3 text-base font-semibold text-text-primary">{t('checkout_verify_title', 'Ödemeyi doğrula')}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t('checkout_code_sent', { defaultValue: 'E-posta adresine {{length}} haneli bir kod gönderdik.', length: OTP_CODE_LENGTH })}
          </p>
          {ttlActive && (
            <p className={`mt-2 inline-flex items-center gap-1.5 text-sm tabular-nums ${ttlExpired ? 'text-status-error-text' : 'text-text-tertiary'}`}>
              <Clock className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
              {ttlExpired
                ? t('checkout_code_expired', 'Kodun süresi doldu, yeni kod iste.')
                : t('checkout_code_time_left', { defaultValue: 'Kodun kalan süresi {{time}}', time: ttlFormatted })}
            </p>
          )}
        </div>

        {suggestedFromInbox && (
          <OtpSuggestionBanner suggestedCode={suggestedFromInbox} sourceEmail={sourceEmail} onApply={setPaymentVerificationCode} appliedCode={sanitized} />
        )}

        <OtpDigitInputGroup
          value={paymentVerificationCode}
          onChange={setPaymentVerificationCode}
          dataSlotPrefix="checkout-otp"
          disabled={!!isCheckingOut || ttlExpired}
        />

        <Button
          onClick={onCheckout}
          disabled={proceedDisabled || isCheckingOut || !isCodeComplete || ttlExpired}
          className="w-full"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span>{t('processing', 'Ödeme alınıyor…')}</span>
            </>
          ) : (
            <span>
              {totalAmount != null
                ? t('checkout_complete_with_amount', { defaultValue: '{{amount}} öde', amount: formatCurrency(totalAmount, currency || 'TRY') })
                : t('complete_purchase', 'Ödemeyi tamamla')}
            </span>
          )}
        </Button>

        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={handleResendCode} disabled={!canResend || isResending}>
            <RotateCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} strokeWidth={1.5} aria-hidden />
            <span className="tabular-nums">{resendLabel}</span>
          </Button>
        </div>
      </div>

      <CheckoutStepFooter onBack={onBack} backDisabled={!!isCheckingOut} />
    </div>
  );
};

export default memo(CheckoutVerificationStep);