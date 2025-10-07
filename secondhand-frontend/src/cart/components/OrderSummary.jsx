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
    const shipping = 0; // Free shipping for now
    const tax = 0; // No tax for now
    const finalTotal = total + shipping + tax;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4 overflow-hidden">
            {/* Modern Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                        <p className="text-sm text-gray-600">Review your purchase</p>
                    </div>
                    <span className="text-sm text-gray-600">{cartCount} items</span>
                </div>
            </div>
            
            {/* Items List */}
            <div className="px-6 py-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-gray-600">
                                    {item.listing.title.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.listing.title}</p>
                                <p className="text-xs text-gray-500">
                                    {item.quantity} × {formatCurrency(item.listing.price, item.listing.currency)}
                                </p>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(parseFloat(item.listing.price) * item.quantity, item.listing.currency)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Price Breakdown */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">{formatCurrency(total, 'USD')}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium text-green-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Free
                        </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium text-gray-900">{formatCurrency(tax, 'USD')}</span>
                    </div>
                    
                    <div className="border-t border-gray-300 pt-3">
                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-gray-900">Total</span>
                            <span className="text-gray-900">{formatCurrency(finalTotal, 'USD')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Checkout Button */}
            <div className="p-6">
                <button
                    className="w-full bg-gray-900 text-white py-4 px-6 rounded-lg hover:bg-gray-800 transition-all duration-200 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5"
                    onClick={onCheckout}
                    disabled={disabled}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <span>Proceed to Checkout</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
                
                {/* Enhanced Security Notice */}
                <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-medium">Secure checkout</span>
                        <span className="text-gray-400">•</span>
                        <span>SSL encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
