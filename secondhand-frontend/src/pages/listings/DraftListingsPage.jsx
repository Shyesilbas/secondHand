import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { listingService } from '../../features/listings/services/listingService';
import { formatCurrency } from '../../utils/formatters';
import ListingCardActions from '../../features/listings/components/ListingCardActions';

const DraftListingsPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [draftListings, setDraftListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDraftListings();
    }, []);

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

    const formatPrice = (price, currency = 'TRY') => formatCurrency(price, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
                    Go Back
                </button>
                
                <h1 className="text-3xl font-bold text-gray-900">
                    Draft Listings
                </h1>
                <p className="text-gray-600 mt-2">
                    Manage your draft listings. You can edit, delete, or pay the listing fee to publish them.
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                <div className="space-y-4">
                    {draftListings.map((listing) => (
                        <div
                            key={listing.id}
                            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all"
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
                                
                                <div className="ml-4 flex flex-col items-end gap-2">
                                    <ListingCardActions listing={listing} onChanged={() => fetchDraftListings()} />
                                    <button
                                        onClick={() => navigate(`/payments/listing-fee?listingId=${listing.id}`)}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                                        title="Pay Listing Fee"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>Pay Fee</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DraftListingsPage;
