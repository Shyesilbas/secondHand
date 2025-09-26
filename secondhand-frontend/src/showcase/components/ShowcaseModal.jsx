import React, {useEffect, useState} from 'react';
import {showcaseService} from '../services/showcaseService.js';
import {usePaymentMethods} from '../../payments/hooks/usePaymentMethods.js';
import {useEWallet} from '../../ewallet/hooks/useEWallet.js';
import PaymentSelectionStep from '../../cart/components/checkout/PaymentSelectionStep.jsx';

const ShowcaseModal = ({ isOpen, onClose, listingId, listingTitle = '', onSuccess }) => {
    const [step, setStep] = useState(1);
    const [days, setDays] = useState(7);
    const [paymentType, setPaymentType] = useState('CREDIT_CARD');
    const [selectedCardNumber, setSelectedCardNumber] = useState(null);
    const [selectedBankAccountIban, setSelectedBankAccountIban] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const { paymentMethods, isLoading: isPaymentLoading, refetch } = usePaymentMethods();
    const { eWallet, loading: isEWalletLoading, refreshWallet } = useEWallet();

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
    const totalCost = days * 10;
    const calculateTotal = () => totalCost;

    const handlePayment = async () => {
        if (!listingId) {
            setError('Listing Information not found. Please Try Again');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await showcaseService.createShowcase(listingId, days, paymentType, selectedCardNumber, selectedBankAccountIban);
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
                        <p className="text-xs text-gray-500 mt-1">Minimum 1, maximum 30 days. Per Day: <span className="font-semibold">10₺</span></p>
                        <div className="flex justify-between mt-4 p-3 bg-gray-50 rounded">
                            <span className="font-medium">Total:</span>
                            <span className="text-lg font-bold text-emerald-600">{totalCost}₺</span>
                        </div>
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
                        <div className="flex justify-between p-3 bg-gray-50 rounded mb-2">
                            <span className="font-bold text-lg">Total:</span>
                            <span className="text-xl font-bold text-emerald-600">{totalCost}₺</span>
                        </div>
                        {error && <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
                        <button
                            className="w-full py-2 mt-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                            onClick={handlePayment}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Finish Payment'}
                        </button>
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
