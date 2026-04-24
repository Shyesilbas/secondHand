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
        <div className="px-6 py-5 group hover:bg-white/60 transition-colors duration-300">
            <div className="flex items-start gap-4">
                {/* Image */}
                <div className="shrink-0 relative">
                    {item.listing.imageUrl ? (
                        <img
                            src={item.listing.imageUrl}
                            alt={item.listing.title}
                            loading="lazy"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border border-slate-200/60 shadow-sm"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm ${item.listing.imageUrl ? 'hidden' : 'flex'}`}>
                        <span className="text-base font-bold text-slate-400">
                            {item.listing.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 tracking-tight pr-4">
                            {item.listing.title}
                        </h3>
                        <button
                            onClick={handleRemove}
                            disabled={isRemoving}
                            className="p-1.5 -mr-1.5 -mt-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 disabled:opacity-40 shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-100"
                            title="Remove"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Meta line */}
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2.5">
                        <span>{item.listing.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{item.listing.city}</span>
                        {(sellerName || sellerSurname) && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span>{sellerName} {sellerSurname}</span>
                                {sellerTotalReviews > 0 && (
                                    <span className="flex items-center gap-0.5">
                                        <Star className="w-3 h-3 text-amber-400 fill-current" />
                                        <span className="font-bold text-slate-600">{sellerRating.toFixed(1)}</span>
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                        {isLowStock && (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-md shadow-sm">
                                {Number(maxStock)} left
                            </span>
                        )}
                        {isReserved && !isExpired && (
                            <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md border shadow-sm ${
                                isReservationExpiring ? 'text-rose-700 bg-rose-50 border-rose-200/50' : 'text-blue-700 bg-blue-50 border-blue-200/50'
                            }`}>
                                <ClockIcon className="w-3 h-3" />
                                {timeRemaining?.minutes || 0}:{(timeRemaining?.seconds || 0).toString().padStart(2, '0')}
                            </span>
                        )}
                        {isReserved && isExpired && (
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                Expired
                            </span>
                        )}
                        {hasCampaign && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md shadow-sm">
                                {item.listing.campaignName || 'Campaign'}
                            </span>
                        )}
                        {totalReviews > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                                <Star className="w-3 h-3 text-amber-400 fill-current" />
                                {averageRating.toFixed(1)} ({totalReviews})
                            </span>
                        )}
                    </div>

                    {/* Price + Quantity */}
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                            <span className="text-base font-extrabold text-slate-900 tabular-nums tracking-tight">
                                {formatCurrency(itemTotal, item.listing.currency)}
                            </span>
                            <div className="flex items-baseline gap-1.5">
                                {item.quantity > 1 && (
                                    <span className="text-xs font-medium text-slate-400 tabular-nums">
                                        {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                                    </span>
                                )}
                                {hasCampaign && (
                                    <span className="text-xs font-medium text-slate-400 line-through tabular-nums">
                                        {formatCurrency(item.listing.price, item.listing.currency)}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Quantity stepper */}
                        <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl shadow-sm p-0.5">
                            <button
                                onClick={() => handleQuantityChange(item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="p-1.5 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all rounded-lg text-slate-500 hover:text-slate-900"
                            >
                                <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <div className="px-3 min-w-[2.5rem] text-center">
                                <span className="text-sm font-bold text-slate-900 tabular-nums">
                                    {item.quantity}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleQuantityChange(item.quantity + 1)}
                                disabled={isUpdating || (maxStock != null && Number.isFinite(Number(maxStock)) && item.quantity >= Number(maxStock))}
                                className="p-1.5 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all rounded-lg text-slate-500 hover:text-slate-900"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                    
                    {item.notes && (
                        <div className="mt-3 px-3.5 py-2.5 bg-indigo-50/50 border border-indigo-100/50 rounded-xl text-xs font-medium text-slate-600">
                            <span className="font-bold text-indigo-900/70 mr-1">Note:</span> {item.notes}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartItemCard;
