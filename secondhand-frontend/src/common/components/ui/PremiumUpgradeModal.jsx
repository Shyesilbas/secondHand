import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Button from './Button.jsx';
import Modal from './Modal.jsx';
import PremiumUpgradeModalHeader from './premium/PremiumUpgradeModalHeader.jsx';
import PremiumUpgradePlanStep from './premium/PremiumUpgradePlanStep.jsx';
import PremiumUpgradeVerificationStep from './premium/PremiumUpgradeVerificationStep.jsx';
import { membershipService } from '../../services/membershipService';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import { useRequiredAgreements } from '../../../agreements/hooks/useAgreements.js';
import { useAgreementsState } from '../../../payments/hooks/useListingPaymentFlow.js';
import { useOtpValidityCountdown } from '../../../payments/hooks/useOtpValidityCountdown.js';
import { OTP_CODE_LENGTH } from '../../constants/otp.js';
import { ROUTES } from '../../constants/routes.js';
import { orderService } from '../../../order/services/orderService.js';
import { useEmails } from '../../../payments/hooks/useEmails.js';
import { EMAIL_TYPES } from '../../../emails/emails.js';
import { sanitizeOtpInput, findLatestOtpWithEmail } from '../../../payments/utils/otp.js';
import { useEWallet } from '../../../ewallet/hooks/useEWallet.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { authService } from '../../../auth/services/authService.js';

