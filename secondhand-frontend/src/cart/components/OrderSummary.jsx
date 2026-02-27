import {formatCurrency} from '../../common/formatters.js';

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
        <div className="bg-white rounded-lg border border-gray-100 sticky top-16">
            <div className="px-5 py-3 border-b border-gray-50">
                <h3 className="text-[13px] font-semibold text-gray-900">Summary</h3>
                <p className="text-[11px] text-gray-400 mt-0.5 tabular-nums">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
            </div>
            
            {/* Item list */}
            <div className="px-5 py-3 max-h-52 overflow-y-auto">
                <div className="space-y-2.5">
                    {cartItems.map((item) => {
                        const itemPrice = parseFloat(item.listing.campaignPrice ?? item.listing.price) || 0;
                        const itemTotal = itemPrice * item.quantity;
                        return (
                            <div key={item.id} className="flex items-center gap-2.5">
                                {item.listing.imageUrl ? (
                                    <img
                                        src={item.listing.imageUrl}
                                        alt={item.listing.title}
                                        className="w-8 h-8 object-cover rounded border border-gray-100 shrink-0"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`w-8 h-8 bg-gray-50 rounded flex items-center justify-center shrink-0 ${item.listing.imageUrl ? 'hidden' : 'flex'}`}>
                                    <span className="text-[10px] font-medium text-gray-400">
                                        {item.listing.title.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] text-gray-700 truncate">{item.listing.title}</p>
                                    <p className="text-[10px] text-gray-400 tabular-nums">
                                        {item.quantity} × {formatCurrency(itemPrice, item.listing.currency)}
                                    </p>
                                </div>
                                <span className="text-[12px] font-medium text-gray-900 tabular-nums shrink-0">
                                    {formatCurrency(itemTotal, item.listing.currency)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Totals */}
            <div className="px-5 py-4 border-t border-gray-50">
                <div className="space-y-1.5 text-[12px]">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-gray-900 tabular-nums font-medium">{formatCurrency(total, currency)}</span>
                    </div>

                    {hasCampaign && (
                        <div className="flex justify-between">
                            <span className="text-gray-400">Discount</span>
                            <span className="text-emerald-600 tabular-nums font-medium">-{formatCurrency(campaignDiscount, currency)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between">
                        <span className="text-gray-400">Shipping</span>
                        <span className="text-gray-900">Free</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-gray-400">Tax</span>
                        <span className="text-gray-900 tabular-nums">{formatCurrency(tax, currency)}</span>
                    </div>
                    
                    <div className="border-t border-gray-50 pt-2.5 mt-2.5">
                        <div className="flex justify-between">
                            <span className="text-[13px] font-semibold text-gray-900">Total</span>
                            <span className="text-[13px] font-semibold text-gray-900 tabular-nums">{formatCurrency(finalTotal, currency)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 pb-5 pt-1">
                <button
                    className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors text-[13px] font-medium disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    onClick={onCheckout}
                    disabled={disabled}
                >
                    Proceed to Checkout
                </button>
                
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure checkout · SSL encrypted</span>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
