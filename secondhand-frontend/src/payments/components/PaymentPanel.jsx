import React from 'react';
import { formatCurrency } from '../../common/formatters.js';

const PaymentPanel = ({
    selectedListing,
    feeConfig,
    paymentType,
    onPaymentTypeChange,
    isProcessingPayment,
    onPayment,
    
}) => {
    const formatPrice = (price, currency = 'TRY') => formatCurrency(price, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
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
                                        <span className="text-gray-600">Listing Fee:</span>
                                        <span className="font-semibold">{formatPrice(feeConfig.creationFee)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax ({feeConfig.taxPercentage}%):</span>
                                        <span className="font-semibold">{formatPrice(feeConfig.creationFee * feeConfig.taxPercentage / 100)}</span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between text-lg">
                                        <span className="font-semibold">Total:</span>
                                        <span className="font-bold text-blue-600">
                                            {formatPrice(feeConfig.totalCreationFee)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Payment Type:
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentType"
                                        value="CREDIT_CARD"
                                        checked={paymentType === 'CREDIT_CARD'}
                                        onChange={(e) => onPaymentTypeChange(e.target.value)}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="ml-3 flex items-center">
                                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-900">
                                            Credit Card
                                        </span>
                                    </div>
                                </label>
                                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentType"
                                        value="TRANSFER"
                                        checked={paymentType === 'TRANSFER'}
                                        onChange={(e) => onPaymentTypeChange(e.target.value)}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="ml-3 flex items-center">
                                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-900">
                                            Bank Wire
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={onPayment}
                            disabled={isProcessingPayment}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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

                        <p className="text-xs text-gray-500 mt-3 text-center">
                           After successful payment, your listing will be published.
                        </p>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-500 text-sm">
                            Chose a listing to pay the listing fee.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPanel;
