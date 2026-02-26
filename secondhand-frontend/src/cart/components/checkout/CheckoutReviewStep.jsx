import {formatCurrency} from '../../../common/formatters.js';
import ListingReviewStats from '../../../reviews/components/ListingReviewStats.jsx';
import {useSellerReviewStatsCache} from '../../../reviews/hooks/useSellerReviewStatsCache.js';
import {Star as StarIcon} from 'lucide-react';

const SellerRating = ({ sellerId }) => {
    const { stats, loading } = useSellerReviewStatsCache(sellerId);
    
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
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tighter">Review Your Order</h2>
                <p className="text-slate-500 tracking-tight">Please review your items and quantities before proceeding.</p>
            </div>

            {/* Items List */}
            <div className="space-y-4 mb-8">
                {cartItems.map((item) => {
                    const isOffer = !!item.isOffer;
                    const hasCampaign = !isOffer && item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
                    const unitPrice = isOffer
                        ? (item.offerTotalPrice != null && item.quantity ? (parseFloat(item.offerTotalPrice) / item.quantity) : item.listing.price)
                        : (hasCampaign ? item.listing.campaignPrice : item.listing.price);
                    const lineTotal = isOffer
                        ? (parseFloat(item.offerTotalPrice) || 0)
                        : (parseFloat(unitPrice) * item.quantity);
                    return (
                        <div key={item.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                <div className="w-20 h-20 sm:w-20 sm:h-20 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden">
                                    {item.listing.imageUrl ? (
                                        <img src={item.listing.imageUrl} alt={item.listing.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-semibold text-slate-600">
                                            {item.listing.title.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-medium text-gray-900 truncate">
                                            {item.listing.title}
                                        </h3>
                                        {isOffer && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                                Offer
                                            </span>
                                        )}
                                    </div>
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
                                <div className="text-right flex-shrink-0 sm:self-end">
                                    <div className="text-lg font-bold tabular-nums text-slate-900">
                                        {formatCurrency(lineTotal, item.listing.currency)}
                                    </div>
                                    <div className="text-sm text-slate-500 tabular-nums mt-0.5">
                                        <div className="flex flex-col items-end">
                                            <span>{item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}</span>
                                            {hasCampaign && (
                                                <span className="text-xs text-emerald-600 font-medium mt-0.5">{item.listing.campaignName || 'Campaign applied'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold transition-colors tracking-tight"
                >
                    Back to Cart
                </button>
                <button
                    onClick={onNext}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg tracking-tight"
                >
                    Continue to Address
                </button>
            </div>
        </div>
    );
};

export default CheckoutReviewStep;
