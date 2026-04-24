import { formatCurrency } from '../../../common/formatters.js';
import { Check as CheckIcon } from 'lucide-react';

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
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100/50 bg-slate-50/30">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Order Summary</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
                </div>

                <div className="px-5 py-3 max-h-60 overflow-y-auto">
                    <div className="space-y-3">
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
                                <span className="text-sm font-semibold tabular-nums text-slate-900 shrink-0">
                                    {formatCurrency(lineTotal, item.listing.currency)}
                                </span>
                            </div>
                        )})}
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100/80 bg-slate-50/30">
                    <div className="space-y-3">
                        <div className="space-y-2 pb-2 border-b border-slate-200/50 mb-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-sm font-bold text-slate-800 tracking-tight">Coupon Code</div>
                                {isPreviewLoading && (
                                    <div className="text-xs font-bold text-indigo-500 animate-pulse tracking-tight">Applying…</div>
                                )}
                            </div>

                            {appliedCouponCode ? (
                                <div className="flex items-center justify-between gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl px-3 py-2">
                                    <div className="inline-flex items-center gap-2 text-emerald-700 text-sm font-bold tracking-tight">
                                        <CheckIcon className="w-4 h-4" />
                                        {appliedCouponCode}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onRemoveCoupon}
                                        className="text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 px-2 py-1 rounded-md transition-all tracking-tight"
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
                                        className="flex-1 px-4 py-2.5 border border-slate-200/80 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 tracking-tight"
                                    />
                                    <button
                                        type="button"
                                        onClick={onApplyCoupon}
                                        className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50 tracking-tight transition-colors shadow-sm"
                                        disabled={isPreviewLoading || !couponInput.trim()}
                                    >
                                        Apply
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onOpenCouponsModal}
                                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 tracking-tight shadow-sm transition-colors"
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

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Subtotal</span>
                            <span className="font-semibold tabular-nums text-slate-900">
                                {formatCurrency(originalSubtotal != null ? originalSubtotal : subtotal, currency)}
                            </span>
                        </div>

                        {campaignDiscount > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Campaign discount</span>
                                <span className="font-bold tabular-nums text-emerald-600">
                                    -{formatCurrency(campaignDiscount, currency)}
                                </span>
                            </div>
                        )}

                        {couponDiscount > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Coupon discount</span>
                                <span className="font-bold tabular-nums text-emerald-600">
                                    -{formatCurrency(couponDiscount, currency)}
                                </span>
                            </div>
                        )}
                        
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Shipping</span>
                            <span className="font-semibold text-slate-900">Free</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Tax</span>
                            <span className="font-semibold tabular-nums text-slate-900">
                                {formatCurrency(tax, currency)}
                            </span>
                        </div>
                        
                        <div className="border-t border-slate-200/60 pt-3 mt-3">
                            <div className="flex justify-between items-end">
                                <span className="text-base font-bold text-slate-900">Total</span>
                                <span className="text-xl font-extrabold tabular-nums text-slate-900 tracking-tight leading-none">
                                    {formatCurrency(total, currency)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 bg-slate-50/30">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium tracking-tight">
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Secure checkout · SSL encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutOrderSummary;
