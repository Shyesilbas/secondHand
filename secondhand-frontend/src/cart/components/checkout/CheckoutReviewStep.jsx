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
    return (
        <div className="p-5">
            <div className="mb-5">
                <h2 className="text-[15px] font-semibold text-gray-900 tracking-[-0.01em] mb-1">Review Your Order</h2>
                <p className="text-[12px] text-gray-400">Verify items and quantities before continuing.</p>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-5">
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
                        <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 rounded-lg border border-gray-50">
                            {/* Image */}
                            <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                                {item.listing.imageUrl ? (
                                    <img src={item.listing.imageUrl} alt={item.listing.title} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[13px] font-medium text-gray-400">
                                        {item.listing.title.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <h3 className="text-[13px] font-medium text-gray-900 truncate">{item.listing.title}</h3>
                                    {isOffer && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium text-emerald-700 bg-emerald-50 shrink-0">Offer</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                    <span>{item.listing.type} · {item.listing.city}</span>
                                    {(item.listing.sellerName || item.listing.sellerSurname) && (
                                        <>
                                            <span className="w-px h-3 bg-gray-100" />
                                            <span>{item.listing.sellerName} {item.listing.sellerSurname}</span>
                                            <SellerRating sellerId={item.listing.sellerId} />
                                        </>
                                    )}
                                </div>
                                {item.listing.reviewStats && item.listing.reviewStats.totalReviews > 0 && (
                                    <div className="mt-0.5">
                                        <ListingReviewStats listing={item.listing} listingId={item.listing.id} size="xs" showIcon showText />
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div className="text-right shrink-0">
                                <div className="text-[13px] font-semibold text-gray-900 tabular-nums">
                                    {formatCurrency(lineTotal, item.listing.currency)}
                                </div>
                                <div className="text-[10px] text-gray-400 tabular-nums mt-0.5">
                                    {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                                </div>
                                {hasCampaign && (
                                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">{item.listing.campaignName || 'Campaign'}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <button
                    onClick={onBack}
                    className="px-3 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Back to Cart
                </button>
                <button
                    onClick={onNext}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-[13px] font-medium transition-colors"
                >
                    Continue to Address
                </button>
            </div>
        </div>
    );
};

export default CheckoutReviewStep;
