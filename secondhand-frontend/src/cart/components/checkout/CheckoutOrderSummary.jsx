import React from 'react';
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
                    <p className="text-sm text-gray-500 mt-1">{cartCount} items</p>
                </div>

                {/* Items List */}
                <div className="px-6 py-4 max-h-80 overflow-y-auto">
                    <div className="space-y-4">
                        {cartItems.map((item) => {
                            const hasCampaign = item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
                            const unitPrice = hasCampaign ? item.listing.campaignPrice : item.listing.price;
                            return (
                            <div key={item.id} className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-medium text-gray-600">
                                        {item.listing.title.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {item.listing.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                                    </p>
                                    {hasCampaign && (
                                        <p className="text-xs text-emerald-700 font-medium mt-0.5">
                                            {item.listing.campaignName || 'Campaign applied'}
                                        </p>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(parseFloat(unitPrice) * item.quantity, item.listing.currency)}
                                </span>
                            </div>
                        )})}
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-sm font-medium text-gray-700">Coupon</div>
                                {isPreviewLoading && (
                                    <div className="text-xs text-gray-500">Updating…</div>
                                )}
                            </div>

                            {appliedCouponCode ? (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs font-semibold">
                                        Applied: {appliedCouponCode}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onRemoveCoupon}
                                        className="text-xs font-semibold text-gray-600 hover:text-gray-900"
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
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={onApplyCoupon}
                                        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                                        disabled={isPreviewLoading}
                                    >
                                        Apply
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onOpenCouponsModal}
                                        className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 text-sm font-semibold hover:bg-gray-50"
                                    >
                                        Active
                                    </button>
                                </div>
                            )}

                            {couponError && (
                                <div className="text-xs text-red-600 font-medium">
                                    {couponError}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium text-gray-900">
                                {formatCurrency(originalSubtotal != null ? originalSubtotal : subtotal, currency)}
                            </span>
                        </div>

                        {campaignDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Campaign discount</span>
                                <span className="font-medium text-emerald-700">
                                    -{formatCurrency(campaignDiscount, currency)}
                                </span>
                            </div>
                        )}

                        {couponDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Coupon discount</span>
                                <span className="font-medium text-emerald-700">
                                    -{formatCurrency(couponDiscount, currency)}
                                </span>
                            </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium text-green-600">Free</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-medium text-gray-900">
                                {formatCurrency(tax, currency)}
                            </span>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between text-lg font-medium">
                                <span className="text-gray-900">Total</span>
                                <span className="text-gray-900">
                                    {formatCurrency(total, currency)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Secure checkout • SSL encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutOrderSummary;
