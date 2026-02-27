import {Clock as ClockIcon, Minus as MinusIcon, Plus as PlusIcon, Star, X as XMarkIcon} from 'lucide-react';
import {formatCurrency} from '../../common/formatters.js';
import {useSellerReviewStatsCache} from '../../reviews/hooks/useSellerReviewStatsCache.js';
import {useReservationTimer} from '../hooks/useReservationTimer.js';

const CartItemCard = ({ 
    item, 
    onQuantityChange, 
    onRemoveItem, 
    isUpdating, 
    isRemoving,
    index 
}) => {
    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) return;
        const max = item?.listing?.quantity;
        if (max != null && Number.isFinite(Number(max)) && newQuantity > Number(max)) {
            onQuantityChange(item.listing.id, Number(max));
            return;
        }
        onQuantityChange(item.listing.id, newQuantity);
    };

    const handleRemove = () => {
        onRemoveItem(item.listing.id);
    };

    const hasCampaign = item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
    const unitPrice = parseFloat(hasCampaign ? item.listing.campaignPrice : item.listing.price) || 0;
    const itemTotal = unitPrice * item.quantity;
    
    // Seller Info
    const sellerName = item.listing.sellerName;
    const sellerSurname = item.listing.sellerSurname;
    const sellerId = item.listing.sellerId;

    // Product Review Info
    const reviewStats = item.listing.reviewStats;
    const averageRating = reviewStats?.averageRating || 0;
    const totalReviews = reviewStats?.totalReviews || 0;

    const { stats: sellerStats } = useSellerReviewStatsCache(sellerId);

    const sellerRating = sellerStats?.averageRating || 0;
    const sellerTotalReviews = sellerStats?.totalReviews || 0;
    const maxStock = item?.listing?.quantity;
    const isLowStock = maxStock != null && Number.isFinite(Number(maxStock)) && Number(maxStock) > 0 && Number(maxStock) < 10;
    
    const { timeRemaining, isExpired, isReserved } = useReservationTimer(item.reservedAt, item.reservationEndTime);
    const isReservationExpiring = timeRemaining && timeRemaining.minutes < 3;

    return (
        <div className="px-5 py-4">
            <div className="flex items-start gap-3">
                {/* Image */}
                <div className="shrink-0">
                    {item.listing.imageUrl ? (
                        <img
                            src={item.listing.imageUrl}
                            alt={item.listing.title}
                            className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center ${item.listing.imageUrl ? 'hidden' : 'flex'}`}>
                        <span className="text-[13px] font-medium text-gray-400">
                            {item.listing.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-1 tracking-[-0.01em]">
                            {item.listing.title}
                        </h3>
                        <button
                            onClick={handleRemove}
                            disabled={isRemoving}
                            className="p-0.5 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40 shrink-0"
                            title="Remove"
                        >
                            <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Meta line */}
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                        <span>{item.listing.type}</span>
                        <span className="w-px h-3 bg-gray-100" />
                        <span>{item.listing.city}</span>
                        {(sellerName || sellerSurname) && (
                            <>
                                <span className="w-px h-3 bg-gray-100" />
                                <span>{sellerName} {sellerSurname}</span>
                                {sellerTotalReviews > 0 && (
                                    <span className="flex items-center gap-0.5">
                                        <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />
                                        <span className="font-medium text-gray-500">{sellerRating.toFixed(1)}</span>
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-2.5">
                        {isLowStock && (
                            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                {Number(maxStock)} left
                            </span>
                        )}
                        {isReserved && !isExpired && (
                            <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                isReservationExpiring ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
                            }`}>
                                <ClockIcon className="w-2.5 h-2.5" />
                                {timeRemaining?.minutes || 0}:{(timeRemaining?.seconds || 0).toString().padStart(2, '0')}
                            </span>
                        )}
                        {isReserved && isExpired && (
                            <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                Expired
                            </span>
                        )}
                        {hasCampaign && (
                            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {item.listing.campaignName || 'Campaign'}
                            </span>
                        )}
                        {totalReviews > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                                <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />
                                {averageRating.toFixed(1)} ({totalReviews})
                            </span>
                        )}
                    </div>

                    {/* Price + Quantity */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-[13px] font-semibold text-gray-900 tabular-nums">
                                {formatCurrency(itemTotal, item.listing.currency)}
                            </span>
                            {item.quantity > 1 && (
                                <span className="text-[10px] text-gray-400 tabular-nums">
                                    {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                                </span>
                            )}
                            {hasCampaign && (
                                <span className="text-[10px] text-gray-400 line-through tabular-nums">
                                    {formatCurrency(item.listing.price, item.listing.currency)}
                                </span>
                            )}
                        </div>
                        
                        {/* Quantity stepper */}
                        <div className="flex items-center border border-gray-100 rounded-lg">
                            <button
                                onClick={() => handleQuantityChange(item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="p-1.5 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                            >
                                <MinusIcon className="w-3 h-3 text-gray-500" />
                            </button>
                            <div className="px-2.5 py-1 min-w-[2rem] text-center border-x border-gray-100">
                                <span className="text-[12px] font-semibold text-gray-900 tabular-nums">
                                    {item.quantity}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleQuantityChange(item.quantity + 1)}
                                disabled={isUpdating || (maxStock != null && Number.isFinite(Number(maxStock)) && item.quantity >= Number(maxStock))}
                                className="p-1.5 hover:bg-gray-50 disabled:opacity-30 transition-colors rounded-r-lg"
                            >
                                <PlusIcon className="w-3 h-3 text-gray-500" />
                            </button>
                        </div>
                    </div>
                    
                    {item.notes && (
                        <div className="mt-2.5 px-3 py-2 bg-gray-50 rounded-lg text-[11px] text-gray-500">
                            <span className="font-medium text-gray-600">Note:</span> {item.notes}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartItemCard;
