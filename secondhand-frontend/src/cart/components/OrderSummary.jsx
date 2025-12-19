import React from 'react';
import { formatCurrency } from '../../common/formatters.js';

const OrderSummary = ({ 
    cartItems, 
    cartCount, 
    calculateTotal, 
    onCheckout, 
    disabled = false 
}) => {
    const total = calculateTotal();
    const originalSubtotal = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.listing.price) || 0;
        return sum + (price * item.quantity);
    }, 0);
    const campaignDiscount = Math.max(0, (originalSubtotal || 0) - (total || 0));
    const shipping = 0;
    const tax = 0;
    const finalTotal = total + shipping + tax;
    
    const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4">
            {/* Clean Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
                <p className="text-sm text-gray-500 mt-1">{cartCount} items</p>
            </div>
            
            {/* Items List */}
            <div className="px-6 py-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600">
                                    {item.listing.title.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.listing.title}</p>
                                <p className="text-xs text-gray-500">
                                    {item.quantity} × {formatCurrency(item.listing.price, item.listing.currency)}
                                </p>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(parseFloat(item.listing.price) * item.quantity, item.listing.currency)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Price Breakdown */}
            <div className="px-6 py-4 border-t border-gray-200">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">{formatCurrency(total, currency)}</span>
                    </div>

                    {campaignDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Campaign discount</span>
                            <span className="font-medium text-emerald-700">-{formatCurrency(campaignDiscount, currency)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium text-gray-900">Free</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium text-gray-900">{formatCurrency(tax, currency)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between text-lg font-medium">
                            <span className="text-gray-900">Total</span>
                            <span className="text-gray-900">{formatCurrency(finalTotal, currency)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clean Checkout Button */}
            <div className="p-6">
                <button
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onCheckout}
                    disabled={disabled}
                >
                    Proceed to Checkout
                </button>
                
                {/* Security Notice */}
                <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">Secure checkout • SSL encrypted</p>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
