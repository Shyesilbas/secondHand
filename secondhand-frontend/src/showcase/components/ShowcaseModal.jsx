import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useMyShowcases } from '../hooks/useMyShowcases.js';
import Modal from '../../common/components/ui/Modal.jsx';
import Button, { buttonClasses } from '../../common/components/ui/Button.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useListingData } from '../../listing/hooks/useListingData.js';
import { usePlan } from '../../common/hooks/usePlan.js';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';
import { useEmails } from '../../payments/hooks/useEmails.js';
import { orderService } from '../../order/services/orderService.js';
import { showcaseService } from '../services/showcaseService.js';
import PaymentAgreementsSection from '../../payments/components/PaymentAgreementsSection.jsx';
import { useAgreementsState } from '../../payments/hooks/useListingPaymentFlow.js';
import ShowcaseSuccessModal from './ShowcaseSuccessModal.jsx';
import PremiumUpgradeModal from '../../common/components/ui/PremiumUpgradeModal.jsx';
import OtpDigitInputGroup from '../../payments/components/verification/OtpDigitInputGroup.jsx';
import OtpSuggestionBanner from '../../payments/components/verification/OtpSuggestionBanner.jsx';
import { useOtpSuggestedToast } from '../../payments/hooks/useOtpSuggestedToast.js';
import { useOtpValidityCountdown } from '../../payments/hooks/useOtpValidityCountdown.js';
import { OTP_CODE_LENGTH, sanitizeOtpInput } from '../../common/constants/otp.js';
import { OTP_CODE_VALIDITY_SECONDS } from '../../payments/paymentSchema.js';
import { findLatestOtpFromEmails } from '../../payments/utils/otp.js';
import { EMAIL_TYPES } from '../../emails/emails.js';
import { getErrorMessage } from '../../common/utils/errorUtils.js';
import { formatCurrency } from '../../common/formatters.js';
import { ROUTES } from '../../common/constants/routes.js';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  Minus,
  Package,
  Plus,
  RotateCw,
  Search,
  Sparkles,
  Wallet
} from 'lucide-react';

const PRESET_DURATIONS = [
  { days: 7, badge: null, badgeKey: null },
  { days: 14, badge: 'Popüler', badgeKey: 'badge_popular' },
  { days: 21, badge: null, badgeKey: null },
  { days: 30, badge: 'Avantajlı', badgeKey: 'badge_advantageous' }
];

const STEPS = [
  { step: 1, label: 'Süre Seçimi', labelKey: 'step_duration_selection', hint: 'Vitrin süresini ve paketi belirleyin', hintKey: 'step_duration_hint' },
  { step: 2, label: 'Onay & Bakiye', labelKey: 'step_confirmation_balance', hint: 'Ödeme özetini ve sözleşmeleri onaylayın', hintKey: 'step_confirmation_hint' },
  { step: 3, label: 'Doğrulama', labelKey: 'step_verification', hint: 'E-posta adresinize gönderilen kodu girin', hintKey: 'step_verification_hint' }
];

const BENEFITS = [
  {
    icon: Search,
    title: 'Üst Sıra Görünürlüğü',
    titleKey: 'benefit_top_visibility_title',
    desc: 'Ana sayfa vitrininde ve arama sonuçlarında öncelikli gösterim',
    descKey: 'benefit_top_visibility_desc'
  },
  {
    icon: Eye,
    title: 'Daha Fazla Etkileşim',
    titleKey: 'benefit_more_engagement_title',
    desc: 'Standart ilanlara kıyasla daha yüksek görüntülenme ve mesaj oranı',
    descKey: 'benefit_more_engagement_desc'
  },
  {
    icon: Sparkles,
    title: 'Vitrin İşareti',
    titleKey: 'benefit_showcase_badge_title',
    desc: 'İlan kartında öne çıkarıldığını belirten vitrin etiketi',
    descKey: 'benefit_showcase_badge_desc'
  }
];

const ErrorLine = ({ children }) => (
  <div
    className="flex items-start gap-2 rounded border border-status-error-border bg-status-error-bg px-3.5 py-2.5 text-xs sm:text-sm text-status-error-text"
    role="alert"
  >
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
    <span>{children}</span>
  </div>
);

