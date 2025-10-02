import React from 'react';
import {CreditCardIcon, ShieldCheckIcon, ShoppingBagIcon, TruckIcon, XMarkIcon} from '@heroicons/react/24/outline';
import CheckoutSummaryStep from './CheckoutSummaryStep.jsx';
import AddressSelectionStep from './AddressSelectionStep.jsx';
import PaymentSelectionStep from './PaymentSelectionStep.jsx';

const CheckoutModal = ({
                           isOpen,
                           onClose,
                           step,
                           setStep,
                           cartItems,
                           cartCount,
                           calculateTotal,
                           addresses,
                           selectedShippingAddressId,
                           setSelectedShippingAddressId,
                           selectedBillingAddressId,
                           setSelectedBillingAddressId,
                           selectedPaymentType,
                           setSelectedPaymentType,
                           cards,
                           selectedCardNumber,
                           setSelectedCardNumber,
                           bankAccounts,
                           selectedBankAccountIban,
                           setSelectedBankAccountIban,
                           eWallet,
                           paymentVerificationCode,
                           setPaymentVerificationCode,
                           onCheckout,
                           proceedDisabled,
                           isCheckingOut,
                           showEWalletWarning,
                           onConfirmEWalletWarning,
                           sendVerificationCode,
                           emails,
                           isEmailsLoading,
                           fetchEmails
                       }) => {
    if (!isOpen) return null;

    const isPaymentMethodSelected = () => {
        if (selectedPaymentType === 'CREDIT_CARD') {
            return !!selectedCardNumber;
        } else if (selectedPaymentType === 'TRANSFER') {
            return !!selectedBankAccountIban;
        } else if (selectedPaymentType === 'EWALLET') {
            return !!eWallet;
        }
        return false;
    };

    const stepConfig = [
        { number: 1, title: 'Cart Review', icon: ShoppingBagIcon },
        { number: 2, title: 'Shipping', icon: TruckIcon },
        { number: 3, title: 'Payment', icon: CreditCardIcon },
        { number: 4, title: 'Verify', icon: ShieldCheckIcon }
    ];

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Order</h2>
                        <CheckoutSummaryStep
                            cartItems={cartItems}
                            calculateTotal={calculateTotal}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping & Billing</h2>
                        <AddressSelectionStep
                            addresses={addresses}
                            selectedShippingAddressId={selectedShippingAddressId}
                            setSelectedShippingAddressId={setSelectedShippingAddressId}
                            selectedBillingAddressId={selectedBillingAddressId}
                            setSelectedBillingAddressId={setSelectedBillingAddressId}
                        />
                    </div>
                );
            case 3:
                return (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                        <PaymentSelectionStep
                            selectedPaymentType={selectedPaymentType}
                            setSelectedPaymentType={setSelectedPaymentType}
                            cards={cards}
                            selectedCardNumber={selectedCardNumber}
                            setSelectedCardNumber={setSelectedCardNumber}
                            bankAccounts={bankAccounts}
                            selectedBankAccountIban={selectedBankAccountIban}
                            setSelectedBankAccountIban={setSelectedBankAccountIban}
                            eWallet={eWallet}
                            calculateTotal={calculateTotal}
                        />
                        <div className="mt-6 flex justify-end">
                            <button
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 flex items-center gap-2"
                                onClick={async () => {
                                    await sendVerificationCode();
                                    setStep(4);
                                }}
                                disabled={isCheckingOut || !isPaymentMethodSelected()}
                            >
                                <ShieldCheckIcon className="w-5 h-5" />
                                Proceed to Verification
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Payment</h2>
                        <p className="text-gray-600 mb-6">Enter the verification code sent to your email</p>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
                            <input
                                type="text"
                                value={paymentVerificationCode}
                                onChange={(e) => setPaymentVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg tracking-wider text-center font-mono bg-white"
                                maxLength="6"
                            />
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <h5 className="text-sm font-semibold text-gray-900">Recent Emails</h5>
                                </div>
                                <button
                                    className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1 transition-colors"
                                    onClick={fetchEmails}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {isEmailsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : (emails && emails.length > 0 ? (
                                     <div className="divide-y divide-gray-100">
                                         {([...emails]
                                             .sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt))
                                             .slice(0, 2)
                                         ).map((e, idx) => (
                                            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                        {e.sentAt || e.createdAt}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900 mb-1">
                                                    {e.subject || 'Verification Code'}
                                                </div>
                                                <div className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded-lg">
                                                    {e.body || e.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm font-medium">No emails found</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
                {/* Header */}
                 <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <ShieldCheckIcon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Secure Checkout</h3>
                            </div>
                        </div>
                        <button
                            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                            onClick={onClose}
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Progress Steps */}
                 <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 shrink-0">
                     <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {stepConfig.map((s, idx) => {
                            const Icon = s.icon;
                            const isActive = step === s.number;
                            const isCompleted = step > s.number;

                            return (
                                <React.Fragment key={s.number}>
                                     <div className="flex flex-col items-center gap-2 flex-1">
                                         <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                                            isActive ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/50' :
                                                isCompleted ? 'bg-green-500 text-white' :
                                                    'bg-gray-200 text-gray-500'
                                        }`}>
                                            {isCompleted ? (
                                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                 <Icon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-xs font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {s.title}
                                            </div>
                                        </div>
                                    </div>
                                    {idx < stepConfig.length - 1 && (
                                         <div className={`h-1 w-full max-w-[64px] rounded-full transition-all duration-300 ${
                                            step > s.number ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                 {/* Content */}
                 <div className="p-6 flex-1 overflow-y-auto">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                         <div className="lg:col-span-8">
                            {renderStepContent()}
                        </div>

                        {/* Order Summary Sidebar */}
                         <div className="lg:col-span-4">
                            <div className="sticky top-4">
                                 <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 shadow-lg">
                                     <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
                                        Order Summary
                                    </h4>
                                     <div className="space-y-2.5 mb-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Items</span>
                                            <span className="font-semibold text-gray-900">{cartCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-semibold text-gray-900">{calculateTotal().toFixed(2)} TRY</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Shipping</span>
                                            <span className="text-xs text-gray-500">Free</span>
                                        </div>
                                         <div className="border-t-2 border-dashed border-gray-300 pt-2.5 mt-2.5">
                                            <div className="flex items-center justify-between">
                                                 <span className="text-sm font-bold text-gray-900">Total</span>
                                                 <span className="text-xl font-bold text-blue-600">{calculateTotal().toFixed(2)} TRY</span>
                                            </div>
                                        </div>
                                    </div>
                                     <div className="bg-blue-50 rounded-lg p-2.5 mt-3">
                                         <p className="text-xs text-blue-800 flex items-start gap-2">
                                            <ShieldCheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>Your payment information is secure and encrypted</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                 {/* Footer */}
                 <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <button
                        className="px-5 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 font-medium transition-all duration-200 flex items-center gap-2"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {step > 1 ? 'Back' : 'Cancel'}
                    </button>
                    {step < 3 ? (
                        <button
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:shadow-none"
                            onClick={() => setStep(step + 1)}
                            disabled={
                                (step === 1 && cartCount === 0) ||
                                (step === 2 && (!selectedShippingAddressId || !selectedBillingAddressId))
                            }
                        >
                            Continue
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : step === 4 ? (
                        <button
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 disabled:shadow-none"
                            onClick={onCheckout}
                            disabled={proceedDisabled || isCheckingOut || !paymentVerificationCode}
                        >
                            {isCheckingOut ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <ShieldCheckIcon className="w-5 h-5" />
                                    Complete Payment
                                </>
                            )}
                        </button>
                    ) : null}
                </div>
            </div>

            {/* eWallet Warning Modal */}
            {showEWalletWarning && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slideUp">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                            <h4 className="text-xl font-bold text-white flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Spending Warning
                            </h4>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-6 leading-relaxed">
                                Your eWallet spending warning limit has been reached or exceeded with this purchase. Do you want to proceed?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-500/30 transition-all"
                                    onClick={onConfirmEWalletWarning}
                                >
                                    Proceed Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

export default CheckoutModal;