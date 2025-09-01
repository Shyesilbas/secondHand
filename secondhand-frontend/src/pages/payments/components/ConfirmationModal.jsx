import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';

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

    const renderPaymentMethodDetails = () => {
        if (isLoadingPaymentMethods) {
            return (
                <div className="flex items-center justify-center py-4">
                    <LoadingIndicator size="h-6 w-6" />
                    <span className="ml-2 text-gray-600">Loading...</span>
                </div>
            );
        }

        if (paymentType === 'CREDIT_CARD') {
            const { creditCards } = paymentMethods;
            if (creditCards.length > 0) {
                return (
                    <div className="space-y-3">
                        {creditCards.map((card, index) => (
                            <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {card.number}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {card.expiryMonth}/{card.expiryYear}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatCurrency(parseFloat(card.limit) - parseFloat(card.amount), 'TRY')}
                                        </p>
                                        <p className="text-xs text-gray-500">Kullanılabilir Limit</p>
                                        <p className="text-xs text-gray-500">
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
                    <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500">Henüz kayıtlı kredi kartınız bulunmuyor.</p>
                        <button
                            onClick={() => onNavigateToPaymentMethods('CREDIT_CARD')}
                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
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
                            <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {account.holderName} {account.holderSurname}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {account.IBAN}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatCurrency(account.balance, 'TRY')}
                                        </p>
                                        <p className="text-xs text-gray-500">Bakiye</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500">Henüz kayıtlı banka hesabınız bulunmuyor.</p>
                        <button
                            onClick={() => onNavigateToPaymentMethods('TRANSFER')}
                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                            Banka Hesabı Ekle
                        </button>
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
        }
        
        return false;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
                <div className="px-6 py-5 border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/30">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {step === 'REVIEW' ? 'Ödeme Onayı' : 'Doğrulama'}
                        </h3>
                        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
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
                                <p className="text-sm font-medium text-gray-700 mb-3">Ödeme Yöntemi</p>
                                {renderPaymentMethodDetails()}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Verification Step */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">Doğrulama Kodu</label>
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
                                        className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        {isResendingCode ? 'Gönderiliyor...' : 'Kodu Yenile'}
                                    </button>
                                </div>
                                {codeExpiryTime && (
                                    <div className="text-xs text-gray-500">
                                        Kod süresi: {Math.max(0, Math.floor((new Date(codeExpiryTime).getTime() - new Date().getTime()) / 1000 / 60))} dk
                                    </div>
                                )}
                                <div>
                                    <button
                                        onClick={onShowEmails}
                                        className="text-xs text-blue-600 hover:text-blue-700"
                                    >
                                        E-postaları göster
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="px-6 py-4 border-t bg-gray-50 flex items-center gap-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-white">İptal</button>
                    {step === 'REVIEW' ? (
                        <button
                            onClick={onConfirm}
                            disabled={!isPaymentMethodAvailable() || isProcessing}
                            className="ml-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
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
