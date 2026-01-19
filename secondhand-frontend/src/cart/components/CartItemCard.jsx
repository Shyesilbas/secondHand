import React from 'react';
import { PlusIcon, MinusIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Star } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
import { useSellerReviewStatsCache } from '../../reviews/hooks/useSellerReviewStatsCache.js';
import { useReservationTimer } from '../hooks/useReservationTimer.js';

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
    
    const { timeRemaining, isExpired, isReserved } = useReservationTimer(item.reservedAt);
    const isReservationExpiring = timeRemaining && timeRemaining.minutes < 3;

    return (
        <div className="p-6">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    {item.listing.imageUrl ? (
                        <img
                            src={item.listing.imageUrl}
                            alt={item.listing.title}
                            className="w-16 h-16 object-cover rounded-md border border-slate-200"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200 ${item.listing.imageUrl ? 'hidden' : 'flex'}`}>
                        <span className="text-sm font-medium text-slate-600">
                            {item.listing.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-slate-900 line-clamp-2 tracking-tight">
                                {item.listing.title}
                            </h3>

                            {isLowStock && (
                                <div className="mt-1.5 text-[11px] font-bold text-amber-600 tracking-tight">
                                    Only {Number(maxStock)} left in stock
                                </div>
                            )}
                            
                            {isReserved && !isExpired && (
                                <div className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-tight ${
                                    isReservationExpiring ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                    <ClockIcon className="w-3 h-3" />
                                    <span>
                                        Reserved: {timeRemaining?.minutes || 0}:{(timeRemaining?.seconds || 0).toString().padStart(2, '0')} remaining
                                    </span>
                                </div>
                            )}
                            
                            {isReserved && isExpired && (
                                <div className="mt-1.5 text-[11px] font-bold text-red-600 tracking-tight">
                                    Reservation expired - Please update your cart
                                </div>
                            )}
                            
                            {totalReviews > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-3 h-3 ${star <= Math.round(averageRating) ? 'text-amber-400 fill-current' : 'text-slate-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-500 tracking-tight">({totalReviews})</span>
                                </div>
                            )}

                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-slate-500 tracking-tight">{item.listing.type}</span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500 tracking-tight">{item.listing.city}</span>
                            </div>
                            
                            {(sellerName || sellerSurname) && (
                                <div className="mt-2 flex items-center text-xs text-slate-600 tracking-tight">
                                    <span className="font-semibold text-slate-500 mr-1">Seller:</span>
                                    <span className="mr-2">{sellerName} {sellerSurname}</span>
                                    
                                    {sellerTotalReviews > 0 && (
                                        <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                            <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />
                                            <span className="font-semibold text-slate-700">{sellerRating.toFixed(1)}</span>
                                            <span className="text-slate-500">({sellerTotalReviews})</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={handleRemove}
                            disabled={isRemoving}
                            className="ml-3 p-1 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50" 
                            title="Remove from cart"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-baseline space-x-2">
                                <span className="text-lg font-semibold font-mono text-slate-900 tracking-tight">
                                    {formatCurrency(unitPrice, item.listing.currency)}
                                </span>
                                {hasCampaign && (
                                    <span className="text-sm font-medium text-slate-400 line-through tracking-tight">
                                        {formatCurrency(item.listing.price, item.listing.currency)}
                                    </span>
                                )}
                                <span className="text-xs text-slate-500 tracking-tight">each</span>
                            </div>
                            {hasCampaign && (
                                <div className="text-xs text-emerald-600 font-semibold tracking-tight">
                                    {item.listing.campaignName || 'Campaign applied'}
                                </div>
                            )}
                            <div className="text-sm text-slate-600 tracking-tight">
                                Total: <span className="font-semibold font-mono text-slate-900 tracking-tight">{formatCurrency(itemTotal, item.listing.currency)}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center border border-slate-200 rounded-md">
                            <button 
                                onClick={() => handleQuantityChange(item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="p-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <MinusIcon className="w-4 h-4 text-slate-600" />
                            </button>
                            <div className="px-3 py-2 min-w-[3rem] text-center border-x border-slate-200">
                                <span className="text-sm font-semibold text-slate-900 tracking-tight">
                                    {item.quantity}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleQuantityChange(item.quantity + 1)}
                                disabled={isUpdating || (maxStock != null && Number.isFinite(Number(maxStock)) && item.quantity >= Number(maxStock))}
                                className="p-2 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>
                    
                    {item.notes && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                            <p className="text-sm text-slate-700 tracking-tight">
                                <span className="font-semibold">Note:</span> {item.notes}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartItemCard;
