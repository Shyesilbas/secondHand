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

    const hasCampaign = campaignDiscount > 0;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 sticky top-4">
            <div className="px-6 py-5 border-b border-slate-100/50">
                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Order Summary</h3>
                <p className="text-sm text-slate-500 mt-1 tracking-tight">{cartCount} items</p>
            </div>
            
            <div className="px-6 py-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                    {cartItems.map((item) => {
                        const itemPrice = parseFloat(item.listing.campaignPrice ?? item.listing.price) || 0;
                        const itemTotal = itemPrice * item.quantity;
                        return (
                            <div key={item.id} className="flex items-center space-x-3">
                                {item.listing.imageUrl ? (
                                    <img
                                        src={item.listing.imageUrl}
                                        alt={item.listing.title}
                                        className="w-10 h-10 object-cover rounded-md border border-slate-200 flex-shrink-0"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0 border border-slate-200 ${item.listing.imageUrl ? 'hidden' : 'flex'}`}>
                                    <span className="text-sm font-medium text-slate-600">
                                        {item.listing.title.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate tracking-tight">{item.listing.title}</p>
                                    <p className="text-xs text-slate-500 tracking-tight">
                                        {item.quantity} × {formatCurrency(itemPrice, item.listing.currency)}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold font-mono text-slate-900 tracking-tight">
                                    {formatCurrency(itemTotal, item.listing.currency)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="px-6 py-5 border-t border-slate-100/50">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 tracking-tight">Subtotal</span>
                        <span className="font-medium font-mono text-slate-900 tracking-tight">{formatCurrency(total, currency)}</span>
                    </div>

                    {hasCampaign && (
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 tracking-tight">Campaign discount</span>
                            <span className="font-semibold font-mono text-emerald-600 tracking-tight">-{formatCurrency(campaignDiscount, currency)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 tracking-tight">Shipping</span>
                        <span className="font-medium text-slate-900 tracking-tight">Free</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 tracking-tight">Tax</span>
                        <span className="font-medium font-mono text-slate-900 tracking-tight">{formatCurrency(tax, currency)}</span>
                    </div>
                    
                    <div className="border-t border-slate-200 pt-4 mt-4">
                        <div className="flex justify-between">
                            <span className="text-lg font-bold text-slate-900 tracking-tight">Total</span>
                            <span className="text-lg font-black font-mono text-slate-900 tracking-tighter">{formatCurrency(finalTotal, currency)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 pt-4">
                <button
                    className="w-full bg-slate-900 text-white py-4 px-6 rounded-2xl hover:bg-slate-800 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg tracking-tight"
                    onClick={onCheckout}
                    disabled={disabled}
                >
                    Proceed to Checkout
                </button>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 tracking-tight">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure checkout • SSL encrypted</span>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
