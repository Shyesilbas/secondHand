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
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-[5.5rem] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100/50 bg-slate-50/30">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Order Summary</h3>
                <p className="text-xs font-medium text-slate-500 mt-1 tabular-nums">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
            </div>
            
            {/* Item list */}
            <div className="px-6 py-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
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
                                    <p className="text-sm font-semibold text-slate-800 line-clamp-1 leading-snug">{item.listing.title}</p>
                                    <p className="text-xs font-medium text-slate-500 tabular-nums mt-0.5">
                                        {item.quantity} × {formatCurrency(itemPrice, item.listing.currency)}
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-slate-900 tabular-nums shrink-0">
                                    {formatCurrency(itemTotal, item.listing.currency)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Totals */}
            <div className="px-6 py-5 border-t border-slate-100/80 bg-slate-50/30">
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Subtotal</span>
                        <span className="text-slate-900 tabular-nums font-semibold">{formatCurrency(total, currency)}</span>
                    </div>

                    {hasCampaign && (
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Discount</span>
                            <span className="text-emerald-600 tabular-nums font-bold">-{formatCurrency(campaignDiscount, currency)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Shipping</span>
                        <span className="text-slate-900 font-semibold">Free</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Tax</span>
                        <span className="text-slate-900 tabular-nums font-semibold">{formatCurrency(tax, currency)}</span>
                    </div>
                    
                    <div className="border-t border-slate-200/60 pt-4 mt-4">
                        <div className="flex justify-between items-end">
                            <span className="text-base font-bold text-slate-900">Total</span>
                            <span className="text-2xl font-extrabold text-slate-900 tabular-nums tracking-tight leading-none">{formatCurrency(finalTotal, currency)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-6 pt-2 bg-slate-50/30">
                <button
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/25 text-sm font-bold disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                    onClick={onCheckout}
                    disabled={disabled}
                >
                    Proceed to Checkout
                </button>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure checkout · SSL encrypted</span>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
