import React, {useEffect, useState} from 'react';
import {showcaseService} from '../services/showcaseService.js';
import {useEnums} from '../../common/hooks/useEnums.js';
import {usePaymentMethods} from '../../payments/hooks/usePaymentMethods.js';
import {useEWallet} from '../../ewallet/hooks/useEWallet.js';
import PaymentSelectionStep from '../../cart/components/checkout/PaymentSelectionStep.jsx';
import { orderService } from '../../order/services/orderService.js';
import { useEmails } from '../../payments/hooks/useEmails.js';

const ShowcaseModal = ({ isOpen, onClose, listingId, listingTitle = '', onSuccess }) => {
    const [step, setStep] = useState(1);
    const [days, setDays] = useState(7);
    const [paymentType, setPaymentType] = useState('CREDIT_CARD');
    const [selectedCardNumber, setSelectedCardNumber] = useState(null);
    const [selectedBankAccountIban, setSelectedBankAccountIban] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const { emails, isLoading: isEmailsLoading, fetchEmails } = useEmails();

    const { paymentMethods, isLoading: isPaymentLoading, refetch } = usePaymentMethods();
    const { eWallet, loading: isEWalletLoading, refreshWallet } = useEWallet();
    const { enums, isLoading: isPricingLoading } = useEnums();
    
    const showcasePricing = enums.showcasePricingConfig;

    useEffect(() => {
        if (isOpen) {
            refetch();
            refreshWallet();
        }
            }, [isOpen]);

    useEffect(() => {
        if (paymentType === 'CREDIT_CARD' && paymentMethods.creditCards.length > 0) {
            setSelectedCardNumber(paymentMethods.creditCards[0].number || paymentMethods.creditCards[0].cardNumber);
        }
        if (paymentType === 'TRANSFER' && paymentMethods.bankAccounts.length > 0) {
            setSelectedBankAccountIban(paymentMethods.bankAccounts[0].IBAN);
        }
    }, [paymentType, paymentMethods]);

    if (!isOpen) return null;
    if (!listingId) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-8 text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
                    <p>Listing Information Not Found.</p>
                    <button className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded" onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    const today = new Date();
    const startDate = today.toLocaleDateString('tr-TR');
    const endDate = new Date(today.getTime() + (days - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR');
    
    const calculateTotal = () => {
        if (!showcasePricing) return 0;
        return showcasePricing.totalDailyCost * days;
    };
    
    const calculateSubtotal = () => {
        if (!showcasePricing) return 0;
        return showcasePricing.dailyCost * days;
    };
    
    const calculateTax = () => {
        if (!showcasePricing) return 0;
        return (showcasePricing.totalDailyCost - showcasePricing.dailyCost) * days;
    };
    
    const totalCost = calculateTotal();

    const handlePayment = async () => {
        if (!listingId) {
            setError('Listing Information not found. Please Try Again');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await showcaseService.createShowcase(listingId, days, paymentType, verificationCode);
            setSuccess(true);
                        try { window.dispatchEvent(new Event('showcases:refresh')); } catch {}
            onSuccess?.();
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    const proceedToPayment = async () => {
        setLoading(true);
        setError(null);
        try {
            await orderService.initiatePaymentVerification({
                transactionType: 'SHOWCASE_PAYMENT',
                listingId,
                days,
                amount: totalCost
            });
            await fetchEmails();
            setStep(4);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-center">Showcase Duration</h3>
                        <label className="block text-sm font-medium text-gray-700 mb-2">For how many day(s)?</label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={days}
                            onChange={e => setDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Minimum 1, maximum 30 days. 
                            {showcasePricing ? (
                                <>Per Day: <span className="font-semibold">{showcasePricing.dailyCost}₺</span></>
                            ) : (
                                <>Per Day: <span className="font-semibold">10₺</span></>
                            )}
                        </p>
                        {showcasePricing && (
                            <div className="mt-4 p-3 bg-gray-50 rounded space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal ({days} days):</span>
                                    <span>{calculateSubtotal().toFixed(2)}₺</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax ({showcasePricing.taxPercentage}%):</span>
                                    <span>{calculateTax().toFixed(2)}₺</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Total:</span>
                                    <span className="text-emerald-600">{totalCost.toFixed(2)}₺</span>
                                </div>
                            </div>
                        )}
                        {!showcasePricing && (
                            <div className="flex justify-between mt-4 p-3 bg-gray-50 rounded">
                                <span className="font-medium">Total:</span>
                                <span className="text-lg font-bold text-emerald-600">{totalCost}₺</span>
                            </div>
                        )}
                    </div>
                );
            case 2:
                return (
                    <PaymentSelectionStep
                        selectedPaymentType={paymentType}
                        setSelectedPaymentType={setPaymentType}
                        cards={paymentMethods.creditCards}
                        selectedCardNumber={selectedCardNumber}
                        setSelectedCardNumber={setSelectedCardNumber}
                        bankAccounts={paymentMethods.bankAccounts}
                        selectedBankAccountIban={selectedBankAccountIban}
                        setSelectedBankAccountIban={setSelectedBankAccountIban}
                        eWallet={eWallet}
                        calculateTotal={calculateTotal}
                    />
                );
            case 3:
                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-center">Summary</h3>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="font-medium">Listing:</span>
                                <span>{listingTitle}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Starts At:</span>
                                <span>{startDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Ends At:</span>
                                <span>{endDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Day:</span>
                                <span>{days}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Payment Method:</span>
                                <span>{paymentType === 'CREDIT_CARD' ? 'Credit Card' : paymentType === 'TRANSFER' ? 'Bank Wire' : 'eWallet'}</span>
                            </div>
                        </div>
                        {showcasePricing ? (
                            <div className="p-3 bg-gray-50 rounded mb-2 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal ({days} days):</span>
                                    <span>{calculateSubtotal().toFixed(2)}₺</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax ({showcasePricing.taxPercentage}%):</span>
                                    <span>{calculateTax().toFixed(2)}₺</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Total:</span>
                                    <span className="text-emerald-600">{totalCost.toFixed(2)}₺</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between p-3 bg-gray-50 rounded mb-2">
                                <span className="font-bold text-lg">Total:</span>
                                <span className="text-xl font-bold text-emerald-600">{totalCost}₺</span>
                            </div>
                        )}
                        {error && <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
                        <button
                            className="w-full py-2 mt-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                            onClick={proceedToPayment}
                            disabled={loading}
                        >
                            {loading ? 'Sending Code…' : 'Proceed to Payment'}
                        </button>
                    </div>
                );
            case 4:
                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-center">Verification</h3>
                        <div className="mb-3">
                            <label className="block text-sm text-gray-700 mb-1">Verification Code</label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={e => setVerificationCode(e.target.value)}
                                placeholder="Enter the code sent to your email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="mb-4">
                            <button
                                className="w-full py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
                                onClick={handlePayment}
                                disabled={loading || !verificationCode}
                            >
                                {loading ? 'Processing…' : 'Finish Payment'}
                            </button>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="text-sm font-medium text-gray-700">Emails</h5>
                                <button className="text-emerald-600 text-sm underline" onClick={fetchEmails}>Refresh</button>
                            </div>
                            <div className="max-h-48 overflow-auto border rounded p-2 bg-gray-50">
                                {isEmailsLoading ? (
                                    <div className="text-sm text-gray-500">Loading emails…</div>
                                ) : (emails && emails.length > 0 ? (
                                    emails.map((e, idx) => (
                                        <div key={idx} className="mb-2 p-2 bg-white rounded border">
                                            <div className="text-xs text-gray-500">{e.sentAt || e.createdAt}</div>
                                            <div className="text-sm font-medium">{e.subject || 'Verification Code'}</div>
                                            <div className="text-sm whitespace-pre-wrap">{e.body || e.content}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500">No emails found.</div>
                                ))}
                            </div>
                        </div>
                        {success && <div className="mt-3 text-green-700 text-center font-semibold">Successfully added to showcase!</div>}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Showcase</h3>
                    <button className="p-2 hover:bg-gray-100 rounded" onClick={onClose}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    {/* Step indicator */}
                    <div className="flex items-center space-x-2 mb-6">
                        {[1, 2, 3].map(s => (
                            <div
                                key={s}
                                className={`h-2 flex-1 rounded ${step >= s ? 'bg-emerald-600' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                    {/* Step content */}
                    {renderStepContent()}
                </div>
                <div className="p-4 border-t flex items-center justify-between">
                    <button
                        className="px-4 py-2 border rounded"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose}
                        disabled={loading}
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </button>
                    {step < 3 && (
                        <button
                            className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
                            onClick={() => setStep(step + 1)}
                            disabled={
                                (step === 1 && (days < 1 || days > 30)) ||
                                (step === 2 && (
                                    !paymentType ||
                                    (paymentType === 'CREDIT_CARD' && paymentMethods.creditCards.length > 0 && !selectedCardNumber) ||
                                    (paymentType === 'TRANSFER' && paymentMethods.bankAccounts.length > 0 && !selectedBankAccountIban) ||
                                    (paymentType === 'EWALLET' && !eWallet)
                                )) ||
                                loading
                            }
                        >
                            Continue
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShowcaseModal;
