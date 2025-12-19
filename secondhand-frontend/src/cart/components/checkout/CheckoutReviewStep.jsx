import React from 'react';
import { formatCurrency } from '../../../common/formatters.js';
import ListingReviewStats from '../../../reviews/components/ListingReviewStats.jsx';
import { useUserReviewStats } from '../../../reviews/hooks/useReviews.js';
import { StarIcon } from '@heroicons/react/24/solid';

const SellerRating = ({ sellerId }) => {
    const { stats, loading } = useUserReviewStats(sellerId);
    
    if (loading || !stats || stats.totalReviews === 0) {
        return null;
    }

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        
        return Array.from({ length: 5 }, (_, index) => {
            return (
                <StarIcon 
                    key={index} 
                    className={`w-3 h-3 ${index < fullStars ? 'text-yellow-400' : 'text-gray-300'}`} 
                />
            );
        });
    };

    return (
        <div className="flex items-center space-x-1">
            <div className="flex items-center">
                {renderStars(stats.averageRating)}
            </div>
            <span className="text-xs text-gray-600">
                {stats.averageRating.toFixed(1)} ({stats.totalReviews})
            </span>
        </div>
    );
};

const CheckoutReviewStep = ({ cartItems, calculateTotal, onNext, onBack }) => {
    // No need to call hooks here since we moved them to SellerRating component

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-medium text-gray-900 mb-2">Review Your Order</h2>
                <p className="text-gray-600">Please review your items and quantities before proceeding.</p>
            </div>

            {/* Items List */}
            <div className="space-y-4 mb-8">
                {cartItems.map((item) => {
                    const hasCampaign = item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
                    const unitPrice = hasCampaign ? item.listing.campaignPrice : item.listing.price;
                    return (
                        <div key={item.id} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg font-medium text-gray-600">
                                        {item.listing.title.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-medium text-gray-900 truncate mb-2">
                                        {item.listing.title}
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">
                                            {item.listing.type} • {item.listing.city}{item.listing.district ? `, ${item.listing.district}` : ''}
                                        </p>
                                        {item.listing.reviewStats && item.listing.reviewStats.totalReviews > 0 && (
                                            <div className="flex items-center space-x-2">
                                                <ListingReviewStats listing={item.listing} listingId={item.listing.id} size="xs" showIcon showText />
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-4 pt-2 border-t border-gray-200 mt-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-blue-700">
                                                        {item.listing.sellerName?.charAt(0)?.toUpperCase() || 'S'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Sold by</p>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {item.listing.sellerName} {item.listing.sellerSurname}
                                                        </p>
                                                        <SellerRating sellerId={item.listing.sellerId} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-lg font-medium text-gray-900">
                                        {formatCurrency(parseFloat(unitPrice) * item.quantity, item.listing.currency)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        <div className="flex flex-col items-end">
                                            <span>{item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}</span>
                                            {hasCampaign && (
                                                <span className="text-xs text-emerald-700 font-medium">{item.listing.campaignName || 'Campaign applied'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                    Back to Cart
                </button>
                <button
                    onClick={onNext}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                    Continue to Address
                </button>
            </div>
        </div>
    );
};

export default CheckoutReviewStep;
