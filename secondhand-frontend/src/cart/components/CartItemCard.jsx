import React from 'react';
import { PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../common/formatters.js';

const CartItemCard = ({ 
    item, 
    onQuantityChange, 
    onRemoveItem, 
    isUpdating, 
    isRemoving 
}) => {
    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) return;
        onQuantityChange(item.listing.id, newQuantity);
    };

    const handleRemove = () => {
        onRemoveItem(item.listing.id);
    };

    return (
        <div className="p-6">
            <div className="flex items-start space-x-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.listing.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {item.listing.type} • {item.listing.city}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                        {formatCurrency(item.listing.price, item.listing.currency)}
                    </p>
                    
                    <div className="flex items-center space-x-3 mt-3">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => handleQuantityChange(item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                                <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">
                                {item.quantity}
                            </span>
                            <button 
                                onClick={() => handleQuantityChange(item.quantity + 1)}
                                disabled={isUpdating}
                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    {item.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Notes:</span> {item.notes}
                        </p>
                    )}
                </div>
                
                <div className="flex flex-col space-y-2">
                    <button 
                        onClick={handleRemove}
                        disabled={isRemoving}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50" 
                        title="Remove from cart"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartItemCard;
