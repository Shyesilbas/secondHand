import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useListingData } from '../../listing/hooks/useListingData.js';
import PaymentAgreementsSection from '../../payments/components/PaymentAgreementsSection.jsx';
import { useAgreementsState } from '../../payments/hooks/useListingPaymentFlow.js';
import ShowcaseSuccessModal from './ShowcaseSuccessModal.jsx';
import ShowcasePayment from './ShowcasePayment.jsx';
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
  AlertCircle
} from 'lucide-react';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';

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
  const [step, setStep] = useState(1);
  const [days, setDays] = useState(initialDays);
  const [allAgreementsAccepted, setAllAgreementsAccepted] = useState(false);
  const [requiredAgreements, setRequiredAgreements] = useState([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successSummary, setSuccessSummary] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeHint, setUpgradeHint] = useState('');
  const showcasePaymentRef = useRef(null);

  const { enums, isLoading: isPricingLoading } = useEnums();
  const {
    acceptedAgreements,
    onAgreementToggle,
    onRequiredAgreementsChange,
    areAllAgreementsAccepted,
    getAcceptedAgreementIds
  } = useAgreementsState();

  const { listing, isLoading: isListingLoading, error: listingError } = useListingData(listingId, isOpen);

  const showcasePricing = enums?.showcasePricingConfig;

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

  const handleAgreementsChange = useCallback(agreements => {
    setRequiredAgreements(agreements);
    onRequiredAgreementsChange(agreements);
  }, [onRequiredAgreementsChange]);

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
          className="space-y-6"
        >
          {/* Target Listing Info Box */}
          {(listing || listingTitle) && (
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-border-light">
              {listing?.images?.[0] ? (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title} 
                  className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider mb-0.5">
                  <TrendingUp className="w-3 h-3" /> Vitrin Yapılacak İlan
                </span>
                <p className="text-sm font-bold text-text-primary truncate">
                  {listing?.title || listingTitle}
                </p>
              </div>
            </div>
          )}

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" /> Vitrin Süresi Seçin
              </label>
              {showcasePricing && (
                <span className="text-xs font-medium text-slate-400">
                  Günlük {showcasePricing.totalDailyCost.toFixed(2)}₺
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              {PRESET_DURATIONS.map(opt => {
                const isSelected = days === opt.days;
                return (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setDays(opt.days)}
                    className={`relative p-3.5 rounded-2xl text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 border ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-lg shadow-indigo-500/25 scale-[1.02]'
                        : 'bg-background-primary text-slate-700 border-border-light hover:border-primary/50 hover:bg-slate-50'
                    }`}
                  >
                    {opt.badge && (
                      <span className={`absolute -top-2.5 px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm ${
                        isSelected 
                          ? 'bg-amber-400 text-slate-900' 
                          : 'bg-primary text-white'
                      }`}>
                        {opt.badge}
                      </span>
                    )}
                    <span className={`text-lg font-extrabold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {opt.days} Gün
                    </span>
                    <span className={`text-[11px] font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {showcasePricing ? `${(showcasePricing.totalDailyCost * opt.days).toFixed(0)}₺` : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Days Input */}
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-border-light">
              <span className="text-xs font-semibold text-slate-600 shrink-0">
                Özel Süre (Gün):
              </span>
              <input
                type="number"
                min="1"
                max="30"
                value={days}
                onChange={handleDaysChange}
                className="flex-1 bg-transparent text-sm font-extrabold text-slate-900 focus:outline-none w-0 text-right font-mono"
              />
              <span className="text-xs font-bold text-primary shrink-0">
                Gün
              </span>
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="rounded-2xl border border-border-light bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-border-light">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Ücret Özeti
              </span>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                %{showcasePricing?.taxPercentage || 20} KDV Dahil
              </span>
            </div>

            {showcasePricing ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Ara Toplam ({days} Gün)</span>
                  <span className="font-mono font-semibold">{calculateSubtotal().toFixed(2)}₺</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>KDV (%{showcasePricing.taxPercentage})</span>
                  <span className="font-mono font-semibold">{calculateTax().toFixed(2)}₺</span>
                </div>
                <div className="pt-2.5 border-t border-border-light flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-slate-900">Toplam Ödenecek</span>
                    <p className="text-[11px] text-slate-400">E-Cüzdan bakiyenizden tahsil edilir</p>
                  </div>
                  <span className="text-2xl font-black font-mono text-primary tracking-tight">
                    {totalCost.toFixed(2)}₺
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-bold text-slate-900">Toplam Ödenecek</span>
                <span className="text-2xl font-black font-mono text-primary">
                  {totalCost.toFixed(2)}₺
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
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <p className="text-xs text-slate-700 font-medium">
              Vitrin ödeme işlemini gerçekleştirmeden önce lütfen aşağıdaki sözleşme ve bilgilendirmeleri onaylayın.
            </p>
          </div>

          <div className="rounded-2xl border border-border-light bg-background-primary p-4">
            <PaymentAgreementsSection 
              acceptedAgreements={acceptedAgreements} 
              onToggle={onAgreementToggle} 
              onRequiredAgreementsChange={handleAgreementsChange} 
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
            if (error.response?.data?.error === 'SHOWCASE_SLOT_LIMIT_EXCEEDED') {
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
  }, [step, days, showcasePricing, calculateSubtotal, calculateTax, totalCost, listingId, listing, listingTitle, onSuccess, onClose, acceptedAgreements, onAgreementToggle, getAcceptedAgreementIds, handleDaysChange, onRequiredAgreementsChange, isExtension, showcaseId]);

  if (!isOpen && !showSuccessNotification) return null;

  const successTitle = successSummary?.title ?? listing?.title ?? listingTitle;
  const successDays = successSummary?.days ?? days;

  const renderModalContent = () => {
    if (showSuccessNotification) return null;

    if (isListingLoading) {
      return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background-primary rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-border-light">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-700">İlan Bilgileri Yükleniyor...</p>
          </div>
        </div>
      );
    }

    if (!listingId || listingError || !listing) {
      return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background-primary rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-border-light">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-base font-bold text-text-primary mb-1">{t("something_went_wrong")}</h2>
            <p className="text-xs text-slate-500 mb-6">{listingError || 'İlan bulunamadı.'}</p>
            <button 
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors" 
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 md:p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-background-primary rounded-3xl shadow-2xl border border-border-light overflow-hidden flex flex-col max-h-[90vh] my-auto"
          >
            {/* Header */}
            <div className="relative px-6 py-5 border-b border-border-light bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-text-primary tracking-tight">
                    {isExtension ? 'Vitrin Süresini Uzat' : 'İlanı Vitrine Çıkar'}
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    {isExtension ? 'Mevcut vitrin sürenizi uzatın' : 'İlanınızı aramalarda öne çıkarın'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="px-6 py-3.5 bg-slate-50/60 border-b border-border-light shrink-0">
              <div className="flex items-center justify-between relative">
                {/* Background Connecting Line */}
                <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 z-0" />
                {/* Active Animated Connecting Line */}
                <motion.div 
                  className="absolute left-6 top-4 h-0.5 bg-primary z-0" 
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
                            ? 'bg-primary text-white shadow-md shadow-indigo-500/20' 
                            : isActive 
                            ? 'bg-primary text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/30 scale-110' 
                            : 'bg-background-primary border-2 border-border-light text-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-[11px] font-bold ${isActive ? 'text-primary' : isDone ? 'text-slate-600' : 'text-slate-400'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Body Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 bg-background-primary">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="px-6 py-4 border-t border-border-light bg-slate-50 flex items-center justify-between shrink-0">
              <button 
                type="button"
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200/70 transition-all flex items-center gap-1.5"
                onClick={handlePrevStep}
              >
                {step > 1 ? <><ArrowLeft className="w-3.5 h-3.5" /> Geri</> : 'Vazgeç'}
              </button>

              {step < 3 && (
                <button 
                  type="button"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-1.5"
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