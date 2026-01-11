import React from 'react';
import { formatCurrency } from '../../../common/formatters.js';

const CheckoutSummaryStep = ({ cartItems, calculateTotal }) => {
    const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';
    return (
        <div className="space-y-6">
            {/* Modern Header */}
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <div>
                    <h4 className="text-xl font-semibold text-gray-900">Review Your Items</h4>
                    <p className="text-sm text-gray-600">Please verify all items and quantities</p>
                </div>
            </div>
            
            {/* Modern Items List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Items in your order</span>
                        <span className="text-sm text-gray-600">{cartItems.length} items</span>
                    </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {cartItems.map((item, index) => (
                        <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-4">
                                {/* Product Image Placeholder */}
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                        <span className="text-sm font-bold text-gray-500">
                                            {item.listing.title.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Item Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-base font-semibold text-gray-900 line-clamp-2">
                                                {item.listing.title}
                                            </h5>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {item.listing.type}
                                                </span>
                                                <span className="text-xs text-gray-500">•</span>
                                                <span className="text-xs text-gray-500">{item.listing.city}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="ml-4 text-right">
                                            <div className="text-lg font-bold text-gray-900">
                                                {formatCurrency(parseFloat(item.listing.price) * item.quantity, item.listing.currency)}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {item.quantity} × {formatCurrency(item.listing.price, item.listing.currency)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Modern Total Section */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-base font-semibold text-gray-900">Order Total</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(calculateTotal(), currency)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Including free shipping</p>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSummaryStep;
