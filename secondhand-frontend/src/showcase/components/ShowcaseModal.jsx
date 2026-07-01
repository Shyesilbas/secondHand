import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useListingData } from '../../listing/hooks/useListingData.js';
import PaymentAgreementsSection from '../../payments/components/PaymentAgreementsSection.jsx';
import { useAgreementsState } from '../../payments/hooks/useListingPaymentFlow.js';
import NotificationModal from '../../notification/NotificationModal.jsx';
import ShowcasePayment from './ShowcasePayment.jsx';
import { Zap, ShieldCheck, X, Check } from 'lucide-react';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
const STEPS = [{
  id: 1,
  label: 'Duration',
  icon: Zap
}, {
  id: 2,
  label: 'Agreements',
  icon: ShieldCheck
}, {
  id: 3,
  label: 'Payment',
  icon: Check
}];
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
  const {
    t
  } = useTranslation();
  const [step, setStep] = useState(1);
  const [days, setDays] = useState(initialDays);
  const [allAgreementsAccepted, setAllAgreementsAccepted] = useState(false);
  const [requiredAgreements, setRequiredAgreements] = useState([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successSummary, setSuccessSummary] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeHint, setUpgradeHint] = useState('');
  const showcasePaymentRef = useRef(null);
  const {
    enums,
    isLoading: isPricingLoading
  } = useEnums();
  const {
    acceptedAgreements,
    onAgreementToggle,
    onRequiredAgreementsChange,
    areAllAgreementsAccepted,
    getAcceptedAgreementIds
  } = useAgreementsState();
  const {
    listing,
    isLoading: isListingLoading,
    error: listingError
  } = useListingData(listingId, isOpen);
  const showcasePricing = enums.showcasePricingConfig;
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
  }, [isOpen]);
  useEffect(() => {
    setAllAgreementsAccepted(areAllAgreementsAccepted());
  }, [areAllAgreementsAccepted]);
  const handleDaysChange = useCallback(e => {
    setDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)));
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
    if (step > 1) setStep(s => s - 1);else onClose();
  }, [step, onClose]);
  const renderStepContent = useCallback(() => {
    if (step === 1) {
      const durationOptions = [7, 14, 21, 30];
      return <div className="space-y-6">
                    {/* Duration picker */}
                    <div>
                        <p className="text-body font-semibold text-slate-500 uppercase tracking-widest mb-3">{t("choose_duration")}</p>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {durationOptions.map(opt => <button key={opt} type="button" onClick={() => setDays(opt)} className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 ${days === opt ? 'bg-primary text-white shadow-lg shadow-indigo-500/25 scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    {opt}{t("d")}</button>)}
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-border-light">
                            <span className="text-body text-slate-500 font-medium shrink-0">{t("custom_days")}</span>
                            <input type="number" min="1" max="30" value={days} onChange={handleDaysChange} className="flex-1 bg-transparent text-sm font-bold text-slate-800 focus:outline-none w-0" />
                            {showcasePricing && <span className="text-caption text-slate-400 shrink-0">
                                    {showcasePricing.dailyCost}{t("day")}</span>}
                        </div>
                    </div>

                    {/* Pricing summary */}
                    {showcasePricing && <div className="rounded-2xl border border-border-light overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 border-b border-border-light">
                                <p className="text-caption font-bold text-slate-400 uppercase tracking-widest">{t("price_summary")}</p>
                            </div>
                            <div className="px-4 py-4 space-y-2.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t("subtotal")} ({days} {t("day")}{days !== 1 ? 's' : ''})</span>
                                    <span className="font-semibold text-slate-800 font-mono">{calculateSubtotal().toFixed(2)}₺</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t("tax")} ({showcasePricing.taxPercentage}%)</span>
                                    <span className="font-semibold text-slate-800 font-mono">{calculateTax().toFixed(2)}₺</span>
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                                    <span className="text-sm font-bold text-slate-700">{t("total")}</span>
                                    <span className="text-3xl font-bold font-mono text-primary tracking-tight">{totalCost.toFixed(2)}₺</span>
                                </div>
                            </div>
                        </div>}

                    {!showcasePricing && <div className="rounded-2xl border border-border-light px-4 py-4 flex justify-between items-baseline">
                            <span className="text-sm font-bold text-slate-700">{t("total")}</span>
                            <span className="text-3xl font-bold font-mono text-primary">{totalCost}₺</span>
                        </div>}
                </div>;
    }
    if (step === 2) {
      return <div className="space-y-5">
                    <div className="rounded-2xl border border-border-light bg-background-primary p-5">
                        <PaymentAgreementsSection acceptedAgreements={acceptedAgreements} onToggle={onAgreementToggle} onRequiredAgreementsChange={handleAgreementsChange} />
                    </div>
                </div>;
    }
    return <ShowcasePayment ref={showcasePaymentRef} embedded listingId={listingId} listingTitle={listing.title || listingTitle} days={days} totalCost={totalCost} showcasePricing={showcasePricing} calculateSubtotal={calculateSubtotal} calculateTax={calculateTax} onSuccess={() => {
      setSuccessSummary({
        title: listing?.title || listingTitle,
        days
      });
      setShowSuccessNotification(true);
      onSuccess?.();
    }} onError={(error) => {
      if (error.response?.data?.error === 'SHOWCASE_SLOT_LIMIT_EXCEEDED') {
        setShowUpgradeModal(true);
        setUpgradeHint('Showcase slot limitinize ulaştınız.');
        return true;
      }
      return false;
    }} onClose={onClose} acceptedAgreements={acceptedAgreements} getAcceptedAgreementIds={getAcceptedAgreementIds} isExtension={isExtension} showcaseId={showcaseId} />;
  }, [step, days, showcasePricing, calculateSubtotal, calculateTax, totalCost, listingId, listing, listingTitle, onSuccess, onClose, acceptedAgreements, onAgreementToggle, getAcceptedAgreementIds, handleDaysChange, onRequiredAgreementsChange]);
  if (!isOpen && !showSuccessNotification) return null;
  const successTitle = successSummary?.title ?? listing?.title ?? listingTitle;
  const successDays = successSummary?.days ?? days;
  const renderModalContent = () => {
    if (showSuccessNotification) return null; // Hide main content if showing success

    if (isListingLoading) {
      return <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-background-primary rounded-2xl shadow-2xl w-full max-w-md mx-4 p-10 text-center">
                        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                        <p className="text-sm text-slate-500 font-medium">{t("loading_listing")}</p>
                    </div>
                </div>;
    }
    if (!listingId || listingError || !listing) {
      return <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-background-primary rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center">
                        <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <X className="w-5 h-5 text-rose-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-text-primary mb-2">{t("something_went_wrong")}</h2>
                        <p className="text-sm text-slate-400 mb-6">{listingError || 'Listing not found.'}</p>
                        <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors" onClick={onClose}>{t("close")}</button>
                    </div>
                </div>;
    }
    return <>
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-background-primary rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden max-h-[92vh] flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <Zap className="w-4.5 h-4.5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-text-primary">
                                        {isExtension ? 'Extend Showcase' : 'Showcase Promotion'}
                                    </h3>
                                    <p className="text-caption text-slate-400">
                                        {isExtension ? 'Extend your promotion duration' : 'Boost your listing visibility'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Step indicator */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                            <div className="flex items-center justify-between relative">
                                {/* Connecting line */}
                                <div className="absolute left-0 right-0 top-4 h-px bg-slate-200 z-0" />
                                <div className="absolute left-0 top-4 h-px bg-primary z-0 transition-all duration-500" style={{
                width: `${(step - 1) / (STEPS.length - 1) * 100}%`
              }} />
                                {STEPS.map(({
                id,
                label,
                icon: Icon
              }) => {
                const done = step > id;
                const active = step === id;
                return <div key={id} className="flex flex-col items-center gap-1.5 z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${done ? 'bg-primary text-white' : active ? 'bg-primary text-white shadow-lg shadow-indigo-500/30 scale-110' : 'bg-background-primary border-2 border-border-light text-slate-400'}`}>
                                                {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                                            </div>
                                            <span className={`text-caption font-semibold ${active ? 'text-primary' : done ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {label}
                                            </span>
                                        </div>;
              })}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {renderStepContent()}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
                            <button className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors rounded-xl hover:bg-slate-100" onClick={handlePrevStep}>
                                {step > 1 ? '← Back' : 'Cancel'}
                            </button>
                            {step < 3 && <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none" onClick={handleNextStep} disabled={step === 1 && (days < 1 || days > 30) || step === 2 && !allAgreementsAccepted}>
                                    {step === 1 ? 'Continue →' : 'Proceed to Payment →'}
                                </button>}
                        </div>
                    </div>
                </div>

            </>;
  };
  const modalContent = <>
            {isOpen ? renderModalContent() : null}
            {showSuccessNotification && <NotificationModal isOpen={showSuccessNotification} onClose={() => {
      setShowSuccessNotification(false);
      setSuccessSummary(null);
      onClose?.();
    }} type="success" title={isExtension ? "Showcase extended!" : "Showcase activated!"} message={isExtension ? `"${successTitle}" has been extended by ${successDays} day${successDays !== 1 ? 's' : ''}.` : `"${successTitle}" will be featured for ${successDays} day${successDays !== 1 ? 's' : ''}.`} autoClose={true} autoCloseDelay={5000} size="md" />}
            <PremiumUpgradeModal
              isOpen={showUpgradeModal}
              onClose={() => setShowUpgradeModal(false)}
              featureHint={upgradeHint}
            />
        </>;
  return ReactDOM.createPortal(modalContent, document.body);
};
export default ShowcaseModal;