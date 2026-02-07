import { formatCurrency } from '../../../common/formatters.js';

const CheckoutOrderSummary = ({
    cartItems,
    calculateTotal,
    pricing,
    couponInput,
    setCouponInput,
    appliedCouponCode,
    couponError,
    isPreviewLoading,
    onApplyCoupon,
    onRemoveCoupon,
    onOpenCouponsModal
}) => {
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = pricing?.subtotalAfterCampaigns != null ? parseFloat(pricing.subtotalAfterCampaigns) : (calculateTotal ? calculateTotal() : 0);
    const originalSubtotal = pricing?.originalSubtotal != null ? parseFloat(pricing.originalSubtotal) : null;
    const campaignDiscount = pricing?.campaignDiscount != null ? parseFloat(pricing.campaignDiscount) : 0;
    const couponDiscount = pricing?.couponDiscount != null ? parseFloat(pricing.couponDiscount) : 0;
    const shipping = 0;
    const tax = 0;
    const total = pricing?.total != null ? parseFloat(pricing.total) : (subtotal + shipping + tax);
    
    const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';

    return (
        <div className="sticky top-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100/50">
                    <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Order Summary</h3>
                    <p className="text-sm text-slate-500 mt-1 tracking-tight">{cartCount} items</p>
                </div>

                <div className="px-6 py-4 max-h-80 overflow-y-auto">
                    <div className="space-y-4">
                        {cartItems.map((item) => {
                            const isOffer = !!item.isOffer;
                            const hasCampaign = !isOffer && item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
                            const unitPrice = isOffer
                                ? (item.offerTotalPrice != null && item.quantity ? (parseFloat(item.offerTotalPrice) / item.quantity) : item.listing.price)
                                : (hasCampaign ? item.listing.campaignPrice : item.listing.price);
                            const lineTotal = isOffer
                                ? (parseFloat(item.offerTotalPrice) || 0)
                                : (parseFloat(unitPrice) * item.quantity);
                            return (
                            <div key={item.id} className="flex items-center space-x-3">
                                {item.listing.imageUrl ? (
                                    <img
                                        src={item.listing.imageUrl}
                                        alt={item.listing.title}
                                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200 ${item.listing.imageUrl ? 'hidden' : 'flex'}`}>
                                    <span className="text-sm font-medium text-slate-600">
                                        {item.listing.title.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate tracking-tight">
                                        {item.listing.title}
                                    </p>
                                    {isOffer && (
                                        <p className="text-xs text-emerald-600 font-semibold mt-0.5 tracking-tight">
                                            Offer item
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-500 tracking-tight">
                                        {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                                    </p>
                                    {hasCampaign && (
                                        <p className="text-xs text-emerald-600 font-semibold mt-0.5 tracking-tight">
                                            {item.listing.campaignName || 'Campaign applied'}
                                        </p>
                                    )}
                                </div>
                                <span className="text-sm font-semibold font-mono text-slate-900 tracking-tight">
                                    {formatCurrency(lineTotal, item.listing.currency)}
                                </span>
                            </div>
                        )})}
                    </div>
                </div>

                <div className="px-6 py-5 border-t border-slate-100/50">
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-sm font-semibold text-slate-700 tracking-tight">Coupon</div>
                                {isPreviewLoading && (
                                    <div className="text-xs text-slate-500 tracking-tight">Updating…</div>
                                )}
                            </div>

                            {appliedCouponCode ? (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs font-semibold tracking-tight">
                                        Applied: {appliedCouponCode}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onRemoveCoupon}
                                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 tracking-tight"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <input
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        placeholder="Enter code"
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white tracking-tight"
                                    />
                                    <button
                                        type="button"
                                        onClick={onApplyCoupon}
                                        className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 tracking-tight"
                                        disabled={isPreviewLoading}
                                    >
                                        Apply
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onOpenCouponsModal}
                                        className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-semibold hover:bg-slate-50 tracking-tight"
                                    >
                                        Active
                                    </button>
                                </div>
                            )}

                            {couponError && (
                                <div className="text-xs text-red-600 font-semibold tracking-tight">
                                    {couponError}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 tracking-tight">Subtotal</span>
                            <span className="font-medium font-mono text-slate-900 tracking-tight">
                                {formatCurrency(originalSubtotal != null ? originalSubtotal : subtotal, currency)}
                            </span>
                        </div>

                        {campaignDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 tracking-tight">Campaign discount</span>
                                <span className="font-semibold font-mono text-emerald-600 tracking-tight">
                                    -{formatCurrency(campaignDiscount, currency)}
                                </span>
                            </div>
                        )}

                        {couponDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 tracking-tight">Coupon discount</span>
                                <span className="font-semibold font-mono text-emerald-600 tracking-tight">
                                    -{formatCurrency(couponDiscount, currency)}
                                </span>
                            </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 tracking-tight">Shipping</span>
                            <span className="font-medium text-emerald-600 tracking-tight">Free</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 tracking-tight">Tax</span>
                            <span className="font-medium font-mono text-slate-900 tracking-tight">
                                {formatCurrency(tax, currency)}
                            </span>
                        </div>
                        
                        <div className="border-t border-slate-200 pt-4 mt-4">
                            <div className="flex justify-between">
                                <span className="text-lg font-bold text-slate-900 tracking-tight">Total</span>
                                <span className="text-lg font-black font-mono text-slate-900 tracking-tighter">
                                    {formatCurrency(total, currency)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100/50">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-semibold tracking-tight">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Secure checkout • SSL encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutOrderSummary;
