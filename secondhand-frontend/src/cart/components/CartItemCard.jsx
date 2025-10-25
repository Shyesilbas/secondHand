import React from 'react';
import { PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../common/formatters.js';

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
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">{item.listing.type}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{item.listing.city}</span>
                            </div>
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
