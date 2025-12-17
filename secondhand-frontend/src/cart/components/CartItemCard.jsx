import React, { useState, useEffect } from 'react';
import { PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Star } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
import { reviewService } from '../../reviews/services/reviewService.js';

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
        onQuantityChange(item.listing.id, newQuantity);
    };

    const handleRemove = () => {
        onRemoveItem(item.listing.id);
    };

    const itemTotal = parseFloat(item.listing.price) * item.quantity;
    
    // Seller Info
    const sellerName = item.listing.sellerName;
    const sellerSurname = item.listing.sellerSurname;
    const sellerId = item.listing.sellerId;

    // Product Review Info
    const reviewStats = item.listing.reviewStats;
    const averageRating = reviewStats?.averageRating || 0;
    const totalReviews = reviewStats?.totalReviews || 0;

    // Seller Review Info
    const [sellerStats, setSellerStats] = useState(null);

    useEffect(() => {
        if (sellerId) {
            reviewService.getUserReviewStats(sellerId)
                .then(data => setSellerStats(data))
                .catch(err => console.error("Failed to fetch seller stats", err));
        }
    }, [sellerId]);

    const sellerRating = sellerStats?.averageRating || 0;
    const sellerTotalReviews = sellerStats?.totalReviews || 0;

    return (
        <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-4">
                {/* Product Image Placeholder */}
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                            {item.listing.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
                
                {/* Item Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-gray-900 line-clamp-2">
                                {item.listing.title}
                            </h3>
                            
                            {/* Product Reviews */}
                            {totalReviews > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-3 h-3 ${star <= Math.round(averageRating) ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-500">({totalReviews})</span>
                                </div>
                            )}

                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">{item.listing.type}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{item.listing.city}</span>
                            </div>
                            
                            {/* Seller Info */}
                            {(sellerName || sellerSurname) && (
                                <div className="mt-2 flex items-center text-xs text-gray-600">
                                    <span className="font-medium text-gray-500 mr-1">Seller:</span>
                                    <span className="mr-2">{sellerName} {sellerSurname}</span>
                                    
                                    {/* Seller Reviews */}
                                    {sellerTotalReviews > 0 && (
                                        <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                            <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />
                                            <span className="font-medium text-gray-700">{sellerRating.toFixed(1)}</span>
                                            <span className="text-gray-500">({sellerTotalReviews})</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Remove Button */}
                        <button 
                            onClick={handleRemove}
                            disabled={isRemoving}
                            className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50" 
                            title="Remove from cart"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* Price and Quantity Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-baseline space-x-2">
                                <span className="text-lg font-medium text-gray-900">
                                    {formatCurrency(item.listing.price, item.listing.currency)}
                                </span>
                                <span className="text-xs text-gray-500">each</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                Total: <span className="font-medium text-gray-900">{formatCurrency(itemTotal, item.listing.currency)}</span>
                            </div>
                        </div>
                        
                        {/* Clean Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-md">
                            <button 
                                onClick={() => handleQuantityChange(item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <MinusIcon className="w-4 h-4 text-gray-600" />
                            </button>
                            <div className="px-3 py-2 min-w-[3rem] text-center border-x border-gray-200">
                                <span className="text-sm font-medium text-gray-900">
                                    {item.quantity}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleQuantityChange(item.quantity + 1)}
                                disabled={isUpdating}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Notes */}
                    {item.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Note:</span> {item.notes}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartItemCard;
