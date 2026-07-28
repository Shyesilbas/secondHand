import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useListingData } from '../../listing/hooks/useListingData.js';
import { usePlan } from '../../common/hooks/usePlan.js';
import { showcaseService } from '../services/showcaseService.js';
import PaymentAgreementsSection from '../../payments/components/PaymentAgreementsSection.jsx';
import { useAgreementsState } from '../../payments/hooks/useListingPaymentFlow.js';
import ShowcaseSuccessModal from './ShowcaseSuccessModal.jsx';
import ShowcasePayment from './ShowcasePayment.jsx';
import PremiumUpgradeModal from '../../common/components/ui/PremiumUpgradeModal.jsx';
import { 
  Zap, 
  ShieldCheck, 
  X, 
  Check, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CreditCard, 
  ArrowLeft, 
  ChevronRight,
  AlertCircle,
  Crown,
  Loader2
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Süre Seçimi', icon: Zap },
  { id: 2, label: 'Sözleşmeler', icon: ShieldCheck },
  { id: 3, label: 'Ödeme', icon: CreditCard }
];

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
  const { plan, isPremium, maxShowcaseSlots } = usePlan();

  const [step, setStep] = useState(1);
  const [days, setDays] = useState(initialDays);
  const [allAgreementsAccepted, setAllAgreementsAccepted] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successSummary, setSuccessSummary] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeHint, setUpgradeHint] = useState('');

  // Limit Pre-Check State
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [activeShowcaseCount, setActiveShowcaseCount] = useState(0);

  const showcasePaymentRef = useRef(null);

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

  // Pre-check showcase limit before making user fill steps
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

  useEffect(() => {
    if (!isOpen) return;
    setShowSuccessNotification(false);
    setSuccessSummary(null);
    setStep(1);
  }, [isOpen]);

  useEffect(() => {
    setAllAgreementsAccepted(areAllAgreementsAccepted());
  }, [areAllAgreementsAccepted]);

  const handleDaysChange = useCallback(e => {
    const val = parseInt(e.target.value, 10);
    setDays(isNaN(val) ? 1 : Math.max(1, Math.min(30, val)));
  }, []);

  const handleNextStep = useCallback(() => {
    if (step < 3) setStep(s => s + 1);
  }, [step]);

  const handlePrevStep = useCallback(() => {
    if (step === 3 && showcasePaymentRef.current?.consumeModalBack?.()) return;
    if (step > 1) setStep(s => s - 1);
    else onClose();
  }, [step, onClose]);

  const renderStepContent = useCallback(() => {
    if (step === 1) {
      return (
        <motion.div 
          key="step-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {/* Target Listing Info Box */}
          {(listing || listingTitle) && (
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              {listing?.images?.[0] ? (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title} 
                  className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider mb-0.5">
                  <TrendingUp className="w-3 h-3" /> Vitrine Çıkarılacak İlan
                </span>
                <p className="text-xs font-black text-slate-900 truncate">
                  {listing?.title || listingTitle}
                </p>
              </div>
            </div>
          )}

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> Vitrin Süresi Seçin
              </label>
              {showcasePricing && (
                <span className="text-xs font-bold text-slate-500">
                  Günlük ₺{showcasePricing.totalDailyCost.toFixed(2)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
              {PRESET_DURATIONS.map(opt => {
                const isSelected = days === opt.days;
                return (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setDays(opt.days)}
                    className={`relative p-3.5 rounded-2xl text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-500/60 hover:bg-slate-50'
                    }`}
                  >
                    {opt.badge && (
                      <span className={`absolute -top-2.5 px-2 py-0.5 text-[10px] font-extrabold rounded-full shadow-xs ${
                        isSelected 
                          ? 'bg-amber-400 text-slate-950' 
                          : 'bg-slate-900 text-white'
                      }`}>
                        {opt.badge}
                      </span>
                    )}
                    <span className={`text-base font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {opt.days} Gün
                    </span>
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {showcasePricing ? `₺${(showcasePricing.totalDailyCost * opt.days).toFixed(0)}` : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Days Input */}
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200">
              <span className="text-xs font-bold text-slate-600 shrink-0">
                Özel Süre Belirle:
              </span>
              <input
                type="number"
                min="1"
                max="30"
                value={days}
                onChange={handleDaysChange}
                className="flex-1 bg-transparent text-sm font-extrabold text-slate-900 focus:outline-none w-0 text-right font-mono"
              />
              <span className="text-xs font-black text-emerald-600 shrink-0">
                Gün
              </span>
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Ücret Detayı
              </span>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                %{showcasePricing?.taxPercentage || 20} KDV Dahil
              </span>
            </div>

            {showcasePricing ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Ara Toplam ({days} Gün)</span>
                  <span className="font-mono font-bold text-slate-900">₺{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>KDV (%{showcasePricing.taxPercentage})</span>
                  <span className="font-mono font-bold text-slate-900">₺{calculateTax().toFixed(2)}</span>
                </div>
                <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black text-slate-900">Toplam Ödenecek Tutarlı</span>
                    <p className="text-[11px] text-slate-500 font-medium">Cüzdan bakiyenizden düşülür</p>
                  </div>
                  <span className="text-2xl font-black font-mono text-emerald-700 tracking-tight">
                    ₺{totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-black text-slate-900">Toplam Tutarlı</span>
                <span className="text-2xl font-black font-mono text-emerald-700">
                  ₺{totalCost.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    if (step === 2) {
      return (
        <motion.div 
          key="step-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <p className="text-xs text-emerald-900 font-bold">
              Ödemeye geçmeden önce lütfen hizmet sözleşmelerini inceleyip onaylayın.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <PaymentAgreementsSection 
              acceptedAgreements={acceptedAgreements} 
              onToggle={onAgreementToggle} 
              onRequiredAgreementsChange={onRequiredAgreementsChange} 
            />
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="step-3"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
      >
        <ShowcasePayment 
          ref={showcasePaymentRef} 
          embedded 
          listingId={listingId} 
          listingTitle={listing?.title || listingTitle} 
          days={days} 
          totalCost={totalCost} 
          showcasePricing={showcasePricing} 
          calculateSubtotal={calculateSubtotal} 
          calculateTax={calculateTax} 
          onSuccess={() => {
            setSuccessSummary({
              title: listing?.title || listingTitle,
              days
            });
            setShowSuccessNotification(true);
            onSuccess?.();
          }} 
          onError={(error) => {
            if (error.response?.data?.error === 'SHOWCASE_SLOT_LIMIT_EXCEEDED' || error.errorCode === 'SHOWCASE_SLOT_LIMIT_EXCEEDED') {
              setShowUpgradeModal(true);
              setUpgradeHint('Showcase slot limitinize ulaştınız.');
              return true;
            }
            return false;
          }} 
          onClose={onClose} 
          acceptedAgreements={acceptedAgreements} 
          getAcceptedAgreementIds={getAcceptedAgreementIds} 
          isExtension={isExtension} 
          showcaseId={showcaseId} 
        />
      </motion.div>
    );
  }, [step, days, showcasePricing, calculateSubtotal, calculateTax, totalCost, listingId, listing, listingTitle, onSuccess, onClose, acceptedAgreements, onAgreementToggle, onRequiredAgreementsChange, isExtension, showcaseId]);

  if (!isOpen && !showSuccessNotification) return null;

  const successTitle = successSummary?.title ?? listing?.title ?? listingTitle;
  const successDays = successSummary?.days ?? days;

  const renderModalContent = () => {
    if (showSuccessNotification) return null;

    // Limit Pre-Check Loading
    if (isCheckingLimit || isListingLoading) {
      return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            </div>
            <p className="text-xs font-black text-slate-900">Vitrin Hakları Kontrol Ediliyor...</p>
          </div>
        </div>
      );
    }

    // Limit Pre-Check Warning View (UX+: Pre-check before 3 steps)
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
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-2">Vitrin Limitine Ulaştınız</h3>
              <p className="text-xs text-slate-600 font-medium mb-6 leading-relaxed">
                Mevcut <strong className="text-slate-900">{plan}</strong> planınız maksimum <strong className="text-emerald-700">{maxShowcaseSlots} vitrin ilanına</strong> izin vermektedir (Şu an aktif: {activeShowcaseCount}). Daha fazla ilan öne çıkarmak için planınızı yükseltebilirsiniz.
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
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Crown className="w-4 h-4" />
                  Plan Yükselt
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
            <h2 className="text-sm font-black text-slate-900 mb-1">{t("something_went_wrong", "Bir Hata Oluştu")}</h2>
            <p className="text-xs text-slate-500 mb-6">{listingError || 'İlan bulunamadı.'}</p>
            <button 
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer" 
              onClick={onClose}
            >
              {t("close", "Kapat")}
            </button>
          </div>
        </div>
      );
    }

    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 md:p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto"
          >
            {/* Header */}
            <div className="relative px-6 py-4.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    {isExtension ? 'Vitrin Süresini Uzat' : 'İlanı Vitrine Çıkar'}
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    {isExtension ? 'Mevcut vitrin sürenizi uzatın' : 'İlanınızı aramalarda en üste çıkarın'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 transition-all flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="px-6 py-3.5 bg-slate-50/50 border-b border-slate-200 shrink-0">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 z-0" />
                <motion.div 
                  className="absolute left-6 top-4 h-0.5 bg-emerald-600 z-0" 
                  initial={false}
                  animate={{
                    width: `${((step - 1) / (STEPS.length - 1)) * 82}%`
                  }}
                  transition={{ duration: 0.3 }}
                />

                {STEPS.map(({ id, label, icon: Icon }) => {
                  const isDone = step > id;
                  const isActive = step === id;
                  return (
                    <div key={id} className="flex flex-col items-center gap-1 z-10">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          isDone 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : isActive 
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/20 shadow-md scale-105' 
                            : 'bg-white border-2 border-slate-200 text-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-[11px] font-extrabold ${isActive ? 'text-emerald-700' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Body Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 bg-white">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <button 
                type="button"
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200/70 transition-all flex items-center gap-1.5 cursor-pointer"
                onClick={handlePrevStep}
              >
                {step > 1 ? <><ArrowLeft className="w-3.5 h-3.5" /> Geri</> : 'Vazgeç'}
              </button>

              {step < 3 && (
                <button 
                  type="button"
                  className="px-6 py-2.5 rounded-xl font-extrabold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-1.5 cursor-pointer"
                  onClick={handleNextStep}
                  disabled={
                    (step === 1 && (days < 1 || days > 30)) || 
                    (step === 2 && !allAgreementsAccepted)
                  }
                >
                  {step === 1 ? <>Devam Et <ChevronRight className="w-3.5 h-3.5" /></> : <>Ödemeye Geç <ChevronRight className="w-3.5 h-3.5" /></>}
                </button>
              )}
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