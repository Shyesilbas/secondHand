import React from 'react';
import { formatCurrency } from '../../common/formatters.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';

const ConfirmationModal = ({
    selectedListing,
    feeConfig,
    paymentType,
    paymentMethods,
    isLoadingPaymentMethods,
    onConfirm,
    onCancel,
    onNavigateToPaymentMethods,
    step = 'REVIEW',
    isProcessing = false,
    verificationCode = '',
    onChangeVerificationCode = () => {},
    codeExpiryTime,
    onShowEmails,
    onResendCode,
    isResendingCode = false
}) => {
    const formatPrice = (price, currency = 'TRY') => formatCurrency(price, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const { eWallet } = useEWallet();

    const renderPaymentMethodDetails = () => {
        if (isLoadingPaymentMethods) {
            return (
                <div className="flex items-center justify-center py-4">
                    <LoadingIndicator size="h-6 w-6" />
                    <span className="ml-2 text-text-secondary">Loading...</span>
                </div>
            );
        }

        if (paymentType === 'CREDIT_CARD') {
            const { creditCards } = paymentMethods;
            if (creditCards.length > 0) {
                return (
                    <div className="space-y-3">
                        {creditCards.map((card, index) => (
                            <div key={index} className="border rounded-lg p-3 bg-app-bg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-text-primary">
                                            {card.number}
                                        </p>
                                        <p className="text-sm text-text-secondary">
                                            {card.expiryMonth}/{card.expiryYear}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-text-primary">
                                            {formatCurrency(parseFloat(card.limit) - parseFloat(card.amount), 'TRY')}
                                        </p>
                                        <p className="text-xs text-text-muted">Kullanılabilir Limit</p>
                                        <p className="text-xs text-text-muted">
                                            Toplam: {formatCurrency(card.limit, 'TRY')} | Kullanılan: {formatCurrency(card.amount, 'TRY')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className="text-center py-4 border border-dashed border-header-border rounded-lg">
                        <p className="text-text-muted">Henüz kayıtlı kredi kartınız bulunmuyor.</p>
                        <button
                            onClick={() => onNavigateToPaymentMethods('CREDIT_CARD')}
                            className="mt-2 text-btn-primary hover:text-blue-700 text-sm"
                        >
                            Kredi Kartı Ekle
                        </button>
                    </div>
                );
            }
        } else if (paymentType === 'TRANSFER') {
            const { bankAccounts } = paymentMethods;
            if (bankAccounts.length > 0) {
                return (
                    <div className="space-y-3">
                        {bankAccounts.map((account, index) => (
                            <div key={index} className="border rounded-lg p-3 bg-app-bg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-text-primary">
                                            {account.holderName} {account.holderSurname}
                                        </p>
                                        <p className="text-sm text-text-secondary">
                                            {account.IBAN}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-text-primary">
                                            {formatCurrency(account.balance, 'TRY')}
                                        </p>
                                        <p className="text-xs text-text-muted">Bakiye</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className="text-center py-4 border border-dashed border-header-border rounded-lg">
                        <p className="text-text-muted">Henüz kayıtlı banka hesabınız bulunmuyor.</p>
                        <button
                            onClick={() => onNavigateToPaymentMethods('TRANSFER')}
                            className="mt-2 text-btn-primary hover:text-blue-700 text-sm"
                        >
                            Banka Hesabı Ekle
                        </button>
                    </div>
                );
            }
        } else if (paymentType === 'EWALLET') {
            if (eWallet) {
                const hasSufficientBalance = eWallet.balance >= feeConfig?.totalCreationFee;
                return (
                    <div className="space-y-3">
                        <div className={`border rounded-lg p-4 ${hasSufficientBalance ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${hasSufficientBalance ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <svg className={`w-6 h-6 ${hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">eWallet</p>
                                        <p className="text-sm text-gray-600">Digital Wallet</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-gray-900">
                                        {formatPrice(eWallet.balance, 'TRY')}
                                    </p>
                                    <p className={`text-sm ${hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`}>
                                        {hasSufficientBalance ? 'Sufficient Balance' : 'Insufficient Balance'}
                                    </p>
                                </div>
                            </div>
                            {!hasSufficientBalance && (
                                <div className="mt-3 p-2 bg-red-100 rounded border border-red-200">
                                    <p className="text-sm text-red-800">
                                        You need {formatPrice(feeConfig?.totalCreationFee - eWallet.balance, 'TRY')} more to complete this payment.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="text-center py-4 border border-dashed border-header-border rounded-lg">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <p className="text-text-muted mb-2">eWallet not found</p>
                        <p className="text-sm text-text-muted">You need to create an eWallet first to use this payment method.</p>
                    </div>
                );
            }
        }

        return null;
    };

    const isPaymentMethodAvailable = () => {
        if (isLoadingPaymentMethods) return false;
        
        if (paymentType === 'CREDIT_CARD') {
            return paymentMethods.creditCards.length > 0;
        } else if (paymentType === 'TRANSFER') {
            return paymentMethods.bankAccounts.length > 0;
        } else if (paymentType === 'EWALLET') {
            return eWallet && eWallet.balance >= feeConfig?.totalCreationFee;
        }
        
        return false;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
                <div className="px-6 py-5 border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/30">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-text-primary">
                            {step === 'REVIEW' ? 'Ödeme Onayı' : 'Doğrulama'}
                        </h3>
                        <button onClick={onCancel} className="text-text-muted hover:text-text-secondary">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="px-6 py-5">
                    {/* Listing Summary */}
                    <div className="mb-5 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-700/70">İlan</p>
                                <p className="text-sm font-medium text-blue-900">{selectedListing?.title}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-blue-700/70">Tutar</p>
                                <p className="text-sm font-semibold text-blue-900">{feeConfig ? formatPrice(feeConfig.totalCreationFee) : ''}</p>
                            </div>
                        </div>
                    </div>

                    {step === 'REVIEW' ? (
                        <>
                            {/* Payment Method Details */}
                            <div className="mb-6">
                                <p className="text-sm font-medium text-text-secondary mb-3">Ödeme Yöntemi</p>
                                {renderPaymentMethodDetails()}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Verification Step */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-text-secondary">Doğrulama Kodu</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            onChangeVerificationCode(value);
                                        }}
                                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="6 haneli kod"
                                        maxLength={6}
                                    />
                                    <button
                                        onClick={onResendCode}
                                        disabled={isResendingCode}
                                        className="px-3 py-2 rounded-lg border text-sm hover:bg-app-bg disabled:opacity-50"
                                    >
                                        {isResendingCode ? 'Gönderiliyor...' : 'Kodu Yenile'}
                                    </button>
                                </div>
                                {codeExpiryTime && (
                                    <div className="text-xs text-text-muted">
                                        Kod süresi: {Math.max(0, Math.floor((new Date(codeExpiryTime).getTime() - new Date().getTime()) / 1000 / 60))} dk
                                    </div>
                                )}
                                <div>
                                    <button
                                        onClick={onShowEmails}
                                        className="text-xs text-btn-primary hover:text-blue-700"
                                    >
                                        E-postaları göster
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="px-6 py-4 border-t bg-app-bg flex items-center gap-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg border text-text-secondary hover:bg-white">İptal</button>
                    {step === 'REVIEW' ? (
                        <button
                            onClick={onConfirm}
                            disabled={!isPaymentMethodAvailable() || isProcessing}
                            className="ml-auto px-4 py-2 rounded-lg bg-btn-primary text-white hover:bg-btn-primary-hover disabled:opacity-50"
                        >
                            {isProcessing ? 'İşleniyor...' : 'Ödemeyi Başlat'}
                        </button>
                    ) : (
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing || (verificationCode || '').length !== 6}
                            className="ml-auto px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            {isProcessing ? 'Doğrulanıyor...' : 'Doğrula ve Öde'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
