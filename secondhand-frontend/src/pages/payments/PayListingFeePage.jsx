import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { listingService } from '../../features/listings/services/listingService';
import { paymentService } from '../../features/payments/services/paymentService';

const PayListingFeePage = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [draftListings, setDraftListings] = useState([]);
    const [feeConfig, setFeeConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfigLoading, setIsConfigLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedListing, setSelectedListing] = useState(null);
    const [paymentType, setPaymentType] = useState('CREDIT_CARD');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        fetchDraftListings();
        fetchFeeConfig();
    }, []);

    const fetchFeeConfig = async () => {
        try {
            setIsConfigLoading(true);
            const config = await paymentService.getListingFeeConfig();
            setFeeConfig(config);
        } catch (err) {
            console.error('Failed to fetch fee config:', err);
            showError('Failed to load fee configuration. Please refresh the page.');
        } finally {
            setIsConfigLoading(false);
        }
    };

    const fetchDraftListings = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await listingService.getMyListingsByStatus('DRAFT');
            setDraftListings(data);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while fetching listings. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!selectedListing) {
            showError('Please select a listing to pay for.');
            return;
        }

        if (!feeConfig) {
            showError('Fee configuration not loaded. Please refresh the page.');
            return;
        }

        setIsProcessingPayment(true);
        try {
            await paymentService.payListingFee({
                listingId: selectedListing.id,
                paymentType: paymentType
            });

            // Payment successful
            showSuccess('Listing fee payment successful! Your listing will be published.');
            
            // Refresh listings
            await fetchDraftListings();
            setSelectedListing(null);
            
        } catch (err) {
            showError(err.response?.data?.message || 'Listing fee payment failed. Please try again later.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const formatPrice = (price, currency = 'TRY') => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg border p-6">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Geri Dön
                </button>
                
                <h1 className="text-3xl font-bold text-gray-900">
                    Listing Fee Payment
                </h1>
                <p className="text-gray-600 mt-2">
                    You can pay the listing fee for your draft listings here.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {draftListings.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Draft Listings
                    </h3>
                    <p className="text-gray-600 mb-4">
                        No draft listings found. You can create a new listing by clicking the button below.
                    </p>
                    <button
                        onClick={() => navigate('/listings/create')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                       Create Listing
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Listings List */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Draft Listings ({draftListings.length})
                        </h2>
                        
                        <div className="space-y-4">
                            {draftListings.map((listing) => (
                                <div
                                    key={listing.id}
                                    className={`bg-white rounded-lg border p-6 cursor-pointer transition-all ${
                                        selectedListing?.id === listing.id
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setSelectedListing(listing)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {listing.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {listing.description}
                                            </p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>{formatPrice(listing.price, listing.currency)}</span>
                                                <span>•</span>
                                                <span>{listing.city}</span>
                                                <span>•</span>
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                                    Draft
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="ml-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                selectedListing?.id === listing.id
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300'
                                            }`}>
                                                {selectedListing?.id === listing.id && (
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Panel */}
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
                                        {isConfigLoading ? (
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                        ) : feeConfig ? (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Listing Fee:</span>
                                                    <span className="font-semibold">{formatPrice(feeConfig.creationFee)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Tax ({feeConfig.taxPercentage}%):</span>
                                                    <span className="font-semibold">{formatPrice(feeConfig.creationFeeTax)}</span>
                                                </div>
                                                <hr />
                                                <div className="flex justify-between text-lg">
                                                    <span className="font-semibold">Total:</span>
                                                    <span className="font-bold text-blue-600">
                                                        {formatPrice(feeConfig.totalCreationFee)}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-red-600 text-center">
                                                Failed to load fee configuration
                                            </div>
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
                                                    onChange={(e) => setPaymentType(e.target.value)}
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
                                                    onChange={(e) => setPaymentType(e.target.value)}
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
                                        onClick={handlePayment}
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
                </div>
            )}
        </div>
    );
};

export default PayListingFeePage;