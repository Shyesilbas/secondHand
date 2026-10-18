import { Check, X, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from './Button.jsx';
import Modal from './Modal.jsx';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { membershipService } from '../../services/membershipService';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import { useRequiredAgreements } from '../../../agreements/hooks/useAgreements.js';
import { AGREEMENT_TYPE_LABELS } from '../../../agreements/agreements.js';
import { useAgreementsState } from '../../../payments/hooks/useListingPaymentFlow.js';
import OtpDigitInputGroup from '../../../payments/components/verification/OtpDigitInputGroup.jsx';
import OtpSuggestionBanner from '../../../payments/components/verification/OtpSuggestionBanner.jsx';
import { useOtpValidityCountdown } from '../../../payments/hooks/useOtpValidityCountdown.js';
import { OTP_CODE_LENGTH } from '../../constants/otp.js';
import { ROUTES } from '../../constants/routes.js';
import { orderService } from '../../../order/services/orderService.js';
import { useEmails } from '../../../payments/hooks/useEmails.js';
import { EMAIL_TYPES } from '../../../emails/emails.js';
import { sanitizeOtpInput, findLatestOtpWithEmail } from '../../../payments/utils/otp.js';
import { OTP_CODE_VALIDITY_SECONDS } from '../../../payments/paymentSchema.js';
import { useEWallet } from '../../../ewallet/hooks/useEWallet.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { authService } from '../../../auth/services/authService.js';

const PREMIUM_PRICE = 100;

const getAgreementLabel = (agreement) => {
  const type = agreement?.agreementType;
  if (type === 'DISTANCE_SELLING') return 'Mesafeli Satış Sözleşmesi';
  if (type === 'PAYMENT_TERMS') return 'Ödeme ve Üyelik Koşulları';
  if (type === 'TERMS_OF_SERVICE') return 'Kullanıcı Sözleşmesi';
  if (type === 'KVKK') return 'KVKK Aydınlatma Metni';
  if (type === 'PRIVACY_POLICY') return 'Gizlilik Politikası';
  return AGREEMENT_TYPE_LABELS[type] || agreement?.title || 'Üyelik Sözleşmesi';
};

const PremiumUpgradeModal = ({ isOpen, onClose, featureHint }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSuccess } = useNotification();
  const { updateUser } = useAuth();

  const FEATURES = useMemo(
    () => [
      {
        label: t('fast_shipping', 'Hızlı Teslimat'),
        free: '3 iş günü',
        premium: '1 iş günü (Ekspres kargo)',
      },
      {
        label: t('showcase_slot', 'Vitrin Yuvası'),
        free: '1 yuva',
        premium: '4 yuva (4x daha fazla alıcı)',
      },
      {
        label: t('aura_ai_message_limit', 'Aura AI Asistanı'),
        free: '2 soru / gün',
        premium: '8 soru / gün (4x limit)',
      },
    ],
    [t]
  );

  const STEPS = useMemo(
    () => [
      { id: 1, label: t('step_plan', 'Plan ve Onay') },
      { id: 2, label: t('step_verification', 'Doğrulama') },
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
  const { requiredAgreements: agreements = [] } = useRequiredAgreements('ONLINE_PAYMENT');

  const {
    acceptedAgreements,
    onAgreementToggle,
    onRequiredAgreementsChange,
    areAllAgreementsAccepted,
    getAcceptedAgreementIds,
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
        maxScan: 16,
      }),
    [emails, localEmails]
  );
  const suggestedFromInbox = inboxMatch?.code;
  const suggestedEmail = inboxMatch?.email;

  const {
    formatted: otpTtlFormatted,
    isExpired: otpTtlExpired,
    active: otpTtlActive,
  } = useOtpValidityCountdown(step === 2 ? otpExpiresAtMs : null);

  useEffect(() => {
    if (isOpen) {
      refreshWallet();
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

  const canAfford = Number(eWallet?.balance || 0) >= PREMIUM_PRICE;

  const sendVerificationCode = async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now() - 3000;
    try {
      await orderService.initiatePaymentVerification({
        transactionType: 'MEMBERSHIP_PAYMENT',
        amount: PREMIUM_PRICE,
      });
      const res = await fetchEmails(startTime);
      setLocalEmails(res);
      setOtpExpiresAtMs(Date.now() + OTP_CODE_VALIDITY_SECONDS * 1000);
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Doğrulama kodu gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    const code = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH);
    if (otpTtlExpired) {
      setError('Doğrulama kodunun süresi doldu. Geri dönüp yeni kod isteyin.');
      return;
    }
    if (code.length !== OTP_CODE_LENGTH) {
      setError('6 haneli doğrulama kodunu girin.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await membershipService.upgradeToPremium({
        agreementsAccepted: agreements?.length > 0 ? areAllAgreementsAccepted() : fallbackAccepted,
        acceptedAgreementIds: getAcceptedAgreementIds(),
        verificationCode: code,
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
      showSuccess('Premium Üyelik', 'Premium planına başarıyla geçiş yaptınız!');
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    if (step === 1) {
      if (!canAfford) {
        setError(t('insufficient_balance_please_topup', 'Cüzdanınızda yeterli bakiye bulunmuyor. Devam etmek için lütfen cüzdanınıza bakiye yükleyin.'));
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
      if (agreements && agreements.length > 0) {
        return areAllAgreementsAccepted();
      }
      return fallbackAccepted;
    }
    return false;
  }, [step, agreements, areAllAgreementsAccepted, fallbackAccepted]);

  const header = (
    <header className="border-b border-border-light px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary text-white">
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-text-primary">
                {t('premium_membership', 'Premium Üyelik')}
              </h2>
              <span className="rounded-sm border border-border bg-background-secondary px-1.5 py-0.5 text-xs font-semibold text-text-primary">
                PRO
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              {featureHint ?? t('access_all_features', 'Ayrıcalıklı teslimat, vitrin ve AI gücü')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close', 'Kapat')}
          className="rounded p-1.5 text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus cursor-pointer"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <ol className="mt-3.5 flex items-center gap-3 border-t border-border-light/60 pt-3 text-xs">
        {STEPS.map(({ id, label }, index) => (
          <li
            key={id}
            className="flex items-center gap-2"
            aria-current={step === id ? 'step' : undefined}
          >
            {index > 0 && <span className="h-px w-6 bg-border" aria-hidden />}
            <span
              className={`inline-flex items-center gap-1.5 tabular-nums ${
                step === id
                  ? 'font-semibold text-text-primary'
                  : step > id
                  ? 'text-text-secondary'
                  : 'text-text-tertiary'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  step === id
                    ? 'bg-primary font-medium text-white'
                    : step > id
                    ? 'bg-background-tertiary text-text-secondary'
                    : 'bg-background-secondary text-text-tertiary'
                }`}
              >
                {id}
              </span>
              <span>{label}</span>
            </span>
          </li>
        ))}
      </ol>
    </header>
  );

  const footer = (
    <>
      <Button variant="secondary" onClick={handleBack}>
        {step > 1 ? t('back_button', 'Geri') : t('cancel', 'İptal')}
      </Button>
      {step === 1 ? (
        <Button onClick={handleNext} disabled={loading || !canGoNext()}>
          {loading
            ? t('sending_progress', 'Gönderiliyor...')
            : t('continue_button', 'Devam Et')}
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
      header={header}
      footer={footer}
      size="lg"
    >
      {step === 1 && (
        <div className="space-y-4 py-1">
          {/* Plan Pricing Banner */}
          <div className="flex items-center justify-between rounded border border-border-light bg-background-secondary p-4">
            <div>
              <span className="text-sm font-semibold text-text-primary">
                {t('premium_plan_title', 'PRO Üyelik Planı')}
              </span>
              <p className="mt-0.5 text-xs text-text-muted">
                {t('auto_renews_monthly', 'Aylık yenilenir, dilediğiniz an tek tıkla iptal edilebilir.')}
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-text-primary">
                ₺{PREMIUM_PRICE}
              </span>
              <span className="text-xs font-normal text-text-tertiary">
                / {t('per_month', 'ay')}
              </span>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="overflow-hidden rounded border border-border-light bg-background-primary">
            <div className="grid grid-cols-12 border-b border-border-light bg-background-secondary/70 px-4 py-2.5 text-xs font-semibold">
              <div className="col-span-5 text-text-secondary">
                {t('privileges', 'Ayrıcalık')}
              </div>
              <div className="col-span-3 text-text-muted">
                {t('standard', 'Standart')}
              </div>
              <div className="col-span-4 flex items-center gap-1.5 text-text-primary">
                <Sparkles className="h-3.5 w-3.5 text-text-secondary" />
                <span>{t('pro_membership', 'PRO Plan')}</span>
              </div>
            </div>

            <div className="divide-y divide-border-light/60 text-xs">
              {FEATURES.map((feature) => (
                <div
                  key={feature.label}
                  className="grid grid-cols-12 items-center px-4 py-3 transition-colors hover:bg-background-secondary/30"
                >
                  <div className="col-span-5 pr-2 font-medium text-text-primary">
                    {feature.label}
                  </div>
                  <div className="col-span-3 text-text-muted tabular-nums">
                    {feature.free}
                  </div>
                  <div className="col-span-4 flex items-center gap-1.5 font-semibold tabular-nums text-text-primary">
                    <Check className="h-3.5 w-3.5 shrink-0 text-status-success" strokeWidth={2} />
                    <span>{feature.premium}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agreement Checkboxes */}
          <div className="space-y-2 border-t border-border-light pt-3">
            {agreements && agreements.length > 0 ? (
              agreements.map((agreement) => {
                const isChecked = acceptedAgreements.has(agreement.agreementId);
                return (
                  <label
                    key={agreement.agreementId}
                    className="flex items-start gap-2.5 text-xs text-text-secondary cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onAgreementToggle(agreement.agreementId)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary shrink-0 cursor-pointer"
                    />
                    <span className="leading-snug">
                      <span className="font-medium text-text-primary">{getAgreementLabel(agreement)}</span>
                      {' şartlarını okudum ve kabul ediyorum.'}
                    </span>
                  </label>
                );
              })
            ) : (
              <label className="flex items-start gap-2.5 text-xs text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fallbackAccepted}
                  onChange={(e) => setFallbackAccepted(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary shrink-0 cursor-pointer"
                />
                <span className="leading-snug">
                  <span className="font-medium text-text-primary">Mesafeli Satış ve PRO Üyelik Koşulları</span>
                  {' metnini okudum ve onaylıyorum.'}
                </span>
              </label>
            )}
          </div>

          <p className="text-center text-xs text-text-tertiary">
            {t('cancel_anytime_note', 'Dilediğiniz an tek tıkla iptal edebilirsiniz · Taahhüt yoktur')}
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-medium text-text-primary">{t('email_verification')}</h3>
            <p className="mt-1 text-sm text-text-secondary">
              {t(
                'enter_verification_code_sent_to_email',
                'E-postanıza gönderilen {{length}} haneli kodu girerek ödemeyi tamamlayın.',
                { length: OTP_CODE_LENGTH }
              )}
            </p>
            {otpTtlActive && (
              <p
                className={`mt-1 text-sm tabular-nums ${
                  otpTtlExpired ? 'text-status-warning-text' : 'text-text-tertiary'
                }`}
              >
                {otpTtlExpired
                  ? t('code_expired_request_new')
                  : `${t('validity_label')}: ${otpTtlFormatted}`}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-y border-border-light py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">{t('premium_membership')}</p>
              <p className="text-sm tabular-nums text-text-secondary">
                {t('my_ewallet')}: {Number(eWallet?.balance || 0).toFixed(2)}₺
              </p>
            </div>
            <span className="text-lg font-semibold tabular-nums text-text-primary">
              ₺{PREMIUM_PRICE}
            </span>
          </div>

          {suggestedFromInbox && (
            <OtpSuggestionBanner
              suggestedCode={suggestedFromInbox}
              sourceEmail={suggestedEmail}
              onApply={setVerificationCode}
            />
          )}

          <OtpDigitInputGroup
            value={verificationCode}
            onChange={setVerificationCode}
            dataSlotPrefix="premium-otp"
            disabled={loading || otpTtlExpired}
          />
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded border border-status-warning-border bg-status-warning-bg p-3 text-xs text-status-warning-text">
          <span>{error}</span>
          {!canAfford && (
            <a
              href={ROUTES.EWALLET}
              className="shrink-0 font-semibold underline hover:no-underline"
            >
              {t('top_up_balance', 'Bakiye Yükle')}
            </a>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PremiumUpgradeModal;
