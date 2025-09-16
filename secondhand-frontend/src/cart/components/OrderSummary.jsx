import React from 'react';
import { formatCurrency } from '../../common/formatters.js';

const OrderSummary = ({ 
    cartItems, 
    cartCount, 
    calculateTotal, 
    onCheckout, 
    disabled = false 
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({cartCount})</span>
                    <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                </div>
            </div>

            <button
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                onClick={onCheckout}
                disabled={disabled}
            >
                Proceed to Checkout
            </button>
        </div>
    );
};

export default OrderSummary;
