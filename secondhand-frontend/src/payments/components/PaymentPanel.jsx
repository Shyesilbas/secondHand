import React from 'react';
import { formatCurrency } from '../../common/formatters.js';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';

const PaymentPanel = ({
    selectedListing,
    feeConfig,
    paymentType,
    onPaymentTypeChange,
    isProcessingPayment,
    onPayment,
    
}) => {
    const formatPrice = (price, currency = 'TRY') => formatCurrency(price, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const { eWallet, checkBalance } = useEWallet();

    return (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-4">
                <h3 className="text-xl font-semibold text-text-primary mb-6">
                    Payment Panel
                </h3>

                {selectedListing ? (
                    <>
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">
                                Chosen Listing
                            </h4>
                            <p className="text-blue-800 text-sm">
                                {selectedListing.title}
                            </p>
                        </div>

                        <div className="space-y-4 mb-6">
                            {!feeConfig ? (
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary">Listing Fee:</span>
                                        <span className="font-semibold">{formatPrice(feeConfig.creationFee)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary">Tax ({feeConfig.taxPercentage}%):</span>
                                        <span className="font-semibold">{formatPrice(feeConfig.creationFee * feeConfig.taxPercentage / 100)}</span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between text-lg">
                                        <span className="font-semibold">Total:</span>
                                        <span className="font-bold text-btn-primary">
                                            {formatPrice(feeConfig.totalCreationFee)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-secondary mb-3">
                                Payment Type:
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center p-3 border border-header-border rounded-lg cursor-pointer hover:bg-app-bg">
                                    <input
                                        type="radio"
                                        name="paymentType"
                                        value="CREDIT_CARD"
                                        checked={paymentType === 'CREDIT_CARD'}
                                        onChange={(e) => onPaymentTypeChange(e.target.value)}
                                        className="text-btn-primary focus:ring-blue-500"
                                    />
                                    <div className="ml-3 flex items-center">
                                        <svg className="w-5 h-5 text-btn-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        <span className="text-sm font-medium text-text-primary">
                                            Credit Card
                                        </span>
                                    </div>
                                </label>
                                <label className="flex items-center p-3 border border-header-border rounded-lg cursor-pointer hover:bg-app-bg">
                                    <input
                                        type="radio"
                                        name="paymentType"
                                        value="TRANSFER"
                                        checked={paymentType === 'TRANSFER'}
                                        onChange={(e) => onPaymentTypeChange(e.target.value)}
                                        className="text-btn-primary focus:ring-blue-500"
                                    />
                                    <div className="ml-3 flex items-center">
                                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span className="text-sm font-medium text-text-primary">
                                            Bank Wire
                                        </span>
                                    </div>
                                </label>
                                <label className="flex items-center p-3 border border-header-border rounded-lg cursor-pointer hover:bg-app-bg">
                                    <input
                                        type="radio"
                                        name="paymentType"
                                        value="EWALLET"
                                        checked={paymentType === 'EWALLET'}
                                        onChange={(e) => onPaymentTypeChange(e.target.value)}
                                        className="text-btn-primary focus:ring-blue-500"
                                    />
                                    <div className="ml-3 flex items-center">
                                        <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-text-primary">
                                                eWallet
                                            </span>
                                            {eWallet && (
                                                <span className="text-xs text-text-muted">
                                                    Balance: {formatPrice(eWallet.balance)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* eWallet Balance Warning */}
                        {paymentType === 'EWALLET' && feeConfig && eWallet && (
                            <div className="mb-4">
                                {eWallet.balance >= feeConfig.totalCreationFee ? (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm text-green-800">
                                                Sufficient balance available for payment
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm text-red-800">
                                                Insufficient balance. You need {formatPrice(feeConfig.totalCreationFee - eWallet.balance)} more.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={onPayment}
                            disabled={
                                isProcessingPayment || 
                                (paymentType === 'EWALLET' && eWallet && eWallet.balance < feeConfig?.totalCreationFee)
                            }
                            className="w-full bg-btn-primary text-white py-3 px-4 rounded-lg hover:bg-btn-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isProcessingPayment ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                   Processing...
                                </div>
                            ) : (
                                feeConfig ? `Pay ${formatPrice(feeConfig.totalCreationFee)}` : 'Pay Listing Fee'
                            )}
                        </button>

                        <p className="text-xs text-text-muted mt-3 text-center">
                           After successful payment, your listing will be published.
                        </p>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <svg className="w-12 h-12 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-text-muted text-sm">
                            Chose a listing to pay the listing fee.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPanel;
