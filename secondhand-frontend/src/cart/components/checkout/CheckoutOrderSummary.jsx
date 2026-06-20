import { useTranslation } from "react-i18next";
import { memo } from 'react';
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
  onOpenCouponsModal
}) => {
  const {
    t
  } = useTranslation();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = pricing?.subtotalAfterCampaigns != null ? parseFloat(pricing.subtotalAfterCampaigns) : calculateTotal ? calculateTotal() : 0;
  const originalSubtotal = pricing?.originalSubtotal != null ? parseFloat(pricing.originalSubtotal) : null;
  const campaignDiscount = pricing?.campaignDiscount != null ? parseFloat(pricing.campaignDiscount) : 0;
  const couponDiscount = pricing?.couponDiscount != null ? parseFloat(pricing.couponDiscount) : 0;
  const shipping = 0;
  const tax = 0;
  const total = pricing?.total != null ? parseFloat(pricing.total) : subtotal + shipping + tax;
  const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';
  return <aside className="sticky top-14 lg:top-[4.5rem]">
      <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/75 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="px-6 py-5">
          <h3 className="text-sm font-medium text-text-primary uppercase tracking-widest">{t("order_summary")}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-800 tabular-nums">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Items */}
        <div className="max-h-56 overflow-y-auto border-t border-slate-100/60 px-6 py-4">
          {cartItems.map((item, idx) => {
          const isOffer = !!item.isOffer;
          const hasCampaign = !isOffer && item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
          const unitPrice = isOffer ? item.offerTotalPrice != null && item.quantity ? parseFloat(item.offerTotalPrice) / item.quantity : item.listing.price : hasCampaign ? item.listing.campaignPrice : item.listing.price;
          const lineTotal = isOffer ? parseFloat(item.offerTotalPrice) || 0 : parseFloat(unitPrice) * item.quantity;
          return <div key={item.id} className={`flex gap-4 py-3.5 ${idx < cartItems.length - 1 ? 'border-b border-slate-100/40' : ''}`}>
                {/* Thumbnail */}
                {item.listing.imageUrl ? <img src={item.listing.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-slate-100/80 object-cover shadow-sm" onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }} /> : null}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100/80 bg-slate-50 text-xs font-bold text-slate-400 ${item.listing.imageUrl ? 'hidden' : 'flex'}`}>
                  {item.listing.title.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-800">
                    {item.listing.title}
                  </p>
                  {isOffer && <p className="mt-1 text-caption font-bold uppercase tracking-wider text-emerald-600">{t("offer")}</p>}
                  <p className="mt-1 text-xs font-medium text-slate-400 tabular-nums">
                    {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                  </p>
                </div>

                {/* Line total */}
                <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-800">
                  {formatCurrency(lineTotal, item.listing.currency)}
                </span>
              </div>;
        })}
        </div>

        {/* Coupon + breakdown */}
        <div className="space-y-4 border-t border-slate-100/60 px-6 py-5 text-sm">
          {/* Coupon */}
          <div className="space-y-2 border-b border-slate-100/60 pb-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-caption font-bold uppercase tracking-widest text-slate-400">{t("coupon")}</span>
              {isPreviewLoading && <span className="text-xs text-slate-400 font-medium">{t("applying")}</span>}
            </div>

            {appliedCouponCode ? <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50/20 px-4 py-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                  {appliedCouponCode}
                </span>
                <button type="button" onClick={onRemoveCoupon} className="text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:text-indigo-600">{t("remove")}</button>
              </div> : <div className="flex items-stretch gap-2">
                <input value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder={t("enter_code")} className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 shadow-inner" />
                <button type="button" onClick={onApplyCoupon} disabled={isPreviewLoading || !couponInput.trim()} className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-black disabled:bg-slate-100 disabled:text-slate-400">{t("apply")}</button>
                <button type="button" onClick={onOpenCouponsModal} className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50">{t("browse")}</button>
              </div>}

            {couponError && <div className="text-xs font-bold text-red-600">{couponError}</div>}
          </div>

          {/* Price breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 font-medium">{t("subtotal")}</span>
              <span className="font-semibold tabular-nums text-slate-800">
                {formatCurrency(originalSubtotal != null ? originalSubtotal : subtotal, currency)}
              </span>
            </div>

            {campaignDiscount > 0 && <div className="flex justify-between gap-4">
                <span className="text-slate-500 font-medium">{t("campaign")}</span>
                <span className="font-semibold tabular-nums text-emerald-600">
                  −{formatCurrency(campaignDiscount, currency)}
                </span>
              </div>}

            {couponDiscount > 0 && <div className="flex justify-between gap-4">
                <span className="text-slate-500 font-medium">{t("coupon")}</span>
                <span className="font-semibold tabular-nums text-emerald-600">
                  −{formatCurrency(couponDiscount, currency)}
                </span>
              </div>}

            <div className="flex justify-between gap-4">
              <span className="text-slate-500 font-medium">{t("shipping")}</span>
              <span className="font-semibold text-slate-800">{t("free")}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500 font-medium">{t("tax")}</span>
              <span className="font-semibold tabular-nums text-slate-800">{formatCurrency(tax, currency)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-slate-100/60 pt-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{t("total")}</span>
              <span className="text-2xl font-bold tabular-nums text-indigo-600">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Security note */}
        <div className="border-t border-slate-100/40 px-6 py-3.5 text-center">
          <p className="text-caption font-bold uppercase tracking-widest text-slate-400">{t("secure_256_bit_ssl_checkout")}</p>
        </div>
      </div>
    </aside>;
};
export default memo(CheckoutOrderSummary);