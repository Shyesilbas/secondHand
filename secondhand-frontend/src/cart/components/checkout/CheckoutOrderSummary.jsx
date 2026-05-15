import { formatCurrency } from '../../../common/formatters.js';
import { Check } from 'lucide-react';

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
  onOpenCouponsModal,
}) => {
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal =
    pricing?.subtotalAfterCampaigns != null
      ? parseFloat(pricing.subtotalAfterCampaigns)
      : calculateTotal
        ? calculateTotal()
        : 0;
  const originalSubtotal = pricing?.originalSubtotal != null ? parseFloat(pricing.originalSubtotal) : null;
  const campaignDiscount = pricing?.campaignDiscount != null ? parseFloat(pricing.campaignDiscount) : 0;
  const couponDiscount = pricing?.couponDiscount != null ? parseFloat(pricing.couponDiscount) : 0;
  const shipping = 0;
  const tax = 0;
  const total = pricing?.total != null ? parseFloat(pricing.total) : subtotal + shipping + tax;

  const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';

  return (
    <aside className="sticky top-14 lg:top-[4.5rem]">
      <div className="overflow-hidden rounded-xl border border-[#e5e3df] bg-white shadow-sm shadow-black/[0.04]">
        {/* Header */}
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-[#111]">Order summary</h3>
          <p className="mt-0.5 text-xs tabular-nums text-[#999]">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Items */}
        <div className="max-h-56 overflow-y-auto border-t border-[#f0efed] px-5 py-3">
          {cartItems.map((item, idx) => {
            const isOffer = !!item.isOffer;
            const hasCampaign =
              !isOffer &&
              item.listing.campaignId &&
              item.listing.campaignPrice != null &&
              parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
            const unitPrice = isOffer
              ? item.offerTotalPrice != null && item.quantity
                ? parseFloat(item.offerTotalPrice) / item.quantity
                : item.listing.price
              : hasCampaign
                ? item.listing.campaignPrice
                : item.listing.price;
            const lineTotal = isOffer
              ? parseFloat(item.offerTotalPrice) || 0
              : parseFloat(unitPrice) * item.quantity;
            return (
              <div
                key={item.id}
                className={`flex gap-3 py-3 ${idx < cartItems.length - 1 ? 'border-b border-[#f0efed]' : ''}`}
              >
                {/* Thumbnail */}
                {item.listing.imageUrl ? (
                  <img
                    src={item.listing.imageUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-md border border-[#eee] object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#eee] bg-[#fafaf9] text-xs font-medium text-[#bbb] ${
                    item.listing.imageUrl ? 'hidden' : 'flex'
                  }`}
                >
                  {item.listing.title.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-[#111]">
                    {item.listing.title}
                  </p>
                  {isOffer && (
                    <p className="mt-0.5 text-xs font-medium text-[#107c10]">Offer</p>
                  )}
                  <p className="mt-0.5 text-xs tabular-nums text-[#999]">
                    {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                  </p>
                  {hasCampaign && (
                    <p className="mt-0.5 text-xs font-medium text-[#107c10]">
                      {item.listing.campaignName || 'Campaign'}
                    </p>
                  )}
                </div>

                {/* Line total */}
                <span className="shrink-0 text-sm font-medium tabular-nums text-[#111]">
                  {formatCurrency(lineTotal, item.listing.currency)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Coupon + breakdown */}
        <div className="space-y-3 border-t border-[#f0efed] px-5 py-4 text-sm">
          {/* Coupon */}
          <div className="space-y-2 border-b border-[#f0efed] pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#999]">Coupon</span>
              {isPreviewLoading && (
                <span className="text-xs text-[#999]">Applying…</span>
              )}
            </div>

            {appliedCouponCode ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-[#e5e3df] bg-[#fafaf9] px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#107c10]">
                  <Check className="h-4 w-4" strokeWidth={2} />
                  {appliedCouponCode}
                </span>
                <button
                  type="button"
                  onClick={onRemoveCoupon}
                  className="text-xs font-medium text-[#555] transition hover:text-[#1466c6]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-stretch gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code"
                  className="min-w-0 flex-1 rounded-lg border border-[#e5e3df] bg-white px-3 py-2 text-sm text-[#111] outline-none transition placeholder:text-[#bbb] focus:border-[#1466c6] focus:ring-2 focus:ring-[#1466c6]/15"
                />
                <button
                  type="button"
                  onClick={onApplyCoupon}
                  disabled={isPreviewLoading || !couponInput.trim()}
                  className="shrink-0 rounded-lg border border-[#1466c6] bg-[#1466c6] px-3 py-2 text-sm font-medium text-white transition-all hover:bg-[#0f529e] disabled:border-[#e8e6e4] disabled:bg-[#e8e6e4] disabled:text-[#9c9894]"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={onOpenCouponsModal}
                  className="shrink-0 rounded-lg border border-[#e5e3df] bg-white px-3 py-2 text-sm font-medium text-[#555] transition-all hover:border-[#bcb6b0] hover:bg-[#fafaf9]"
                >
                  Browse
                </button>
              </div>
            )}

            {couponError && <div className="text-xs font-medium text-[#a4262c]">{couponError}</div>}
          </div>

          {/* Price breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-[#555]">Subtotal</span>
              <span className="font-medium tabular-nums text-[#111]">
                {formatCurrency(originalSubtotal != null ? originalSubtotal : subtotal, currency)}
              </span>
            </div>

            {campaignDiscount > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-[#555]">Campaign</span>
                <span className="font-medium tabular-nums text-[#107c10]">
                  −{formatCurrency(campaignDiscount, currency)}
                </span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-[#555]">Coupon</span>
                <span className="font-medium tabular-nums text-[#107c10]">
                  −{formatCurrency(couponDiscount, currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between gap-4">
              <span className="text-[#555]">Shipping</span>
              <span className="font-medium text-[#111]">Free</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-[#555]">Tax</span>
              <span className="font-medium tabular-nums text-[#111]">{formatCurrency(tax, currency)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-[#f0efed] pt-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-base font-semibold text-[#111]">Total</span>
              <span className="text-xl font-semibold tabular-nums text-[#1466c6]">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Security note */}
        <div className="border-t border-[#f0efed] px-5 py-3 text-center">
          <p className="text-[11px] text-[#bbb]">Checkout is encrypted in transit.</p>
        </div>
      </div>
    </aside>
  );
};

export default CheckoutOrderSummary;
