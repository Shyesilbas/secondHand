import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ReactDOM from 'react-dom';
import {useEnums} from '../../common/hooks/useEnums.js';
import {useListingData} from '../../listing/hooks/useListingData.js';
import PaymentAgreementsSection from '../../payments/components/PaymentAgreementsSection.jsx';
import { useAgreementsState } from '../../payments/hooks/useListingPaymentFlow.js';
import NotificationModal from '../../notification/NotificationModal.jsx';
import ShowcasePayment from './ShowcasePayment.jsx';
import { Zap, ShieldCheck, X, Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Duration', icon: Zap },
  { id: 2, label: 'Agreements', icon: ShieldCheck },
  { id: 3, label: 'Payment', icon: Check },
];

const ShowcaseModal = ({ isOpen, onClose, listingId, listingTitle = '', onSuccess, isExtension = false, showcaseId = null }) => {
    const [step, setStep] = useState(1);
    const [days, setDays] = useState(7);
    const [allAgreementsAccepted, setAllAgreementsAccepted] = useState(false);
    const [requiredAgreements, setRequiredAgreements] = useState([]);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [successSummary, setSuccessSummary] = useState(null);
    const { enums, isLoading: isPricingLoading } = useEnums();
    const {
        acceptedAgreements,
        onAgreementToggle,
        onRequiredAgreementsChange,
        areAllAgreementsAccepted,
        getAcceptedAgreementIds,
    } = useAgreementsState();
    const { listing, isLoading: isListingLoading, error: listingError } = useListingData(listingId, isOpen);

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

    const handleDaysChange = useCallback((e) => {
        setDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)));
    }, []);

    const handleAgreementsChange = useCallback((agreements) => {
        setRequiredAgreements(agreements);
        onRequiredAgreementsChange(agreements);
    }, [onRequiredAgreementsChange]);

    const handleNextStep = useCallback(() => {
        if (step < 3) setStep(s => s + 1);
    }, [step]);

    const handlePrevStep = useCallback(() => {
        if (step > 1) setStep(s => s - 1);
        else onClose();
    }, [step, onClose]);

    const renderStepContent = useCallback(() => {
        if (step === 1) {
            const durationOptions = [7, 14, 21, 30];
            return (
                <div className="space-y-6">
                    {/* Duration picker */}
                    <div>
                        <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Choose Duration</p>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {durationOptions.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setDays(opt)}
                                    className={`py-3 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                                        days === opt
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {opt}d
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                            <span className="text-[12px] text-slate-500 font-medium shrink-0">Custom days:</span>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={days}
                                onChange={handleDaysChange}
                                className="flex-1 bg-transparent text-[14px] font-bold text-slate-800 focus:outline-none w-0"
                            />
                            {showcasePricing && (
                                <span className="text-[11px] text-slate-400 shrink-0">
                                    {showcasePricing.dailyCost}₺/day
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Pricing summary */}
                    {showcasePricing && (
                        <div className="rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Price Summary</p>
                            </div>
                            <div className="px-4 py-4 space-y-2.5">
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-slate-500">Subtotal ({days} day{days !== 1 ? 's' : ''})</span>
                                    <span className="font-semibold text-slate-800 font-mono">{calculateSubtotal().toFixed(2)}₺</span>
                                </div>
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-slate-500">Tax ({showcasePricing.taxPercentage}%)</span>
                                    <span className="font-semibold text-slate-800 font-mono">{calculateTax().toFixed(2)}₺</span>
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                                    <span className="text-[13px] font-bold text-slate-700">Total</span>
                                    <span className="text-3xl font-black font-mono text-indigo-600 tracking-tight">{totalCost.toFixed(2)}₺</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!showcasePricing && (
                        <div className="rounded-2xl border border-slate-200 px-4 py-4 flex justify-between items-baseline">
                            <span className="text-[13px] font-bold text-slate-700">Total</span>
                            <span className="text-3xl font-black font-mono text-indigo-600">{totalCost}₺</span>
                        </div>
                    )}
                </div>
            );
        }

        if (step === 2) {
            return (
                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <PaymentAgreementsSection
                            acceptedAgreements={acceptedAgreements}
                            onToggle={onAgreementToggle}
                            onRequiredAgreementsChange={handleAgreementsChange}
                        />
                    </div>
                </div>
            );
        }

        return (
            <ShowcasePayment
                listingId={listingId}
                listingTitle={listing.title || listingTitle}
                days={days}
                totalCost={totalCost}
                showcasePricing={showcasePricing}
                calculateSubtotal={calculateSubtotal}
                calculateTax={calculateTax}
                onSuccess={() => {
                    setSuccessSummary({
                        title: listing?.title || listingTitle,
                        days,
                    });
                    setShowSuccessNotification(true);
                    onSuccess?.();
                }}
                onClose={onClose}
                acceptedAgreements={acceptedAgreements}
                getAcceptedAgreementIds={getAcceptedAgreementIds}
                isExtension={isExtension}
                showcaseId={showcaseId}
            />
        );
    }, [step, days, showcasePricing, calculateSubtotal, calculateTax, totalCost, listingId, listing, listingTitle, onSuccess, onClose, acceptedAgreements, onAgreementToggle, getAcceptedAgreementIds, handleDaysChange, onRequiredAgreementsChange]);

    if (!isOpen && !showSuccessNotification) return null;

    const successTitle = successSummary?.title ?? listing?.title ?? listingTitle;
    const successDays = successSummary?.days ?? days;

    const renderModalContent = () => {
        if (showSuccessNotification) return null; // Hide main content if showing success

        if (isListingLoading) {
            return (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-10 text-center">
                        <div className="w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-4" />
                        <p className="text-[13px] text-slate-500 font-medium">Loading listing…</p>
                    </div>
                </div>
            );
        }

        if (!listingId || listingError || !listing) {
            return (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center">
                        <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <X className="w-5 h-5 text-rose-500" />
                        </div>
                        <h2 className="text-[15px] font-bold text-slate-800 mb-2">Something went wrong</h2>
                        <p className="text-[13px] text-slate-400 mb-6">{listingError || 'Listing not found.'}</p>
                        <button
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-semibold hover:bg-slate-800 transition-colors"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <>
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden max-h-[92vh] flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <Zap className="w-4.5 h-4.5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-slate-800 leading-tight">
                                        {isExtension ? 'Extend Showcase' : 'Showcase Promotion'}
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        {isExtension ? 'Extend your promotion duration' : 'Boost your listing visibility'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Step indicator */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                            <div className="flex items-center justify-between relative">
                                {/* Connecting line */}
                                <div className="absolute left-0 right-0 top-4 h-px bg-slate-200 z-0" />
                                <div
                                    className="absolute left-0 top-4 h-px bg-indigo-500 z-0 transition-all duration-500"
                                    style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                                />
                                {STEPS.map(({ id, label, icon: Icon }) => {
                                    const done = step > id;
                                    const active = step === id;
                                    return (
                                        <div key={id} className="flex flex-col items-center gap-1.5 z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                done ? 'bg-indigo-600 text-white' :
                                                active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110' :
                                                'bg-white border-2 border-slate-200 text-slate-400'
                                            }`}>
                                                {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                                            </div>
                                            <span className={`text-[10px] font-semibold ${active ? 'text-indigo-600' : done ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {renderStepContent()}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
                            <button
                                className="px-4 py-2 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors rounded-xl hover:bg-slate-100"
                                onClick={handlePrevStep}
                            >
                                {step > 1 ? '← Back' : 'Cancel'}
                            </button>
                            {step < 3 && (
                                <button
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[13px] font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                                    onClick={handleNextStep}
                                    disabled={
                                        (step === 1 && (days < 1 || days > 30)) ||
                                        (step === 2 && !allAgreementsAccepted)
                                    }
                                >
                                    {step === 1 ? 'Continue →' : 'Proceed to Payment →'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </>
        );
    };

    const modalContent = (
        <>
            {isOpen ? renderModalContent() : null}
            {showSuccessNotification && (
                <NotificationModal
                    isOpen={showSuccessNotification}
                    onClose={() => {
                        setShowSuccessNotification(false);
                        setSuccessSummary(null);
                        onClose?.();
                    }}
                    type="success"
                    title={isExtension ? "Showcase extended!" : "Showcase activated!"}
                    message={isExtension 
                        ? `"${successTitle}" has been extended by ${successDays} day${successDays !== 1 ? 's' : ''}.`
                        : `"${successTitle}" will be featured for ${successDays} day${successDays !== 1 ? 's' : ''}.`
                    }
                    autoClose={true}
                    autoCloseDelay={5000}
                    size="md"
                />
            )}
        </>
    );
    return ReactDOM.createPortal(modalContent, document.body);
};

export default ShowcaseModal;
