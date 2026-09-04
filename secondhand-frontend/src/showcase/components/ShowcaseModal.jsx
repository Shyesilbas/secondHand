import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap, 
  ShieldCheck, 
  X, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Crown,
  Loader2,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Lock,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const PRESET_DURATIONS = [
  { days: 7, label: '7 Gün', badge: null },
  { days: 14, label: '14 Gün', badge: 'Popüler' },
  { days: 21, label: '21 Gün', badge: null },
  { days: 30, label: '30 Gün', badge: 'En Avantajlı' }
];

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
  const { plan, maxShowcaseSlots } = usePlan();
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

  const [isCheckingLimit, setIsCheckingLimit] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [activeShowcaseCount, setActiveShowcaseCount] = useState(0);

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
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isExtension) {
      setLimitExceeded(false);
      return;
    }

    let isMounted = true;
    setIsCheckingLimit(true);

    showcaseService.getUserShowcases()
      .then(showcases => {
        if (!isMounted) return;
        const activeList = Array.isArray(showcases) 
          ? showcases.filter(s => s.status === 'ACTIVE') 
          : [];
        const count = activeList.length;
        setActiveShowcaseCount(count);

        if (count >= maxShowcaseSlots) {
          setLimitExceeded(true);
        } else {
          setLimitExceeded(false);
        }
      })
      .catch(() => {
        if (isMounted) setLimitExceeded(false);
      })
      .finally(() => {
        if (isMounted) setIsCheckingLimit(false);
      });

    return () => { isMounted = false; };
  }, [isOpen, isExtension, maxShowcaseSlots]);

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

      try {
        window.dispatchEvent(new Event('showcases:refresh'));
      } catch {}

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

  const renderStep1 = () => (
    <div className="space-y-6">
      {(listing || listingTitle) && (
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
            {listing?.images?.[0] ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Zap className="w-5 h-5 text-slate-900 fill-current" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-full uppercase tracking-wider mb-0.5">
              <TrendingUp className="w-3 h-3" /> Vitrine Çıkacak İlan
            </span>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
              {listing?.title || listingTitle}
            </h4>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-700" /> Vitrin Süresi Seçin
          </label>
          <span className="text-xs font-semibold text-slate-500">
            {days} Gün Seçildi
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESET_DURATIONS.map(opt => {
            const isSelected = days === opt.days;
            return (
              <button
                key={opt.days}
                type="button"
                onClick={() => setDays(opt.days)}
                className={`relative p-3.5 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/15 ring-2 ring-slate-900/10'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-sm font-extrabold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {opt.days} Gün
                  </span>
                  {opt.badge && (
                    <span className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded-full ${
                      isSelected 
                        ? 'bg-amber-400 text-slate-950' 
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {opt.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-bold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {showcasePricing ? `₺${(showcasePricing.totalDailyCost * opt.days).toFixed(0)}` : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200">
        <div>
          <h5 className="text-xs font-bold text-slate-900">Farklı bir gün mü istiyorsunuz?</h5>
          <p className="text-[11px] text-slate-500 font-medium">1 ile 30 gün arasında dilediğiniz süreyi girin.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 border border-slate-200 shadow-xs shrink-0">
          <input
            type="number"
            min="1"
            max="30"
            value={days}
            onChange={handleDaysChange}
            className="w-12 bg-transparent text-sm font-extrabold text-slate-900 focus:outline-none text-right"
          />
          <span className="text-xs font-bold text-slate-400">Gün</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100/80 text-indigo-900 text-xs font-semibold">
          <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>10x Daha Fazla Ziyaret</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/80 text-amber-900 text-xs font-semibold">
          <Crown className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Altın Vitrin Rozeti</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100/80 text-emerald-900 text-xs font-semibold">
          <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Aramada En Üst Sıra</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ödenecek Tutar</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">₺{totalCost.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-500">({days} Günlük KDV Dahil)</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
        >
          Devam Et: Ödeme Özeti <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setCurrentStep(1);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Süre / Paket Değiştir
        </button>
        <span className="text-xs font-bold text-slate-500">
          Seçim: <strong className="text-slate-900">{days} Gün</strong>
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>İlan Başlığı:</span>
          <span className="font-extrabold text-slate-900 truncate max-w-[280px]">{listing?.title || listingTitle}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Vitrin Süresi:</span>
          <span className="font-bold text-slate-900">{days} Gün</span>
        </div>
        {showcasePricing && (
          <>
            <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200/60">
              <span>Birim Günlük Ücret:</span>
              <span className="font-medium text-slate-800">₺{showcasePricing.dailyCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Ara Toplam:</span>
              <span className="font-medium text-slate-800">₺{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>KDV (%{showcasePricing.taxPercentage}):</span>
              <span className="font-medium text-slate-800">₺{calculateTax().toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-slate-900">
          <span className="font-bold text-xs uppercase tracking-wider">Toplam Ödenecek:</span>
          <span className="text-lg font-black text-slate-900">₺{totalCost.toFixed(2)}</span>
        </div>
      </div>

      <div className={`p-4 rounded-2xl border transition-all ${
        hasEnoughBalance ? 'bg-white border-slate-200 shadow-xs' : 'bg-rose-50/50 border-rose-200'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
              hasEnoughBalance ? 'bg-slate-900' : 'bg-rose-600'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">E-Cüzdan ile Ödeme</h4>
              <p className="text-xs font-medium text-slate-500">
                Mevcut Bakiye: <strong className="text-slate-800">₺{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </p>
            </div>
          </div>

          {hasEnoughBalance && (
            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-400 block">Kalan Bakiye</span>
              <span className="text-xs font-extrabold text-emerald-700">
                ₺{(balance - totalCost).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {!hasEnoughBalance && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-100/70 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Bakiyeniz yetersiz. Lütfen devam etmeden önce bakiye yükleyin.</span>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-1">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Yasal Onaylar
        </label>
        <PaymentAgreementsSection 
          acceptedAgreements={acceptedAgreements} 
          onToggle={onAgreementToggle} 
          onRequiredAgreementsChange={onRequiredAgreementsChange} 
        />
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleRequestVerificationCode}
        disabled={loading || !hasEnoughBalance || !areAllAgreementsAccepted()}
        className="w-full py-4 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" /> Doğrulama Kodu Gönderiliyor...
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" /> Doğrulama Kodunu Gönder ve İlerle <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setCurrentStep(2);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Onay Adımına Dön
        </button>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Son Adım
        </span>
      </div>

      <div className="text-center py-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-2.5 text-slate-900 shadow-xs">
          <Lock className="w-6 h-6" />
        </div>
        <h4 className="text-base font-extrabold text-slate-900">Güvenlik Doğrulama Kodu</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
          İşlemi onaylamak için e-posta adresinize gönderilen 6 haneli kodu girin.
        </p>
        {otpTtlActive && (
          <span className="inline-block mt-2.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-800">
            Kalan Süre: {otpTtlFormatted}
          </span>
        )}
      </div>

      <div className="max-w-xs mx-auto">
        <OtpDigitInputGroup
          length={OTP_CODE_LENGTH}
          value={verificationCode}
          onChange={setVerificationCode}
          disabled={loading}
          error={error}
          label="Doğrulama Kodu"
          onComplete={() => {}}
        />
      </div>

      {suggestedFromInbox && (
        <div className="max-w-sm mx-auto">
          <OtpSuggestionBanner 
            suggestedCode={suggestedFromInbox} 
            onApply={setVerificationCode} 
          />
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 font-bold flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleFinalizePayment}
        disabled={loading || !otpFilled || otpTtlExpired}
        className="w-full py-4 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" /> Ödeme Tamamlanıyor...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300 fill-current" /> Vitrine Çıkar (₺{totalCost.toFixed(2)})
          </>
        )}
      </button>
    </div>
  );

  const renderModalContent = () => {
    if (showSuccessNotification) return null;

    if (isCheckingLimit || isListingLoading) {
      return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
            </div>
            <p className="text-xs font-extrabold text-slate-900">Vitrin Hakları Kontrol Ediliyor...</p>
          </div>
        </div>
      );
    }

    if (limitExceeded && !isExtension) {
      return (
        <AnimatePresence>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center"
            >
              <div className="w-14 h-14 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-700 shadow-xs">
                <Crown className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-2">Vitrin Limitine Ulaştınız</h3>
              <p className="text-xs text-slate-600 font-medium mb-6 leading-relaxed">
                Mevcut <strong className="text-slate-900">{plan}</strong> planınız maksimum <strong className="text-slate-900">{maxShowcaseSlots} vitrin ilanına</strong> izin vermektedir (Şu an aktif: {activeShowcaseCount}). Daha fazla ilan öne çıkarmak için planınızı yükseltebilirsiniz.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={onClose}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  onClick={() => {
                    setUpgradeHint(`Planınız (${plan}) vitrin limitine ulaştı.`);
                    setShowUpgradeModal(true);
                  }}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Crown className="w-4 h-4" /> Plan Yükselt
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      );
    }

    if (!listingId || listingError || !listing) {
      return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-slate-200">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-sm font-extrabold text-slate-900 mb-1">{t("something_went_wrong")}</h2>
            <p className="text-xs text-slate-500 mb-6">{listingError || 'İlan bulunamadı.'}</p>
            <button 
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer" 
              onClick={onClose}
            >
              {t("close")}
            </button>
          </div>
        </div>
      );
    }

    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
          >
            <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10 shrink-0">
                  <Zap className="w-5 h-5 fill-current text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {isExtension ? 'Vitrin Süresini Uzat' : 'İlanı Vitrine Çıkar'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {currentStep === 1 && 'Süre ve avantaj seçimi'}
                    {currentStep === 2 && 'Ödeme özeti ve yasal onaylar'}
                    {currentStep === 3 && 'SMS/E-posta ile güvenli doğrulama'}
                  </p>
                </div>
              </div>

              <button 
                onClick={onClose} 
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 sm:px-8 pt-4 pb-2">
              <div className="flex items-center gap-2">
                {[
                  { step: 1, label: '1. Süre Seçimi' },
                  { step: 2, label: '2. Onay & Bakiye' },
                  { step: 3, label: '3. Doğrulama' }
                ].map(item => {
                  const isActive = currentStep === item.step;
                  const isDone = currentStep > item.step;
                  return (
                    <div key={item.step} className="flex-1">
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${
                        isActive || isDone ? 'bg-slate-900' : 'bg-slate-100'
                      }`} />
                      <span className={`text-[10px] font-bold mt-1.5 block ${
                        isActive ? 'text-slate-900' : isDone ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
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

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ShowcaseModal;