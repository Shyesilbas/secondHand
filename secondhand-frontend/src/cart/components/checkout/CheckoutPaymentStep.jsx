import React, { useState } from 'react';
import { CreditCardIcon, BanknotesIcon, WalletIcon } from '@heroicons/react/24/outline';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import { formatCurrency } from '../../../common/formatters.js';

const CheckoutPaymentStep = ({
    selectedPaymentType,
    setSelectedPaymentType,
    cards,
    selectedCardNumber,
    setSelectedCardNumber,
    bankAccounts,
    selectedBankAccountIban,
    setSelectedBankAccountIban,
    eWallet,
    calculateTotal,
    currency,
    onNext,
    onBack,
    sendVerificationCode,
    acceptedAgreements,
    onAgreementToggle,
    onRequiredAgreementsChange,
    areAllAgreementsAccepted
}) => {
    const canProceed = () => {
        return isPaymentMethodValid() && areAllAgreementsAccepted();
    };

    const paymentMethods = [
        {
            id: 'CREDIT_CARD',
            name: 'Credit/Debit Card',
            icon: CreditCardIcon,
            description: 'Pay with your credit or debit card'
        },
        {
            id: 'TRANSFER',
            name: 'Bank Transfer',
            icon: BanknotesIcon,
            description: 'Transfer from your bank account'
        },
        {
            id: 'EWALLET',
            name: 'E-Wallet',
            icon: WalletIcon,
            description: `Pay with e-wallet (Balance: ${formatCurrency(eWallet?.balance || 0, currency || 'TRY')})`
        }
    ];

    const isPaymentMethodValid = () => {
        if (selectedPaymentType === 'CREDIT_CARD') {
            return selectedCardNumber && cards?.length > 0;
        } else if (selectedPaymentType === 'TRANSFER') {
            return selectedBankAccountIban && bankAccounts?.length > 0;
        } else if (selectedPaymentType === 'EWALLET') {
            return eWallet && calculateTotal() <= eWallet.balance;
        }
        return false;
    };

    const handleNext = async () => {
        if (selectedPaymentType === 'EWALLET' && calculateTotal() > eWallet.balance) {
            return; // Show error
        }
        await sendVerificationCode();
        onNext();
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tighter">Payment Method</h2>
                <p className="text-slate-500 tracking-tight">Choose how you'd like to pay for your order.</p>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 tracking-tight">Select Payment Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            const isSelected = selectedPaymentType === method.id;
                            const isDisabled = method.id === 'EWALLET' && (!eWallet || calculateTotal() > eWallet.balance);

                            return (
                                <label
                                    key={method.id}
                                    className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                                            : isDisabled
                                                ? 'border-slate-100 bg-slate-50 cursor-not-allowed'
                                                : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={method.id}
                                        checked={isSelected}
                                        onChange={(e) => setSelectedPaymentType(e.target.value)}
                                        disabled={isDisabled}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                                            isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="font-semibold text-slate-900 tracking-tight">{method.name}</div>
                                        <div className="text-sm text-slate-500 mt-1 tracking-tight">{method.description}</div>
                                        {isDisabled && (
                                            <div className="text-xs text-red-600 mt-2 font-semibold tracking-tight">Insufficient balance</div>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {selectedPaymentType === 'CREDIT_CARD' && (
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                        <h4 className="text-lg font-semibold text-slate-900 mb-4 tracking-tight">Card Details</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-tight">
                                    Select Card
                                </label>
                                <select
                                    value={selectedCardNumber || ''}
                                    onChange={(e) => setSelectedCardNumber(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white tracking-tight"
                                >
                                    <option value="">Choose a card</option>
                                    {cards?.map((card, index) => (
                                        <option key={card.id || `card-${index}`} value={card.number || card.cardNumber}>
                                            •••• •••• •••• {card.number?.slice(-4) || card.cardNumber?.slice(-4)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {selectedPaymentType === 'TRANSFER' && (
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                        <h4 className="text-lg font-semibold text-slate-900 mb-4 tracking-tight">Bank Account</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-tight">
                                    Select Account
                                </label>
                                <select
                                    value={selectedBankAccountIban || ''}
                                    onChange={(e) => setSelectedBankAccountIban(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white tracking-tight"
                                >
                                    <option value="">Choose an account</option>
                                    {bankAccounts?.map((account, index) => (
                                        <option key={account.id || `account-${index}`} value={account.IBAN}>
                                            •••• {account.IBAN?.slice(-4)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {selectedPaymentType === 'EWALLET' && (
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                        <h4 className="text-lg font-semibold text-slate-900 mb-4 tracking-tight">E-Wallet Balance</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 tracking-tight">Available Balance</span>
                            <span className="text-lg font-semibold font-mono text-slate-900 tracking-tight">
                                {formatCurrency(eWallet?.balance || 0, currency || 'TRY')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-slate-600 tracking-tight">Order Total</span>
                            <span className="text-lg font-semibold font-mono text-slate-900 tracking-tight">
                                {formatCurrency(calculateTotal(), currency || 'TRY')}
                            </span>
                        </div>
                        {calculateTotal() > eWallet?.balance && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-600 font-semibold tracking-tight">
                                    Insufficient balance. Please add funds or choose another payment method.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                    <PaymentAgreementsSection 
                        acceptedAgreements={acceptedAgreements}
                        onToggle={onAgreementToggle}
                        onRequiredAgreementsChange={onRequiredAgreementsChange}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-200 mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold transition-colors tracking-tight"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 font-bold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed tracking-tight"
                >
                    Send Verification Code
                </button>
                
                {!canProceed() && (
                    <div className="text-center mt-4">
                        <p className="text-sm text-slate-500 tracking-tight">
                            {!isPaymentMethodValid() && !areAllAgreementsAccepted() 
                                ? "Please select a payment method and accept all agreements to continue"
                                : !isPaymentMethodValid() 
                                    ? "Please select a valid payment method to continue"
                                    : "Please accept all payment agreements to continue"
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPaymentStep;
