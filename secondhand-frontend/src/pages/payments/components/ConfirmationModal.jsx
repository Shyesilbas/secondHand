import React from 'react';
import { formatCurrency } from '../../../utils/formatters';

const ConfirmationModal = ({
    selectedListing,
    feeConfig,
    paymentType,
    paymentMethods,
    isLoadingPaymentMethods,
    onConfirm,
    onCancel,
    onNavigateToPaymentMethods
}) => {
    const formatPrice = (price, currency = 'TRY') => formatCurrency(price, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const renderPaymentMethodDetails = () => {
        if (isLoadingPaymentMethods) {
            return (
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Yükleniyor...</span>
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
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ödeme Onayı
                </h3>
                
                {/* Listing Info */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">İlan:</p>
                    <p className="font-medium text-gray-900">{selectedListing?.title}</p>
                    <p className="text-sm text-gray-600 mt-1">Tutar: <span className="font-semibold text-blue-600">{feeConfig ? formatPrice(feeConfig.totalCreationFee) : ''}</span></p>
                </div>

                {/* Payment Method Details */}
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Ödeme Yöntemi:</p>
                    {renderPaymentMethodDetails()}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!isPaymentMethodAvailable()}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Onayla
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
