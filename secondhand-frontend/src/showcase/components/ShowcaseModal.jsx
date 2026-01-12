import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ReactDOM from 'react-dom';
import {useEnums} from '../../common/hooks/useEnums.js';
import {usePaymentAgreements} from '../../payments/hooks/usePaymentAgreements.js';
import {useListingData} from '../../listing/hooks/useListingData.js';
import PaymentAgreementsSection from '../../payments/components/PaymentAgreementsSection.jsx';
import NotificationModal from '../../notification/NotificationModal.jsx';
import ShowcasePayment from './ShowcasePayment.jsx';
import { Zap, ShieldCheck, X } from 'lucide-react';

const ShowcaseModal = ({ isOpen, onClose, listingId, listingTitle = '', onSuccess }) => {
    const [step, setStep] = useState(1);
    const [days, setDays] = useState(7);
    const [allAgreementsAccepted, setAllAgreementsAccepted] = useState(false);
    const [requiredAgreements, setRequiredAgreements] = useState([]);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const { enums, isLoading: isPricingLoading } = useEnums();
    const paymentAgreements = usePaymentAgreements();
    const { listing, isLoading: isListingLoading, error: listingError } = useListingData(listingId, isOpen);
    
    const showcasePricing = enums.showcasePricingConfig;

    const today = useMemo(() => new Date(), []);
    const startDate = useMemo(() => today.toLocaleDateString('tr-TR'), [today]);
    const endDate = useMemo(() => 
        new Date(today.getTime() + (days - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'), 
        [today, days]
    );
    
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

    // Check if all agreements are accepted whenever acceptedAgreements changes
    useEffect(() => {
        if (requiredAgreements.length > 0) {
            const allAccepted = requiredAgreements.every(agreement => 
                paymentAgreements.acceptedAgreements.has(agreement.agreementId)
            );
            setAllAgreementsAccepted(allAccepted);
        }
    }, [paymentAgreements.acceptedAgreements, requiredAgreements]);

    const handleDaysChange = useCallback((e) => {
        setDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)));
    }, []);

    const handleNextStep = useCallback(() => {
        if (step === 1) {
            setStep(step + 1);
        } else if (step === 2) {
            setStep(step + 1);
        }
    }, [step]);

    const handlePrevStep = useCallback(() => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            onClose();
        }
    }, [step, onClose]);

    const canProceedToPayment = useCallback(() => {
        if (step === 2) {
            return allAgreementsAccepted;
        }
        return true;
    }, [step, allAgreementsAccepted]);

    const renderStepContent = useCallback(() => {
        if (step === 1) {
            const durationOptions = [7, 14, 21, 30];
            
            return (
                <div className="space-y-8">
                    <div className="text-center">
                        <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Boost Your Listing</h3>
                        <p className="text-sm text-slate-600 tracking-tight">Make your listing stand out with showcase promotion</p>
                    </div>
                    
                    <div className="rounded-3xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-6">
                        <label className="block text-sm font-semibold tracking-tight text-slate-700 mb-4">Showcase Duration</label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {durationOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setDays(option)}
                                    className={`px-6 py-4 rounded-3xl font-semibold tracking-tight text-sm transition-all duration-300 ${
                                        days === option
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                            : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                                    }`}
                                >
                                    {option} {option === 1 ? 'Day' : 'Days'}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={days}
                                onChange={handleDaysChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-mono text-slate-900 tracking-tight"
                                required
                            />
                            <div className="flex items-center justify-between mt-3 text-xs text-slate-500 tracking-tight">
                                <span>Duration: {days} day{days !== 1 ? 's' : ''}</span>
                                {showcasePricing && (
                                    <span>Per Day: <span className="font-mono font-semibold text-indigo-600">{showcasePricing.dailyCost}₺</span></span>
                                )}
                            </div>
                        </div>
                    </div>

                    {showcasePricing && (
                        <div className="rounded-3xl border border-slate-200/60 bg-gradient-to-br from-indigo-50/30 to-white p-6">
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-5">Investment Summary</h4>
                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between text-sm tracking-tight">
                                    <span className="text-slate-600">Subtotal ({days} days):</span>
                                    <span className="font-mono font-semibold text-slate-900">{calculateSubtotal().toFixed(2)}₺</span>
                                </div>
                                <div className="flex justify-between text-sm tracking-tight">
                                    <span className="text-slate-600">Tax ({showcasePricing.taxPercentage}%):</span>
                                    <span className="font-mono font-semibold text-slate-900">{calculateTax().toFixed(2)}₺</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-200">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm font-semibold tracking-tight text-slate-700">Total Investment:</span>
                                    <span className="text-5xl font-black font-mono tracking-tighter text-indigo-600">{totalCost.toFixed(2)}₺</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {!showcasePricing && (
                        <div className="rounded-3xl border border-slate-200/60 bg-white p-6">
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-semibold tracking-tight text-slate-700">Total Investment:</span>
                                <span className="text-5xl font-black font-mono tracking-tighter text-indigo-600">{totalCost}₺</span>
                            </div>
                        </div>
                    )}
                </div>
            );
        } else if (step === 2) {
            return (
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                            <ShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Security & Agreements</h3>
                        <p className="text-sm text-slate-600 tracking-tight">Please review and accept the payment agreements to proceed</p>
                    </div>
                    
                    <div className="rounded-3xl border border-slate-200/60 bg-white/50 backdrop-blur-xl p-6">
                        <PaymentAgreementsSection 
                            acceptedAgreements={paymentAgreements.acceptedAgreements}
                            onToggle={paymentAgreements.handleAgreementToggle}
                            onRequiredAgreementsChange={(agreements) => {
                                setRequiredAgreements(agreements);
                            }}
                        />
                    </div>
                </div>
            );
        } else {
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
                        setShowSuccessNotification(true);
                        onSuccess?.();
                    }}
                    onClose={onClose}
                    acceptedAgreements={paymentAgreements.acceptedAgreements}
                    getAcceptedAgreementIds={paymentAgreements.getAcceptedAgreementIds}
                />
            );
        }
    }, [step, days, showcasePricing, calculateSubtotal, calculateTax, totalCost, listingId, listing, listingTitle, onSuccess, onClose, paymentAgreements, handleDaysChange]);

    if (!isOpen) return null;
    
    const renderModalContent = () => {
        if (isListingLoading) {
            return (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-slate-50/50 rounded-[2.5rem] shadow-2xl shadow-slate-900/40 w-full max-w-md mx-4 p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-sm text-slate-600 tracking-tight">Loading listing information...</p>
                    </div>
                </div>
            );
        }
        
        if (!listingId || listingError) {
            return (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-slate-50/50 rounded-[2.5rem] shadow-2xl shadow-slate-900/40 w-full max-w-md mx-4 p-8 text-center">
                        <h2 className="text-xl font-bold tracking-tight text-rose-600 mb-4">Error</h2>
                        <p className="text-sm text-slate-600 tracking-tight">{listingError || 'Listing Information Not Found.'}</p>
                        <button className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-2xl font-semibold tracking-tight transition-all hover:shadow-lg" onClick={onClose}>Close</button>
                    </div>
                </div>
            );
        }
        
        if (!listing) {
            return (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-slate-50/50 rounded-[2.5rem] shadow-2xl shadow-slate-900/40 w-full max-w-md mx-4 p-8 text-center">
                        <h2 className="text-xl font-bold tracking-tight text-rose-600 mb-4">Error</h2>
                        <p className="text-sm text-slate-600 tracking-tight">Listing not found.</p>
                        <button className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-2xl font-semibold tracking-tight transition-all hover:shadow-lg" onClick={onClose}>Close</button>
                    </div>
                </div>
            );
        }

        return (
            <>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-50/50 rounded-[2.5rem] shadow-2xl shadow-slate-900/40 w-full max-w-2xl mx-auto overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-white">Showcase Promotion</h3>
                                <p className="text-indigo-100 text-sm tracking-tight">Boost your listing visibility</p>
                            </div>
                            <button 
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors" 
                                onClick={onClose}
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="px-6 py-4 bg-white/30 backdrop-blur-sm flex-shrink-0 border-b border-white/10">
                            <div className="relative h-1 bg-slate-200/50 rounded-full overflow-hidden">
                                <div 
                                    className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    style={{ width: `${(step / 3) * 100}%` }}
                                />
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 tracking-tight">
                                <span className={step >= 1 ? 'font-semibold text-indigo-600' : ''}>Duration & Pricing</span>
                                <span className={step >= 2 ? 'font-semibold text-indigo-600' : ''}>Agreements</span>
                                <span className={step >= 3 ? 'font-semibold text-indigo-600' : ''}>Payment</span>
                            </div>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            {renderStepContent()}
                        </div>

                        <div className="px-6 py-5 bg-white/30 backdrop-blur-sm border-t border-white/10 flex items-center justify-between flex-shrink-0">
                            <button
                                className="px-5 py-2.5 text-sm font-semibold tracking-tight text-slate-600 hover:text-slate-900 transition-colors"
                                onClick={handlePrevStep}
                            >
                                {step > 1 ? 'Back' : 'Cancel'}
                            </button>
                            {step < 3 && (
                                <button
                                    className="px-8 py-5 bg-slate-900 text-white rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/20 font-bold tracking-tight transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleNextStep}
                                    disabled={
                                        (step === 1 && (days < 1 || days > 30)) ||
                                        (step === 2 && !allAgreementsAccepted)
                                    }
                                >
                                    {step === 1 ? 'Continue' : 'Proceed to Payment'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                <NotificationModal
                    isOpen={showSuccessNotification}
                    onClose={() => setShowSuccessNotification(false)}
                    type="success"
                    title="Showcase success!"
                    message={`"${listing.title || listingTitle}" will be active for ${days} at showcases section.`}
                    autoClose={true}
                    autoCloseDelay={5000}
                    size="md"
                />
            </>
        );
    };

    const modalContent = renderModalContent();
    
    if (!modalContent) return null;
    
    return ReactDOM.createPortal(modalContent, document.body);
};

export default ShowcaseModal;