const PremiumUpgradeModal = ({ isOpen, onClose, featureHint }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSuccess } = useNotification();
  const { updateUser } = useAuth();

  const FEATURES = useMemo(
    () => [
      {
        label: t('fast_shipping', 'Hızlı Teslimat'),
        free: t('premium_feature_shipping_free', '3 iş günü'),
        premium: t('premium_feature_shipping_premium', '1 iş günü (Ekspres kargo)')
      },
      {
        label: t('showcase_slot', 'Vitrin Yuvası'),
        free: t('premium_feature_showcase_free', '1 yuva'),
        premium: t('premium_feature_showcase_premium', '4 yuva (4x daha fazla alıcı)')
      },
      {
        label: t('aura_ai_message_limit', 'Aura AI Asistanı'),
        free: t('premium_feature_aura_free', '2 soru / gün'),
        premium: t('premium_feature_aura_premium', '8 soru / gün (4x limit)')
      }
    ],
    [t]
  );

  const STEPS = useMemo(
    () => [
      { id: 1, label: t('step_plan', 'Plan ve Onay') },
      { id: 2, label: t('step_verification', 'Doğrulama') }
    ],
    [t]
  );

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [otpExpiresAtMs, setOtpExpiresAtMs] = useState(null);
  const [localEmails, setLocalEmails] = useState(null);
  const [fallbackAccepted, setFallbackAccepted] = useState(false);

  const { emails, fetchEmails } = useEmails();
  const { eWallet, refreshWallet } = useEWallet({ enabled: isOpen });
  const { data: quote, refetch: refetchQuote } = useQuery({
    queryKey: ['membership', 'quote'],
    queryFn: membershipService.getQuote,
    enabled: isOpen,
    staleTime: 0
  });
  const premiumPrice = quote?.price;
  const { requiredAgreements: agreements = [] } = useRequiredAgreements('ONLINE_PAYMENT', { enabled: isOpen });

  const {
    acceptedAgreements,
    onAgreementToggle,
    onRequiredAgreementsChange,
    areAllAgreementsAccepted,
    getAcceptedAgreementIds
  } = useAgreementsState();

  useEffect(() => {
    if (agreements && agreements.length > 0) {
      onRequiredAgreementsChange(agreements);
    }
  }, [agreements, onRequiredAgreementsChange]);

  const inboxMatch = useMemo(
    () =>
      findLatestOtpWithEmail(localEmails || emails, {
        emailType: EMAIL_TYPES.PAYMENT_VERIFICATION,
        maxScan: 16
      }),
    [emails, localEmails]
  );
  const suggestedFromInbox = inboxMatch?.code;
  const suggestedEmail = inboxMatch?.email;

  const {
    formatted: otpTtlFormatted,
    isExpired: otpTtlExpired,
    active: otpTtlActive
  } = useOtpValidityCountdown(step === 2 ? otpExpiresAtMs : null);

  useEffect(() => {
    if (isOpen) {
      refreshWallet();
      refetchQuote();
      setStep(1);
      setError(null);
      setVerificationCode('');
      setOtpExpiresAtMs(null);
      setLocalEmails(null);
      setFallbackAccepted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (step !== 2) {
      setVerificationCode('');
      setOtpExpiresAtMs(null);
      setError(null);
    }
  }, [step]);

  const canAfford = quote?.sufficientBalance === true;

  const sendVerificationCode = async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now() - 3000;
    try {
      const verification = await orderService.initiatePaymentVerification({
        transactionType: 'MEMBERSHIP_PAYMENT'
      });
      const res = await fetchEmails(startTime);
      setLocalEmails(res);
      setOtpExpiresAtMs(new Date(verification.expiresAt).getTime());
      setStep(2);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        t('verification_code_send_failed', 'Doğrulama kodu gönderilemedi.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    const code = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH);
    if (otpTtlExpired) {
      setError(t('code_expired_request_new', 'Doğrulama kodunun süresi doldu. Geri dönüp yeni kod isteyin.'));
      return;
    }
    if (code.length !== OTP_CODE_LENGTH) {
      setError(t('enter_6_digit_code', '6 haneli doğrulama kodunu girin.'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await membershipService.upgradeToPremium({
        agreementsAccepted: agreements?.length > 0 ? areAllAgreementsAccepted() : fallbackAccepted,
        acceptedAgreementIds: getAcceptedAgreementIds(),
        verificationCode: code
      });
      try {
        const updatedProfile = await authService.getCurrentUser();
        if (updatedProfile) {
          updateUser(updatedProfile);
        }
      } catch {
        updateUser({ plan: 'PREMIUM' });
      }
      queryClient.invalidateQueries({ queryKey: ['membership'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      showSuccess(
        t('premium_membership', 'Premium Üyelik'),
        t('premium_membership_success', 'Premium planına başarıyla geçiş yaptınız!')
      );
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message ?? t('an_error_occurred', 'Bir hata oluştu.'));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    if (step === 1) {
      if (!canAfford) {
        setError(
          t(
            'insufficient_balance_please_topup',
            'Cüzdanınızda yeterli bakiye bulunmuyor. Devam etmek için lütfen cüzdanınıza bakiye yükleyin.'
          )
        );
        return;
      }
      sendVerificationCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, canAfford]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setError(null);
      setStep((s) => s - 1);
    } else onClose?.();
  }, [step, onClose]);

  const otpFilled = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH).length === OTP_CODE_LENGTH;

  const canGoNext = useCallback(() => {
    if (step === 1) {
      if (!quote) return false;
      if (agreements && agreements.length > 0) {
        return areAllAgreementsAccepted();
      }
      return fallbackAccepted;
    }
    return false;
  }, [step, quote, agreements, areAllAgreementsAccepted, fallbackAccepted]);

  const footer = (
    <>
      <Button variant="secondary" onClick={handleBack}>
        {step > 1 ? t('back_button', 'Geri') : t('cancel', 'İptal')}
      </Button>
      {step === 1 ? (
        <Button onClick={handleNext} disabled={loading || !canGoNext()}>
          {loading ? t('sending_progress', 'Gönderiliyor...') : t('continue_button', 'Devam Et')}
        </Button>
      ) : (
        <Button onClick={handleUpgrade} disabled={loading || !otpFilled || otpTtlExpired}>
          {loading
            ? t('processing_progress', 'İşleniyor...')
            : t('complete_payment', 'Ödemeyi Tamamla')}
        </Button>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('premium_membership', 'Premium Üyelik')}
      header={
        <PremiumUpgradeModalHeader
          featureHint={featureHint}
          steps={STEPS}
          step={step}
          onClose={onClose}
        />
      }
      footer={footer}
      size="lg"
    >
      {step === 1 && (
        <PremiumUpgradePlanStep
          premiumPrice={premiumPrice}
          features={FEATURES}
          agreements={agreements}
          acceptedAgreements={acceptedAgreements}
          onAgreementToggle={onAgreementToggle}
          fallbackAccepted={fallbackAccepted}
          onFallbackToggle={setFallbackAccepted}
        />
      )}

      {step === 2 && (
        <PremiumUpgradeVerificationStep
          otpTtlActive={otpTtlActive}
          otpTtlExpired={otpTtlExpired}
          otpTtlFormatted={otpTtlFormatted}
          walletBalance={eWallet?.balance}
          premiumPrice={premiumPrice}
          suggestedFromInbox={suggestedFromInbox}
          suggestedEmail={suggestedEmail}
          verificationCode={verificationCode}
          onChangeCode={setVerificationCode}
          loading={loading}
        />
      )}

      {error && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded border border-status-warning-border bg-status-warning-bg p-3 text-sm text-status-warning-text">
          <span>{error}</span>
          {!canAfford && (
            <a href={ROUTES.EWALLET} className="shrink-0 font-semibold underline hover:no-underline">
              {t('top_up_balance', 'Bakiye Yükle')}
            </a>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PremiumUpgradeModal;
