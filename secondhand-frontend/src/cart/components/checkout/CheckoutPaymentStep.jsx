import React from 'react';
import {Banknote as BanknotesIcon, CreditCard as CreditCardIcon, Wallet as WalletIcon} from 'lucide-react';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import {formatCurrency} from '../../../common/formatters.js';

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
        <div className="p-5">
            <div className="mb-5">
                <h2 className="text-[15px] font-semibold text-gray-900 tracking-[-0.01em] mb-1">Payment</h2>
                <p className="text-[12px] text-gray-400">Choose how you'd like to pay.</p>
            </div>

            <div className="space-y-5">
                {/* Payment methods */}
                <div>
                    <h3 className="text-[12px] font-medium text-gray-500 mb-2.5">Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            const isSelected = selectedPaymentType === method.id;
                            const isDisabled = method.id === 'EWALLET' && (!eWallet || calculateTotal() > eWallet.balance);

                            return (
                                <label
                                    key={method.id}
                                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-150 ${
                                        isSelected
                                            ? 'border border-gray-900 bg-gray-50'
                                            : isDisabled
                                                ? 'border border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                                                : 'border border-gray-100 bg-white hover:border-gray-200'
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
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400'
                                    }`}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[13px] font-medium text-gray-900">{method.name}</div>
                                        <div className="text-[10px] text-gray-400 truncate">{method.description}</div>
                                        {isDisabled && (
                                            <span className="text-[10px] font-medium text-red-500 mt-0.5 inline-block">Insufficient balance</span>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {selectedPaymentType === 'CREDIT_CARD' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-[12px] font-semibold text-gray-700 mb-3">Card Details</h4>
                        <div>
                            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Select Card</label>
                            <select
                                value={selectedCardNumber || ''}
                                onChange={(e) => setSelectedCardNumber(e.target.value)}
                                className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-300 bg-white"
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
                )}

                {selectedPaymentType === 'TRANSFER' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-[12px] font-semibold text-gray-700 mb-3">Bank Account</h4>
                        <div>
                            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Select Account</label>
                            <select
                                value={selectedBankAccountIban || ''}
                                onChange={(e) => setSelectedBankAccountIban(e.target.value)}
                                className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-300 bg-white"
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
                )}

                {selectedPaymentType === 'EWALLET' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-[12px] font-semibold text-gray-700 mb-3">E-Wallet</h4>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[12px]">
                                <span className="text-gray-500">Available</span>
                                <span className="font-medium text-gray-900 tabular-nums">
                                    {formatCurrency(eWallet?.balance || 0, currency || 'TRY')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[12px]">
                                <span className="text-gray-500">Order Total</span>
                                <span className="font-medium text-gray-900 tabular-nums">
                                    {formatCurrency(calculateTotal(), currency || 'TRY')}
                                </span>
                            </div>
                        </div>
                        {calculateTotal() > eWallet?.balance && (
                            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                                <p className="text-[11px] text-red-600 font-medium">
                                    Insufficient balance. Add funds or choose another method.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                    <PaymentAgreementsSection
                        acceptedAgreements={acceptedAgreements}
                        onToggle={onAgreementToggle}
                        onRequiredAgreementsChange={onRequiredAgreementsChange}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-5 border-t border-gray-50">
                <button
                    onClick={onBack}
                    className="px-3 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Back
                </button>
                <div className="flex items-center gap-3">
                    {!canProceed() && (
                        <p className="text-[11px] text-gray-400 max-w-[200px] text-right">
                            {!isPaymentMethodValid() ? 'Select a payment method' : 'Accept agreements to continue'}
                        </p>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-[13px] font-medium transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Send Verification Code
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPaymentStep;