const ShowcaseModal = ({
  isOpen,
  onClose,
  listingId,
  listingTitle = '',
  onSuccess,
  isExtension = false,
  showcaseId = null,
  initialDays = 7
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthState();
  const { plan, maxShowcaseSlots } = usePlan({ enabled: isOpen });
  const { showcases, isLoading: isCheckingLimit, refresh: refreshShowcases } = useMyShowcases(
    user?.id,
    { enabled: isOpen }
  );
  const { eWallet, refreshWallet } = useEWallet({ enabled: isOpen });
  const { emails, fetchEmails } = useEmails();

  const [currentStep, setCurrentStep] = useState(1);
  const [days, setDays] = useState(initialDays);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successSummary, setSuccessSummary] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeHint, setUpgradeHint] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [otpExpiresAtMs, setOtpExpiresAtMs] = useState(null);
  const [localEmails, setLocalEmails] = useState(null);

  const activeShowcaseCount = useMemo(
    () => (Array.isArray(showcases) ? showcases.filter((s) => s.status === 'ACTIVE').length : 0),
    [showcases]
  );
  const limitExceeded = !isExtension && activeShowcaseCount >= maxShowcaseSlots;

  const { enums } = useEnums({ enabled: isOpen });
  const {
    acceptedAgreements,
    onAgreementToggle,
    onRequiredAgreementsChange,
    areAllAgreementsAccepted,
    getAcceptedAgreementIds
  } = useAgreementsState();

  const { listing, isLoading: isListingLoading, error: listingError } = useListingData(
    listingId,
    isOpen
  );
  const showcasePricing = enums?.showcasePricingConfig;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setDays(initialDays || 7);
      setError(null);
      setVerificationCode('');
      setOtpExpiresAtMs(null);
      refreshWallet();
    }
  }, [isOpen, initialDays, refreshWallet]);

  const calculateTotal = useCallback(() => {
    if (!showcasePricing) return 0;
    return showcasePricing.totalDailyCost * days;
  }, [showcasePricing, days]);

  const calculateSubtotal = useCallback(() => {
    if (!showcasePricing) return 0;
    return showcasePricing.dailyCost * days;
  }, [showcasePricing, days]);

  const calculateTax = useCallback(() => {
    if (!showcasePricing) return 0;
    return (showcasePricing.totalDailyCost - showcasePricing.dailyCost) * days;
  }, [showcasePricing, days]);

  const totalCost = useMemo(() => calculateTotal(), [calculateTotal]);
  const balance = Number(eWallet?.balance || 0);
  const hasEnoughBalance = balance >= totalCost;

  const suggestedFromInbox = useMemo(
    () =>
      findLatestOtpFromEmails(localEmails || emails, {
        emailType: EMAIL_TYPES.PAYMENT_VERIFICATION,
        maxScan: 16
      }),
    [emails, localEmails]
  );

  useOtpSuggestedToast({
    suggestedCode: suggestedFromInbox,
    enabled: currentStep === 3
  });

  const otpTtlExpiresAt = currentStep === 3 ? otpExpiresAtMs : null;
  const {
    formatted: otpTtlFormatted,
    isExpired: otpTtlExpired,
    active: otpTtlActive
  } = useOtpValidityCountdown(otpTtlExpiresAt);

  const otpFilled =
    sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH).length === OTP_CODE_LENGTH;

  const clampDays = (val) => Math.max(1, Math.min(30, val));

  const handleDaysChange = useCallback((e) => {
    const val = parseInt(e.target.value, 10);
    setDays(Number.isNaN(val) ? 1 : clampDays(val));
  }, []);

  const handleRequestVerificationCode = async () => {
    if (!hasEnoughBalance) {
      setError(t('insufficient_ewallet_balance', 'E-Cüzdan bakiyeniz bu işlem için yetersiz.'));
      return;
    }
    setLoading(true);
    setError(null);
    const startTime = Date.now() - 3000;
    try {
      await orderService.initiatePaymentVerification({
        transactionType: 'SHOWCASE_PAYMENT',
        listingId,
        days,
        amount: totalCost
      });
      const fetchedEmails = await fetchEmails(startTime);
      setLocalEmails(fetchedEmails);
      setVerificationCode('');
      setOtpExpiresAtMs(Date.now() + OTP_CODE_VALIDITY_SECONDS * 1000);
      setCurrentStep(3);
    } catch (err) {
      setError(getErrorMessage(err, t('verification_code_send_failed', 'Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.')));
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizePayment = async () => {
    const code = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH);
    if (otpTtlExpired) {
      setError(t('verification_code_expired', 'Doğrulama kodunun süresi doldu. Yeni kod göndererek tekrar deneyin.'));
      return;
    }
    if (code.length !== OTP_CODE_LENGTH) {
      setError(t('enter_full_verification_code', 'Lütfen 6 haneli doğrulama kodunu eksiksiz girin.'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const acceptedAgreementIds = getAcceptedAgreementIds ? getAcceptedAgreementIds() : [];
      if (isExtension && showcaseId) {
        const payload = {
          listingId,
          days,
          paymentType: 'EWALLET',
          providerName: 'EWALLET',
          verificationCode: code,
          agreementsAccepted: acceptedAgreements?.size > 0,
          acceptedAgreementIds,
          idempotencyKey: `extend-${listingId}-${days}-${Date.now()}`
        };
        await showcaseService.extendShowcase(showcaseId, payload);
      } else {
        await showcaseService.createShowcase(
          listingId,
          days,
          'EWALLET',
          code,
          acceptedAgreements?.size > 0,
          acceptedAgreementIds
        );
      }

      refreshShowcases();
      refreshWallet();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['showcases'] }),
        queryClient.invalidateQueries({ queryKey: ['myShowcases'] }),
        queryClient.invalidateQueries({ queryKey: ['listings'] })
      ]);

      setSuccessSummary({
        title: listing?.title || listingTitle,
        days,
        pricePaid: totalCost.toFixed(2)
      });
      setShowSuccessNotification(true);
    } catch (err) {
      if (
        err.response?.data?.error === 'SHOWCASE_SLOT_LIMIT_EXCEEDED' ||
        err.errorCode === 'SHOWCASE_SLOT_LIMIT_EXCEEDED'
      ) {
        setShowUpgradeModal(true);
        setUpgradeHint(t('showcase_slot_limit_reached', 'Vitrin slot limitinize ulaştınız.'));
        return;
      }
      setError(getErrorMessage(err, t('payment_failed', 'Ödeme tamamlanamadı.')));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !showSuccessNotification) return null;

  const resolvedTitle = listing?.title || listingTitle || t('promoted_listing', 'İlan');
  const resolvedImage = listing?.imageUrl || listing?.images?.[0] || null;
  const successTitle = successSummary?.title ?? resolvedTitle;
  const successDays = successSummary?.days ?? days;
  const successPricePaid = successSummary?.pricePaid ?? totalCost.toFixed(2);

  const backTo = (step) => {
    setError(null);
    setCurrentStep(step);
  };

  const renderListingPreviewStrip = () => (
    <div className="flex items-center justify-between gap-3 rounded border border-border-light bg-background-secondary/50 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded border border-border-light bg-background-primary">
          {resolvedImage ? (
            <img src={resolvedImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <Package className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <span className="block text-xs text-text-tertiary">
            {isExtension ? t('listing_to_extend', 'Süresi Uzatılacak İlan') : t('listing_to_promote', 'Vitrine Çıkacak İlan')}
          </span>
          <h4 className="truncate text-sm font-medium text-text-primary">{resolvedTitle}</h4>
        </div>
      </div>

      {listing?.listingNo && (
        <span className="shrink-0 rounded-sm border border-border-light bg-background-primary px-2 py-0.5 font-mono text-xs text-text-secondary">
          #{listing.listingNo}
        </span>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5">
      {renderListingPreviewStrip()}

      {/* Duration Presets */}
      <fieldset>
        <div className="mb-2.5 flex items-center justify-between">
          <legend className="text-xs font-semibold text-text-secondary">
            {t('preset_showcase_packages', 'Hazır Vitrin Paketleri')}
          </legend>
          {showcasePricing && (
            <span className="text-xs tabular-nums text-text-tertiary">
              {t('daily_price_with_vat', 'Günlük {{amount}} (KDV dahil)', { amount: formatCurrency(showcasePricing.totalDailyCost, 'TRY') })}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {PRESET_DURATIONS.map((opt) => {
            const isSelected = days === opt.days;
            const optionTotal = showcasePricing
              ? showcasePricing.totalDailyCost * opt.days
              : 0;

            return (
              <button
                key={opt.days}
                type="button"
                onClick={() => setDays(opt.days)}
                aria-pressed={isSelected}
                className={`relative flex flex-col justify-between rounded border p-3 text-left transition-colors duration-150 cursor-pointer ${isSelected
                    ? 'border-primary bg-background-secondary/80 ring-1 ring-primary'
                    : 'border-border-light bg-background-primary hover:border-border'
                  }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-sm font-semibold tabular-nums text-text-primary">
                    {t('days_count', { count: opt.days, defaultValue: '{{count}} Gün' })}
                  </span>
                  {isSelected ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
                    </span>
                  ) : opt.badge ? (
                    <span className="rounded-sm bg-background-secondary px-1.5 py-0.5 text-xs font-medium text-text-secondary">
                      {opt.badgeKey ? t(opt.badgeKey, opt.badge) : opt.badge}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3">
                  <span className="block text-base font-semibold tabular-nums text-text-primary">
                    {showcasePricing ? formatCurrency(optionTotal, 'TRY') : '—'}
                  </span>
                  <span className="mt-0.5 block text-xs text-text-tertiary">
                    {opt.badge && isSelected ? opt.badge : t('vat_included', 'KDV dahil')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Custom Days Stepper */}
      <div className="flex items-center justify-between gap-4 rounded border border-border-light px-3.5 py-2.5">
        <div className="min-w-0">
          <label
            htmlFor="showcase-days"
            className="block text-xs sm:text-sm font-medium text-text-primary"
          >
            {t('custom_duration', 'Özel Süre Belirle')}
          </label>
          <p className="text-xs text-text-tertiary">
            {t('custom_duration_hint', '1 ile 30 gün arasında dilediğiniz süreyi seçebilirsiniz')}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDays((d) => clampDays(d - 1))}
            disabled={days <= 1}
            aria-label={t('decrease_days', 'Günü azalt')}
            className="flex h-8 w-8 items-center justify-center rounded border border-border-light bg-background-primary text-text-secondary transition-colors hover:border-border hover:text-text-primary disabled:opacity-40 cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>

          <div className="flex h-8 items-center gap-1 rounded border border-border bg-background-primary px-2.5">
            <input
              id="showcase-days"
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={handleDaysChange}
              className="w-8 bg-transparent text-center text-sm font-semibold tabular-nums text-text-primary focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="text-xs text-text-tertiary">{t('days_short', 'gün')}</span>
          </div>

          <button
            type="button"
            onClick={() => setDays((d) => clampDays(d + 1))}
            disabled={days >= 30}
            aria-label={t('increase_days', 'Günü artır')}
            className="flex h-8 w-8 items-center justify-center rounded border border-border-light bg-background-primary text-text-secondary transition-colors hover:border-border hover:text-text-primary disabled:opacity-40 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Benefits Strip */}
      <div className="grid grid-cols-1 gap-2.5 border-t border-border-light pt-4 sm:grid-cols-3">
        {BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.titleKey || benefit.title}
              className="flex items-start gap-2.5 rounded border border-border-light bg-background-secondary/30 p-3"
            >
              <Icon
                className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary"
                strokeWidth={1.5}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-primary">{benefit.titleKey ? t(benefit.titleKey, benefit.title) : benefit.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-text-tertiary">
                  {benefit.descKey ? t(benefit.descKey, benefit.desc) : benefit.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 1 Footer */}
      <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border-light pt-4 sm:flex-row sm:items-center">
        <div>
          <span className="block text-xs text-text-tertiary">{t('total_amount_to_pay', 'Toplam Ödenecek Tutar')}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold tabular-nums text-text-primary">
              {formatCurrency(totalCost, 'TRY')}
            </span>
            <span className="text-xs text-text-tertiary">
              ({days} {t('days_short', 'gün')} · {t('vat_included', 'KDV dahil')})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t('cancel', 'Vazgeç')}
          </Button>
          <Button onClick={() => setCurrentStep(2)}>
            <span>{t('continue', 'Devam Et')}</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      {renderListingPreviewStrip()}

      {/* Price Breakdown */}
      <div>
        <h4 className="mb-2 text-xs font-semibold text-text-secondary">{t('fee_breakdown', 'Ücret Dökümü')}</h4>
        <dl className="divide-y divide-border-light rounded border border-border-light px-4 text-xs sm:text-sm">
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="text-text-secondary">{t('selected_showcase_duration', 'Seçilen Vitrin Süresi')}</dt>
            <dd className="font-medium tabular-nums text-text-primary">{days} {t('days_short', 'Gün')}</dd>
          </div>
          {showcasePricing && (
            <>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-text-secondary">{t('daily_unit_fee_excl_vat', 'Günlük Birim Ücret (KDV Hariç)')}</dt>
                <dd className="tabular-nums text-text-primary">
                  {formatCurrency(showcasePricing.dailyCost, 'TRY')}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-text-secondary">{t('subtotal', 'Ara Toplam')}</dt>
                <dd className="tabular-nums text-text-primary">
                  {formatCurrency(calculateSubtotal(), 'TRY')}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-text-secondary">KDV (%{showcasePricing.taxPercentage})</dt>
                <dd className="tabular-nums text-text-primary">
                  {formatCurrency(calculateTax(), 'TRY')}
                </dd>
              </div>
            </>
          )}
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="font-semibold text-text-primary">{t('grand_total', 'Genel Toplam')}</dt>
            <dd className="text-base font-semibold tabular-nums text-text-primary">
              {formatCurrency(totalCost, 'TRY')}
            </dd>
          </div>
        </dl>
      </div>

      {/* E-Wallet Balance Card */}
      <div>
        <h4 className="mb-2 text-xs font-semibold text-text-secondary">{t('payment_method', 'Ödeme Yöntemi')}</h4>
        <div className="rounded border border-border-light bg-background-secondary/30 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border-light bg-background-primary text-text-secondary">
                <Wallet className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">{t('ewallet_balance', 'E-Cüzdan Bakiyesi')}</span>
                  <span className="inline-flex items-center gap-1 rounded-sm border border-border-light bg-background-primary px-1.5 py-0.5 text-xs font-medium text-text-secondary">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${hasEnoughBalance ? 'bg-status-success' : 'bg-status-error'
                        }`}
                      aria-hidden
                    />
                    <span>{hasEnoughBalance ? t('sufficient', 'Yeterli') : t('insufficient_balance', 'Yetersiz Bakiye')}</span>
                  </span>
                </div>
                <p className="mt-0.5 text-xs tabular-nums text-text-secondary">
                  {t('current_label', 'Mevcut')}: <span className="font-medium text-text-primary">{formatCurrency(balance, 'TRY')}</span>
                  {hasEnoughBalance && (
                    <>
                      {' · '}{t('after_transaction_remaining', 'İşlem sonrası kalan')}:{' '}
                      <span className="font-medium text-text-primary">
                        {formatCurrency(balance - totalCost, 'TRY')}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {!hasEnoughBalance && (
              <Link
                to={ROUTES.EWALLET}
                onClick={onClose}
                className={buttonClasses('secondary', 'sm')}
              >
                <span>{t('load_balance', 'Bakiye Yükle')}</span>
              </Link>
            )}
          </div>

          {!hasEnoughBalance && (
            <p className="mt-2.5 border-t border-border-light pt-2.5 text-xs text-status-error-text">
              {t('insufficient_balance_needed', {
                defaultValue: 'Bu işlem için {{amount}} ek bakiyeye ihtiyacınız var.',
                amount: formatCurrency(totalCost - balance, 'TRY')
              })}
            </p>
          )}
        </div>
      </div>

      {/* Agreements */}
      <div>
        <PaymentAgreementsSection
          acceptedAgreements={acceptedAgreements}
          onToggle={onAgreementToggle}
          onRequiredAgreementsChange={onRequiredAgreementsChange}
        />
      </div>

      {error && <ErrorLine>{error}</ErrorLine>}

      {/* Step 2 Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-border-light pt-4">
        <Button variant="secondary" onClick={() => backTo(1)} disabled={loading}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          <span>{t('change_duration', 'Süreyi Değiştir')}</span>
        </Button>

        <Button
          onClick={handleRequestVerificationCode}
          disabled={loading || !hasEnoughBalance || !areAllAgreementsAccepted()}
        >
          <span>
            {loading ? t('sending_code', 'Kod Gönderiliyor…') : t('send_verification_code', 'Doğrulama Kodu Gönder')}
          </span>
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      {/* Compact Transaction Summary Bar */}
      <div className="flex items-center justify-between gap-3 rounded border border-border-light bg-background-secondary/50 px-3.5 py-2.5 text-xs sm:text-sm">
        <span className="truncate font-medium text-text-primary">
          {resolvedTitle} · <span className="tabular-nums text-text-secondary">{days} {t('showcase_days', 'Gün Vitrin')}</span>
        </span>
        <span className="shrink-0 font-semibold tabular-nums text-text-primary">
          {formatCurrency(totalCost, 'TRY')}
        </span>
      </div>

      <div className="py-1 text-center">
        <h4 className="text-base font-semibold text-text-primary">
          {t('security_verification_code', 'Güvenlik Doğrulama Kodu')}
        </h4>
        <p className="mx-auto mt-1 max-w-sm text-xs sm:text-sm text-text-secondary">
          {t('enter_6_digit_code_to_complete_payment', 'Ödemeyi tamamlamak için e-posta adresinize gönderilen 6 haneli doğrulama kodunu girin.')}
        </p>

        <div className="mt-2.5 flex items-center justify-center gap-3 text-xs">
          {otpTtlActive && (
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border-light bg-background-secondary px-2 py-0.5 font-medium tabular-nums text-text-secondary">
              <span>{t('time_remaining_label', 'Kalan Süre')}: {otpTtlFormatted}</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleRequestVerificationCode}
            disabled={loading}
            className="inline-flex items-center gap-1 font-medium text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className="h-3 w-3" strokeWidth={1.5} aria-hidden />
            <span>{t('send_new_code', 'Yeni Kod Gönder')}</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-xs">
        <OtpDigitInputGroup
          length={OTP_CODE_LENGTH}
          value={verificationCode}
          onChange={setVerificationCode}
          disabled={loading}
          error={error}
          label={t('verification_code', 'Doğrulama Kodu')}
          onComplete={() => { }}
        />
      </div>

      {suggestedFromInbox && (
        <div className="mx-auto max-w-sm">
          <OtpSuggestionBanner
            suggestedCode={suggestedFromInbox}
            onApply={setVerificationCode}
          />
        </div>
      )}

      {error && <ErrorLine>{error}</ErrorLine>}

      {/* Step 3 Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-border-light pt-4">
        <Button variant="secondary" onClick={() => backTo(2)} disabled={loading}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          <span>{t('back', 'Geri')}</span>
        </Button>

        <Button
          onClick={handleFinalizePayment}
          disabled={loading || !otpFilled || otpTtlExpired}
        >
          <span>
            {loading
              ? t('payment_processing', 'Ödeme Tamamlanıyor…')
              : t('confirm_payment_with_amount', 'Ödemeyi Onayla ({{amount}})', { amount: formatCurrency(totalCost, 'TRY') })}
          </span>
        </Button>
      </div>
    </div>
  );

  const title = isExtension ? t('extend_showcase_title', 'Vitrin Süresini Uzat') : t('promote_to_showcase_title', 'İlanı Vitrine Çıkar');

  const renderModalContent = () => {
    if (showSuccessNotification) return null;

    if (isCheckingLimit || isListingLoading) {
      return (
        <Modal isOpen onClose={onClose} title={title} size="md">
          <div className="space-y-4 py-2" aria-busy="true">
            <Skeleton className="h-14 w-full" />
            <div className="grid grid-cols-4 gap-2.5">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </Modal>
      );
    }

    if (limitExceeded) {
      return (
        <Modal
          isOpen
          onClose={onClose}
          title={t('showcase_limit_reached', 'Vitrin Limitine Ulaştınız')}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={onClose}>
                {t('cancel', 'Vazgeç')}
              </Button>
              <Button
                onClick={() => {
                  setUpgradeHint(t('plan_reached_showcase_limit', { defaultValue: 'Planınız ({{plan}}) vitrin limitine ulaştı.', plan }));
                  setShowUpgradeModal(true);
                }}
              >
                {t('upgrade_plan', 'Planı Yükselt')}
              </Button>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-text-secondary">
            {t('upgrade_plan_showcase_limit_desc', {
              defaultValue: 'Mevcut {{plan}} planınız aynı anda en fazla {{max}} aktif vitrin ilanına izin vermektedir (Şu an aktif: {{current}}). Daha fazla ilanı vitrine çıkarmak için üyelik planınızı yükseltebilirsiniz.',
              plan,
              max: maxShowcaseSlots,
              current: activeShowcaseCount
            })}
          </p>
        </Modal>
      );
    }

    if (!listingId || listingError || !listing) {
      return (
        <Modal
          isOpen
          onClose={onClose}
          title={t('something_went_wrong', 'Bir Sorun Oluştu')}
          size="sm"
          footer={
            <Button variant="secondary" onClick={onClose}>
              {t('close', 'Kapat')}
            </Button>
          }
        >
          <p className="text-sm text-text-secondary">
            {listingError || t('failed_to_load_listing_info', 'İlan bilgileri yüklenemedi.')}
          </p>
        </Modal>
      );
    }

    return (
      <Modal
        isOpen
        onClose={onClose}
        title={title}
        description={t(STEPS[currentStep - 1].hintKey, STEPS[currentStep - 1].hint)}
        size="lg"
      >
        {/* Clean Stepper Bar */}
        <ol className="mb-5 grid grid-cols-3 gap-2 border-b border-border-light pb-4">
          {STEPS.map((item) => {
            const isActive = currentStep === item.step;
            const isDone = currentStep > item.step;
            return (
              <li
                key={item.step}
                aria-current={isActive ? 'step' : undefined}
                className="min-w-0"
              >
                <div
                  className={`h-1 rounded-sm transition-colors ${isActive || isDone ? 'bg-primary' : 'bg-background-tertiary'
                    }`}
                />
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${isDone
                        ? 'bg-primary text-white'
                        : isActive
                          ? 'border border-primary text-text-primary'
                          : 'border border-border text-text-muted'
                      }`}
                  >
                    {isDone ? <Check className="h-2.5 w-2.5" strokeWidth={2} /> : item.step}
                  </span>
                  <span
                    className={`truncate text-xs ${isActive
                        ? 'font-semibold text-text-primary'
                        : isDone
                          ? 'font-medium text-text-secondary'
                          : 'text-text-muted'
                      }`}
                  >
                    {t(item.labelKey, item.label)}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </Modal>
    );
  };

  return (
    <>
      {isOpen ? renderModalContent() : null}
      {showSuccessNotification && (
        <ShowcaseSuccessModal
          isOpen={showSuccessNotification}
          onClose={() => {
            setShowSuccessNotification(false);
            setSuccessSummary(null);
            onSuccess?.();
            onClose?.();
          }}
          listingId={listingId}
          listingTitle={successTitle}
          days={successDays}
          pricePaid={successPricePaid}
          isExtension={isExtension}
          listingImage={resolvedImage}
        />
      )}
      {showUpgradeModal && (
        <PremiumUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          featureHint={upgradeHint}
        />
      )}
    </>
  );
};

export default ShowcaseModal;
