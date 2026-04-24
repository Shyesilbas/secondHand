import {formatCurrency} from '../../../common/formatters.js';
import ListingReviewStats from '../../../reviews/components/ListingReviewStats.jsx';
import {useSellerReviewStatsCache} from '../../../reviews/hooks/useSellerReviewStatsCache.js';
import {Star as StarIcon} from 'lucide-react';

const SellerRating = ({ sellerId }) => {
    const { stats, loading } = useSellerReviewStatsCache(sellerId);

    const total = Number(stats?.totalReviews);
    const avgRaw = Number(stats?.averageRating);
    const safeAvg = Number.isFinite(avgRaw) ? avgRaw : 0;

    if (loading || !stats || !Number.isFinite(total) || total <= 0) {
        return null;
    }

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);

        return Array.from({ length: 5 }, (_, index) => (
            <StarIcon
                key={index}
                className={`w-3 h-3 ${index < fullStars ? 'text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <div className="flex items-center space-x-1">
            <div className="flex items-center">
                {renderStars(safeAvg)}
            </div>
            <span className="text-xs text-gray-600">
                {safeAvg.toFixed(1)} ({total})
            </span>
        </div>
    );
};

const CheckoutReviewStep = ({ cartItems, calculateTotal, onNext, onBack }) => {
    const totalAmount = calculateTotal();

    return (
        <div className="p-4 sm:p-5">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900 tracking-tight mb-0.5">Review Your Order</h2>
                <p className="text-sm text-slate-500">Verify items and quantities before continuing.</p>
            </div>

            {/* Items */}
            <div className="space-y-2.5 mb-5">
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
                        <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                            {/* Image */}
                            <div className="w-12 h-12 bg-slate-100 rounded-xl shrink-0 overflow-hidden flex items-center justify-center">
                                {item.listing.imageUrl ? (
                                    <img src={item.listing.imageUrl} alt={item.listing.title} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-medium text-slate-500">
                                        {item.listing.title.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <h3 className="text-sm font-semibold text-slate-900 truncate">{item.listing.title}</h3>
                                    {isOffer && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-700 bg-emerald-100 shrink-0">Offer</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{item.listing.type} · {item.listing.city}</span>
                                    {(item.listing.sellerName || item.listing.sellerSurname) && (
                                        <>
                                            <span className="w-px h-3 bg-slate-200" />
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
                                <div className="text-sm font-semibold text-slate-900 tabular-nums">
                                    {formatCurrency(lineTotal, item.listing.currency)}
                                </div>
                                <div className="text-[11px] text-slate-500 tabular-nums mt-0.5">
                                    {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                                </div>
                                {hasCampaign && (
                                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{item.listing.campaignName || 'Campaign'}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mb-6 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Current total</span>
                    <span className="text-xl font-bold text-indigo-900 tabular-nums">
                        {formatCurrency(totalAmount, cartItems[0]?.listing?.currency || 'TRY')}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="hidden sm:flex items-center justify-between pt-6 border-t border-slate-200/60">
                <button
                    onClick={onBack}
                    className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                    Back to Cart
                </button>
                <button
                    onClick={onNext}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 text-sm font-bold shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                    Continue to Address
                </button>
            </div>

            <div className="sm:hidden sticky bottom-0 -mx-5 mt-6 px-5 py-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
                <button
                    onClick={onNext}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl hover:from-indigo-700 hover:to-violet-700 text-base font-bold shadow-lg shadow-indigo-500/25 transition-all"
                >
                    Continue to Address
                </button>
            </div>
        </div>
    );
};

export default CheckoutReviewStep;
