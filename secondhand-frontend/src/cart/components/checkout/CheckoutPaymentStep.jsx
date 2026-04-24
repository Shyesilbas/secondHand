import {Banknote as BanknotesIcon, CreditCard as CreditCardIcon, Wallet as WalletIcon, Check} from 'lucide-react';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import {formatCurrency} from '../../../common/formatters.js';
import { CART_PAYMENT_TYPES } from '../../cartConstants.js';

const getCardSelectValue = (card) => (
    card?.id
    || card?.cardId
    || card?.number
    || card?.cardNumber
    || null
);

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
    const cur = currency || 'TRY';

    const canProceed = () => {
        return isPaymentMethodValid() && areAllAgreementsAccepted();
    };

    const paymentMethods = [
        {
            id: CART_PAYMENT_TYPES.CREDIT_CARD,
            name: 'Card',
            icon: CreditCardIcon,
            sub: 'Credit / Debit'
        },
        {
            id: CART_PAYMENT_TYPES.TRANSFER,
            name: 'Transfer',
            icon: BanknotesIcon,
            sub: 'Bank account'
        },
        {
            id: CART_PAYMENT_TYPES.EWALLET,
            name: 'Wallet',
            icon: WalletIcon,
            sub: formatCurrency(eWallet?.balance || 0, cur),
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
            return;
        }
        await sendVerificationCode();
        onNext();
    };

    const isEWalletDisabled = !eWallet || totalAmount > (eWallet?.balance || 0);

    // Inline detail panel content
    const renderDetail = () => {
        if (selectedPaymentType === CART_PAYMENT_TYPES.CREDIT_CARD) {
            return (
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Select Card</label>
                    <select
                        value={selectedCardNumber || ''}
                        onChange={(e) => setSelectedCardNumber(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm font-semibold border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
                    >
                        <option value="">Choose a card</option>
                        {cards?.map((card, index) => (
                            <option key={getCardSelectValue(card) || `card-${index}`} value={getCardSelectValue(card) || ''}>
                                •••• •••• •••• {card.number?.slice(-4) || card.cardNumber?.slice(-4) || card.last4 || 'XXXX'}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }
        if (selectedPaymentType === CART_PAYMENT_TYPES.TRANSFER) {
            return (
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Select Account</label>
                    <select
                        value={selectedBankAccountIban || ''}
                        onChange={(e) => setSelectedBankAccountIban(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm font-semibold border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
                    >
                        <option value="">Choose an account</option>
                        {bankAccounts?.map((account, index) => (
                            <option key={account.id || `account-${index}`} value={account.IBAN}>
                                •••• {account.IBAN?.slice(-4)}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }
        if (selectedPaymentType === CART_PAYMENT_TYPES.EWALLET) {
            return (
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-medium">Available</span>
                        <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(eWallet?.balance || 0, cur)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-medium">Order Total</span>
                        <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(totalAmount, cur)}</span>
                    </div>
                    {totalAmount > (eWallet?.balance || 0) && (
                        <div className="mt-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-[11px] text-red-600 font-bold">Insufficient balance. Add funds or choose another method.</p>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4 sm:p-5">
            {/* Top row: title + amount badge */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Payment</h2>
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
                    <span className="text-sm font-extrabold text-indigo-900 tabular-nums">{formatCurrency(totalAmount, cur)}</span>
                </div>
            </div>

            {/* Method selector + detail — 2 column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 mb-4">
                {/* Left: method cards */}
                <div className="flex gap-2.5">
                    {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        const isSelected = selectedPaymentType === method.id;
                        const isDisabled = method.id === CART_PAYMENT_TYPES.EWALLET && isEWalletDisabled;

                        return (
                            <label
                                key={method.id}
                                className={`relative flex-1 p-3.5 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden group flex flex-col items-center justify-center text-center gap-2 ${
                                    isSelected
                                        ? 'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 scale-[1.02] border-transparent'
                                        : isDisabled
                                            ? 'bg-slate-50 border-2 border-slate-100 cursor-not-allowed opacity-50'
                                            : 'bg-white border-2 border-slate-100 hover:border-indigo-200 hover:shadow-md'
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
                                {isSelected && (
                                    <div className="absolute -top-8 -left-8 w-20 h-20 bg-white/15 rounded-full blur-xl z-0 pointer-events-none" />
                                )}
                                <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:text-indigo-500 group-hover:bg-indigo-50'
                                }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="relative z-10">
                                    <div className={`text-xs font-extrabold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>{method.name}</div>
                                    <div className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{method.sub}</div>
                                </div>
                            </label>
                        );
                    })}
                </div>

                {/* Right: inline detail */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center">
                    <div className="w-full">
                        {renderDetail() || (
                            <p className="text-xs text-slate-400 text-center font-medium py-2">Select a payment method</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Agreements — compact */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 mb-1">
                <PaymentAgreementsSection
                    acceptedAgreements={acceptedAgreements}
                    onToggle={onAgreementToggle}
                    onRequiredAgreementsChange={onRequiredAgreementsChange}
                />
            </div>

            {/* Actions */}
            <div className="hidden sm:flex items-center justify-between pt-4 mt-3 border-t border-slate-200/60">
                <button
                    onClick={onBack}
                    className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                    Back
                </button>
                <div className="flex items-center gap-3">
                    {!canProceed() && (
                        <p className="text-xs text-slate-500 max-w-[220px] text-right font-medium">
                            {!isPaymentMethodValid() ? 'Select a payment method' : 'Accept agreements to continue'}
                        </p>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 text-sm font-bold shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Send Verification Code
                    </button>
                </div>
            </div>

            <div className="sm:hidden sticky bottom-0 -mx-4 mt-4 px-4 py-3.5 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onBack}
                        className="px-4 py-3 rounded-2xl border-2 border-slate-200/80 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/25 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                    >
                        Send Code
                    </button>
                </div>
                {!canProceed() && (
                    <p className="mt-2 text-xs font-medium text-slate-500 text-center">
                        {!isPaymentMethodValid() ? 'Select a payment method' : 'Accept agreements to continue'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default CheckoutPaymentStep;
