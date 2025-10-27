import React, { useState } from 'react';
import { CreditCardIcon, BanknotesIcon, WalletIcon } from '@heroicons/react/24/outline';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';

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
    onNext,
    onBack,
    sendVerificationCode,
    acceptedAgreements,
    onAgreementToggle,
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
            description: `Pay with e-wallet (Balance: $${eWallet?.balance || 0})`
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
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-medium text-gray-900 mb-2">Payment Method</h2>
                <p className="text-gray-600">Choose how you'd like to pay for your order.</p>
            </div>

            <div className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Select Payment Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            const isSelected = selectedPaymentType === method.id;
                            const isDisabled = method.id === 'EWALLET' && (!eWallet || calculateTotal() > eWallet.balance);

                            return (
                                <label
                                    key={method.id}
                                    className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : isDisabled
                                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                                : 'border-gray-200 hover:border-gray-300'
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
                                        <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                                            isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="font-medium text-gray-900">{method.name}</div>
                                        <div className="text-sm text-gray-500 mt-1">{method.description}</div>
                                        {isDisabled && (
                                            <div className="text-xs text-red-500 mt-2">Insufficient balance</div>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Payment Details */}
                {selectedPaymentType === 'CREDIT_CARD' && (
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Card Details</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Card
                                </label>
                                <select
                                    value={selectedCardNumber || ''}
                                    onChange={(e) => setSelectedCardNumber(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Bank Account</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Account
                                </label>
                                <select
                                    value={selectedBankAccountIban || ''}
                                    onChange={(e) => setSelectedBankAccountIban(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">E-Wallet Balance</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Available Balance</span>
                            <span className="text-lg font-medium text-gray-900">
                                ${eWallet?.balance || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-gray-600">Order Total</span>
                            <span className="text-lg font-medium text-gray-900">
                                ${calculateTotal()}
                            </span>
                        </div>
                        {calculateTotal() > eWallet?.balance && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">
                                    Insufficient balance. Please add funds or choose another payment method.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Payment Agreements */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <PaymentAgreementsSection 
                        acceptedAgreements={acceptedAgreements}
                        onToggle={onAgreementToggle}
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send Verification Code
                </button>
                
                {/* Help text */}
                {!canProceed() && (
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-500">
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
