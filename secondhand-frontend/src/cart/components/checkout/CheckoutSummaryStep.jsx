import React from 'react';
import { formatCurrency } from '../../../common/formatters.js';

const CheckoutSummaryStep = ({ cartItems, calculateTotal }) => {
    return (
        <div>
            <h4 className="text-md font-semibold mb-3">Order Summary</h4>
            <div className="divide-y divide-gray-200 border rounded">
                {cartItems.map((item) => (
                    <div key={item.id} className="p-4 flex items-start justify-between">
                        <div>
                            <div className="font-medium">{item.listing.title}</div>
                            <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                        </div>
                        <div className="font-semibold">
                            {formatCurrency(parseFloat(item.listing.price) * item.quantity, item.listing.currency)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-4 text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(calculateTotal())}</span>
            </div>
        </div>
    );
};

export default CheckoutSummaryStep;
