import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ReactDOM from 'react-dom';
import {useEnums} from '../../common/hooks/useEnums.js';
import {usePaymentAgreements} from '../../payments/hooks/usePaymentAgreements.js';
import {useListingData} from '../../listing/hooks/useListingData.js';
import PaymentAgreementsSection from '../../payments/components/PaymentAgreementsSection.jsx';
import NotificationModal from '../../notification/NotificationModal.jsx';
import ShowcasePayment from './ShowcasePayment.jsx';

const ShowcaseModal = ({ isOpen, onClose, listingId, listingTitle = '', onSuccess }) => {
    const [step, setStep] = useState(1);
    const [days, setDays] = useState(7);
    const [allAgreementsAccepted, setAllAgreementsAccepted] = useState(false);
    const [requiredAgreements, setRequiredAgreements] = useState([]);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const { enums, isLoading: isPricingLoading } = useEnums();
    const paymentAgreements = usePaymentAgreements();
    const { listing, isLoading: isListingLoading, error: listingError } = useListingData(listingId);
    
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
            return (
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Boost Your Listing</h3>
                        <p className="text-sm text-gray-600">Make your listing stand out with showcase promotion</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Showcase Duration</label>
                        <div className="space-y-3">
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={days}
                                onChange={handleDaysChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                                required
                            />
                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>Duration: {days} day{days !== 1 ? 's' : ''}</span>
                                {showcasePricing ? (
                                    <span>Per Day: <span className="font-semibold text-emerald-600">{showcasePricing.dailyCost}₺</span></span>
                                ) : (
                                    <span>Per Day: <span className="font-semibold text-emerald-600">10₺</span></span>
                                )}
                            </div>
                        </div>
                    </div>

                    {showcasePricing && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                            <h4 className="font-medium text-gray-900 text-sm">Cost Breakdown</h4>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Subtotal ({days} days):</span>
                                    <span className="font-medium">{calculateSubtotal().toFixed(2)}₺</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Tax ({showcasePricing.taxPercentage}%):</span>
                                    <span className="font-medium">{calculateTax().toFixed(2)}₺</span>
                                </div>
                                <div className="border-t pt-1">
                                    <div className="flex justify-between font-bold text-base">
                                        <span>Total:</span>
                                        <span className="text-emerald-600">{totalCost.toFixed(2)}₺</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {!showcasePricing && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-900">Total Cost:</span>
                                <span className="text-xl font-bold text-emerald-600">{totalCost}₺</span>
                            </div>
                        </div>
                    )}
                </div>
            );
        } else if (step === 2) {
            return (
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Agreements</h3>
                        <p className="text-sm text-gray-600">Please review and accept the payment agreements to proceed</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                        <p>Loading listing information...</p>
                    </div>
                </div>
            );
        }
        
        if (!listingId || listingError) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-8 text-center">
                        <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
                        <p>{listingError || 'Listing Information Not Found.'}</p>
                        <button className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded" onClick={onClose}>Close</button>
                    </div>
                </div>
            );
        }
        
        if (!listing) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-8 text-center">
                        <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
                        <p>Listing not found.</p>
                        <button className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded" onClick={onClose}>Close</button>
                    </div>
                </div>
            );
        }

        return (
            <>
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-semibold text-white">Showcase Promotion</h3>
                                <p className="text-emerald-100 text-sm">Boost your listing visibility</p>
                            </div>
                            <button 
                                className="p-2 hover:bg-emerald-600 rounded-lg transition-colors" 
                                onClick={onClose}
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex-shrink-0">
                            <div className="flex items-center space-x-3">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className="flex items-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                                step >= s 
                                                    ? 'bg-emerald-600 text-white' 
                                                    : 'bg-gray-300 text-gray-600'
                                            }`}
                                        >
                                            {s}
                                        </div>
                                        {s < 3 && (
                                            <div
                                                className={`w-8 h-0.5 mx-2 ${
                                                    step > s ? 'bg-emerald-600' : 'bg-gray-300'
                                                }`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                                {step === 1 && 'Duration & Pricing'}
                                {step === 2 && 'Payment Agreements'}
                                {step === 3 && 'Payment & Confirmation'}
                            </div>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            {renderStepContent()}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between flex-shrink-0">
                            <button
                                className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                onClick={handlePrevStep}
                            >
                                {step > 1 ? 'Back' : 'Cancel'}
                            </button>
                            {step < 3 && (
                                <button
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
