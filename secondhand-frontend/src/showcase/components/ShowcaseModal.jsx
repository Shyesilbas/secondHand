import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useMyShowcases } from '../hooks/useMyShowcases.js';
import Modal from '../../common/components/ui/Modal.jsx';
import Button from '../../common/components/ui/Button.jsx';
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
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Package
} from 'lucide-react';

const PRESET_DURATIONS = [
  { days: 7, badge: null },
  { days: 14, badge: 'Popüler' },
  { days: 21, badge: null },
  { days: 30, badge: 'En Avantajlı' }
];

const STEPS = [
  { step: 1, label: '1. Süre Seçimi', hint: 'Süre ve avantaj seçimi' },
  { step: 2, label: '2. Onay & Bakiye', hint: 'Ödeme özeti ve yasal onaylar' },
  { step: 3, label: '3. Doğrulama', hint: 'SMS/E-posta ile güvenli doğrulama' }
];

const ErrorLine = ({ children }) => (
  <p className="flex items-center gap-2 text-sm text-status-error-text" role="alert">
    <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
    <span>{children}</span>
  </p>
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
  const { user } = useAuthState();
  const { plan, maxShowcaseSlots } = usePlan();
  const { showcases, isLoading: isCheckingLimit, refresh: refreshShowcases } = useMyShowcases(user?.id);
  const { eWallet, refreshWallet } = useEWallet();
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
    () => (Array.isArray(showcases) ? showcases.filter(s => s.status === 'ACTIVE').length : 0),
    [showcases]
  );
  const limitExceeded = !isExtension && activeShowcaseCount >= maxShowcaseSlots;

  const { enums } = useEnums();
  const {
    acceptedAgreements,
    onAgreementToggle,
    onRequiredAgreementsChange,
    areAllAgreementsAccepted,
    getAcceptedAgreementIds
  } = useAgreementsState();

  const { listing, isLoading: isListingLoading, error: listingError } = useListingData(listingId, isOpen);
  const showcasePricing = enums?.showcasePricingConfig;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setError(null);
      setVerificationCode('');
      setOtpExpiresAtMs(null);
      refreshWallet();
    }
  }, [isOpen, refreshWallet]);

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

  const suggestedFromInbox = useMemo(() => findLatestOtpFromEmails(localEmails || emails, {
    emailType: EMAIL_TYPES.PAYMENT_VERIFICATION,
    maxScan: 16
  }), [emails, localEmails]);

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

  const otpFilled = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH).length === OTP_CODE_LENGTH;

  const handleDaysChange = useCallback(e => {
    const val = parseInt(e.target.value, 10);
    setDays(isNaN(val) ? 1 : Math.max(1, Math.min(30, val)));
  }, []);

  const handleRequestVerificationCode = async () => {
    if (!hasEnoughBalance) {
      setError('E-Cüzdan bakiyeniz bu işlem için yetersiz.');
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
      setOtpExpiresAtMs(Date.now() + OTP_CODE_VALIDITY_SECONDS * 1000);
      setCurrentStep(3);
    } catch (err) {
      setError(getErrorMessage(err, 'Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.'));
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizePayment = async () => {
    const code = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH);
    if (otpTtlExpired) {
      setError('Doğrulama kodunun süresi doldu. Lütfen geri dönüp yeni kod isteyin.');
      return;
    }
    if (code.length !== OTP_CODE_LENGTH) {
      setError('Lütfen 6 haneli doğrulama kodunu eksiksiz girin.');
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

      setSuccessSummary({
        title: listing?.title || listingTitle,
        days,
        pricePaid: totalCost.toFixed(2)
      });
      setShowSuccessNotification(true);
      onSuccess?.();
    } catch (err) {
      if (err.response?.data?.error === 'SHOWCASE_SLOT_LIMIT_EXCEEDED' || err.errorCode === 'SHOWCASE_SLOT_LIMIT_EXCEEDED') {
        setShowUpgradeModal(true);
        setUpgradeHint('Showcase slot limitinize ulaştınız.');
        return;
      }
      setError(getErrorMessage(err, 'Ödeme tamamlanamadı.'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !showSuccessNotification) return null;

  const successTitle = successSummary?.title ?? listing?.title ?? listingTitle;
  const successDays = successSummary?.days ?? days;
  const successPricePaid = successSummary?.pricePaid ?? totalCost.toFixed(2);

  const backTo = (step) => {
    setError(null);
    setCurrentStep(step);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {(listing || listingTitle) && (
        <div className="flex items-center gap-3 rounded border border-border-light p-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-border-light bg-background-secondary">
            {listing?.images?.[0] ? (
              <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-sm text-text-tertiary">Vitrine Çıkacak İlan</span>
            <h4 className="truncate text-sm font-medium text-text-primary">{listing?.title || listingTitle}</h4>
          </div>
        </div>
      )}

      <fieldset>
        <div className="mb-3 flex items-center justify-between">
          <legend className="text-sm font-medium text-text-primary">Vitrin Süresi Seçin</legend>
          <span className="text-sm tabular-nums text-text-tertiary">{days} Gün Seçildi</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRESET_DURATIONS.map(opt => {
            const isSelected = days === opt.days;
            return (
              <button
                key={opt.days}
                type="button"
                onClick={() => setDays(opt.days)}
                aria-pressed={isSelected}
                className={`flex flex-col justify-between rounded border p-3 text-left transition-colors duration-150 ${
                  isSelected ? 'border-primary bg-primary text-white' : 'border-border bg-background-primary text-text-primary hover:border-card-border-hover'
                }`}
              >
                <span className="text-sm font-semibold tabular-nums">{opt.days} Gün</span>
                <span className={`mt-1 text-sm tabular-nums ${isSelected ? 'text-white/80' : 'text-text-tertiary'}`}>
                  {showcasePricing ? `₺${(showcasePricing.totalDailyCost * opt.days).toFixed(0)}` : ''}
                </span>
                {opt.badge && <span className={`mt-1 text-xs ${isSelected ? 'text-white/80' : 'text-text-tertiary'}`}>{opt.badge}</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-4 rounded border border-border-light px-4 py-3">
        <div>
          <label htmlFor="showcase-days" className="text-sm font-medium text-text-primary">Farklı bir gün mü istiyorsunuz?</label>
          <p className="text-sm text-text-secondary">1 ile 30 gün arasında dilediğiniz süreyi girin.</p>
        </div>
        <div className="flex h-10 shrink-0 items-center gap-1.5 rounded border border-border px-3">
          <input id="showcase-days" type="number" min="1" max="30" value={days} onChange={handleDaysChange} className="w-12 bg-transparent text-right text-sm tabular-nums text-text-primary focus:outline-none" />
          <span className="text-sm text-text-tertiary">Gün</span>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2 text-sm text-text-secondary sm:grid-cols-3">
        <li>10x Daha Fazla Ziyaret</li>
        <li>Altın Vitrin Rozeti</li>
        <li>Aramada En Üst Sıra</li>
      </ul>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-border-light pt-4 sm:flex-row">
        <div>
          <span className="block text-sm text-text-tertiary">Ödenecek Tutar</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-text-primary">₺{totalCost.toFixed(2)}</span>
            <span className="text-sm text-text-tertiary">({days} Günlük KDV Dahil)</span>
          </div>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setCurrentStep(2)}>
          Devam Et: Ödeme Özeti <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-light pb-2">
        <Button variant="ghost" size="sm" onClick={() => backTo(1)}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Süre / Paket Değiştir
        </Button>
        <span className="text-sm text-text-tertiary">Seçim: <span className="font-medium text-text-primary">{days} Gün</span></span>
      </div>

      <dl className="divide-y divide-border-light rounded border border-border-light px-4 text-sm">
        <div className="flex justify-between gap-4 py-2"><dt className="text-text-secondary">İlan Başlığı</dt><dd className="max-w-xs truncate font-medium text-text-primary">{listing?.title || listingTitle}</dd></div>
        <div className="flex justify-between gap-4 py-2"><dt className="text-text-secondary">Vitrin Süresi</dt><dd className="font-medium tabular-nums text-text-primary">{days} Gün</dd></div>
        {showcasePricing && (
          <>
            <div className="flex justify-between gap-4 py-2"><dt className="text-text-secondary">Birim Günlük Ücret</dt><dd className="tabular-nums text-text-primary">₺{showcasePricing.dailyCost.toFixed(2)}</dd></div>
            <div className="flex justify-between gap-4 py-2"><dt className="text-text-secondary">Ara Toplam</dt><dd className="tabular-nums text-text-primary">₺{calculateSubtotal().toFixed(2)}</dd></div>
            <div className="flex justify-between gap-4 py-2"><dt className="text-text-secondary">KDV (%{showcasePricing.taxPercentage})</dt><dd className="tabular-nums text-text-primary">₺{calculateTax().toFixed(2)}</dd></div>
          </>
        )}
        <div className="flex items-baseline justify-between gap-4 py-2"><dt className="font-medium text-text-primary">Toplam Ödenecek</dt><dd className="text-lg font-semibold tabular-nums text-text-primary">₺{totalCost.toFixed(2)}</dd></div>
      </dl>

      <div className="rounded border border-border-light p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-medium text-text-primary">E-Cüzdan ile Ödeme</h4>
            <p className="text-sm text-text-secondary">
              Mevcut Bakiye: <span className="font-medium tabular-nums text-text-primary">₺{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
          </div>
          {hasEnoughBalance && (
            <div className="text-right">
              <span className="block text-sm text-text-tertiary">Kalan Bakiye</span>
              <span className="text-sm font-medium tabular-nums text-text-primary">
                ₺{(balance - totalCost).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
        {!hasEnoughBalance && <div className="mt-3"><ErrorLine>Bakiyeniz yetersiz. Lütfen devam etmeden önce bakiye yükleyin.</ErrorLine></div>}
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium text-text-primary">Yasal Onaylar</span>
        <PaymentAgreementsSection acceptedAgreements={acceptedAgreements} onToggle={onAgreementToggle} onRequiredAgreementsChange={onRequiredAgreementsChange} />
      </div>

      {error && <ErrorLine>{error}</ErrorLine>}

      <Button className="w-full" onClick={handleRequestVerificationCode} disabled={loading || !hasEnoughBalance || !areAllAgreementsAccepted()}>
        {loading ? 'Doğrulama Kodu Gönderiliyor...' : 'Doğrulama Kodunu Gönder ve İlerle'}
      </Button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-light pb-2">
        <Button variant="ghost" size="sm" onClick={() => backTo(2)}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Onay Adımına Dön
        </Button>
        <span className="text-sm text-text-tertiary">Son Adım</span>
      </div>

      <div className="py-2 text-center">
        <h4 className="text-lg font-semibold text-text-primary">Güvenlik Doğrulama Kodu</h4>
        <p className="mx-auto mt-1 max-w-sm text-sm text-text-secondary">İşlemi onaylamak için e-posta adresinize gönderilen 6 haneli kodu girin.</p>
        {otpTtlActive && <p className="mt-2 text-sm tabular-nums text-text-tertiary">Kalan Süre: {otpTtlFormatted}</p>}
      </div>

      <div className="mx-auto max-w-xs">
        <OtpDigitInputGroup length={OTP_CODE_LENGTH} value={verificationCode} onChange={setVerificationCode} disabled={loading} error={error} label="Doğrulama Kodu" onComplete={() => {}} />
      </div>

      {suggestedFromInbox && (
        <div className="mx-auto max-w-sm">
          <OtpSuggestionBanner suggestedCode={suggestedFromInbox} onApply={setVerificationCode} />
        </div>
      )}

      {error && <div className="flex justify-center"><ErrorLine>{error}</ErrorLine></div>}

      <Button className="w-full" onClick={handleFinalizePayment} disabled={loading || !otpFilled || otpTtlExpired}>
        {loading ? 'Ödeme Tamamlanıyor...' : `Vitrine Çıkar (₺${totalCost.toFixed(2)})`}
      </Button>
    </div>
  );

  const title = isExtension ? 'Vitrin Süresini Uzat' : 'İlanı Vitrine Çıkar';

  const renderModalContent = () => {
    if (showSuccessNotification) return null;

    if (isCheckingLimit || isListingLoading) {
      return (
        <Modal isOpen onClose={onClose} title={title} size="sm">
          <p className="py-6 text-center text-sm text-text-secondary" role="status">Vitrin Hakları Kontrol Ediliyor...</p>
        </Modal>
      );
    }

    if (limitExceeded) {
      return (
        <Modal
          isOpen
          onClose={onClose}
          title="Vitrin Limitine Ulaştınız"
          size="sm"
          footer={<>
            <Button variant="secondary" onClick={onClose}>Vazgeç</Button>
            <Button onClick={() => {
              setUpgradeHint(`Planınız (${plan}) vitrin limitine ulaştı.`);
              setShowUpgradeModal(true);
            }}>Plan Yükselt</Button>
          </>}
        >
          <p className="text-sm leading-relaxed text-text-secondary">
            Mevcut <span className="font-medium text-text-primary">{plan}</span> planınız maksimum <span className="font-medium text-text-primary">{maxShowcaseSlots} vitrin ilanına</span> izin vermektedir (Şu an aktif: {activeShowcaseCount}). Daha fazla ilan öne çıkarmak için planınızı yükseltebilirsiniz.
          </p>
        </Modal>
      );
    }

    if (!listingId || listingError || !listing) {
      return (
        <Modal isOpen onClose={onClose} title={t("something_went_wrong")} size="sm" footer={<Button variant="secondary" onClick={onClose}>{t("close")}</Button>}>
          <p className="text-sm text-text-secondary">{listingError || 'İlan bulunamadı.'}</p>
        </Modal>
      );
    }

    return (
      <Modal isOpen onClose={onClose} title={title} size="lg">
        <p className="-mt-1 mb-4 text-sm text-text-secondary">{STEPS[currentStep - 1].hint}</p>
        <ol className="mb-6 flex items-center gap-2">
          {STEPS.map(item => {
            const isActive = currentStep === item.step;
            const isDone = currentStep > item.step;
            return (
              <li key={item.step} className="flex-1" aria-current={isActive ? 'step' : undefined}>
                <div className={`h-1 rounded-sm ${isActive || isDone ? 'bg-primary' : 'bg-background-tertiary'}`} />
                <span className={`mt-1.5 block text-sm ${isActive ? 'font-medium text-text-primary' : isDone ? 'text-text-secondary' : 'text-text-muted'}`}>{item.label}</span>
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

  const modalContent = (
    <>
      {isOpen ? renderModalContent() : null}
      {showSuccessNotification && (
        <ShowcaseSuccessModal 
          isOpen={showSuccessNotification} 
          onClose={() => {
            setShowSuccessNotification(false);
            setSuccessSummary(null);
            onClose?.();
          }} 
          listingId={listingId}
          listingTitle={successTitle}
          days={successDays}
          pricePaid={successPricePaid}
          isExtension={isExtension}
          listingImage={listing?.images?.[0] || null}
        />
      )}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureHint={upgradeHint}
      />
    </>
  );

  return modalContent;
};

export default ShowcaseModal;