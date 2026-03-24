import {Banknote as BanknotesIcon, CreditCard as CreditCardIcon, Wallet as WalletIcon} from 'lucide-react';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import {formatCurrency} from '../../../common/formatters.js';
import { CART_PAYMENT_TYPES } from '../../cartConstants.js';

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
    const totalAmount = calculateTotal();

    const canProceed = () => {
        return isPaymentMethodValid() && areAllAgreementsAccepted();
    };

    const paymentMethods = [
        {
            id: CART_PAYMENT_TYPES.CREDIT_CARD,
            name: 'Credit/Debit Card',
            icon: CreditCardIcon,
            description: 'Pay with your credit or debit card'
        },
        {
            id: CART_PAYMENT_TYPES.TRANSFER,
            name: 'Bank Transfer',
            icon: BanknotesIcon,
            description: 'Transfer from your bank account'
        },
        {
            id: CART_PAYMENT_TYPES.EWALLET,
            name: 'E-Wallet',
            icon: WalletIcon,
            description: `Pay with e-wallet (Balance: ${formatCurrency(eWallet?.balance || 0, currency || 'TRY')})`,
        }
    ];

    const isPaymentMethodValid = () => {
        if (selectedPaymentType === CART_PAYMENT_TYPES.CREDIT_CARD) {
            return selectedCardNumber && cards?.length > 0;
        } else if (selectedPaymentType === CART_PAYMENT_TYPES.TRANSFER) {
            return selectedBankAccountIban && bankAccounts?.length > 0;
        } else if (selectedPaymentType === CART_PAYMENT_TYPES.EWALLET) {
            return eWallet && calculateTotal() <= eWallet.balance;
        }
        return false;
    };

    const handleNext = async () => {
        if (selectedPaymentType === CART_PAYMENT_TYPES.EWALLET && calculateTotal() > eWallet.balance) {
            return; // Show error
        }
        await sendVerificationCode();
        onNext();
    };

    return (
        <div className="p-5 sm:p-6 lg:p-7">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 tracking-tight mb-1">Payment</h2>
                <p className="text-sm text-slate-500">Choose how you would like to pay for this order.</p>
            </div>

            <div className="space-y-6">
                <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Amount to authorize</span>
                        <span className="text-xl font-bold text-indigo-900 tabular-nums">
                            {formatCurrency(totalAmount, currency || 'TRY')}
                        </span>
                    </div>
                </div>

                {/* Payment methods */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2.5">Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            const isSelected = selectedPaymentType === method.id;
                            const isDisabled = method.id === CART_PAYMENT_TYPES.EWALLET && (!eWallet || totalAmount > eWallet.balance);

                            return (
                                <label
                                    key={method.id}
                                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-150 ${
                                        isSelected
                                            ? 'border border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-100'
                                            : isDisabled
                                                ? 'border border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'
                                                : 'border border-slate-200 bg-white hover:border-slate-300'
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
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-slate-900">{method.name}</div>
                                        <div className="text-xs text-slate-500 truncate">{method.description}</div>
                                        {isDisabled && (
                                            <span className="text-xs font-semibold text-red-500 mt-0.5 inline-block">Insufficient balance</span>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {selectedPaymentType === CART_PAYMENT_TYPES.CREDIT_CARD && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Card Details</h4>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Card</label>
                            <select
                                value={selectedCardNumber || ''}
                                onChange={(e) => setSelectedCardNumber(e.target.value)}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
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

                {selectedPaymentType === CART_PAYMENT_TYPES.TRANSFER && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Bank Account</h4>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Account</label>
                            <select
                                value={selectedBankAccountIban || ''}
                                onChange={(e) => setSelectedBankAccountIban(e.target.value)}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
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

                {selectedPaymentType === CART_PAYMENT_TYPES.EWALLET && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-800 mb-3">E-Wallet</h4>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Available</span>
                                <span className="font-semibold text-slate-900 tabular-nums">
                                    {formatCurrency(eWallet?.balance || 0, currency || 'TRY')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Order Total</span>
                                <span className="font-semibold text-slate-900 tabular-nums">
                                    {formatCurrency(totalAmount, currency || 'TRY')}
                                </span>
                            </div>
                        </div>
                        {totalAmount > eWallet?.balance && (
                            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                                <p className="text-xs text-red-600 font-semibold">
                                    Insufficient balance. Add funds or choose another method.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <PaymentAgreementsSection
                        acceptedAgreements={acceptedAgreements}
                        onToggle={onAgreementToggle}
                        onRequiredAgreementsChange={onRequiredAgreementsChange}
                    />
                </div>
            </div>

            <div className="hidden sm:flex items-center justify-between pt-5 mt-6 border-t border-slate-100">
                <button
                    onClick={onBack}
                    className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    Back
                </button>
                <div className="flex items-center gap-3">
                    {!canProceed() && (
                        <p className="text-xs text-slate-500 max-w-[220px] text-right">
                            {!isPaymentMethodValid() ? 'Select a payment method' : 'Accept agreements to continue'}
                        </p>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-sm font-semibold transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        Send Verification Code
                    </button>
                </div>
            </div>

            <div className="sm:hidden sticky bottom-0 -mx-5 mt-6 px-5 py-3 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onBack}
                        className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        Send Code
                    </button>
                </div>
                {!canProceed() && (
                    <p className="mt-2 text-xs text-slate-500 text-center">
                        {!isPaymentMethodValid() ? 'Select a payment method' : 'Accept agreements to continue'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default CheckoutPaymentStep;
