import { useTranslation } from "react-i18next";
import { memo } from 'react';
import { formatCurrency } from '../../../common/formatters.js';
import { Check, Tag, ShieldCheck, ShoppingBag } from 'lucide-react';

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
  const { t } = useTranslation();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = pricing?.subtotalAfterCampaigns != null ? parseFloat(pricing.subtotalAfterCampaigns) : calculateTotal ? calculateTotal() : 0;
  const originalSubtotal = pricing?.originalSubtotal != null ? parseFloat(pricing.originalSubtotal) : null;
  const campaignDiscount = pricing?.campaignDiscount != null ? parseFloat(pricing.campaignDiscount) : 0;
  const couponDiscount = pricing?.couponDiscount != null ? parseFloat(pricing.couponDiscount) : 0;
  const shipping = 0;
  const tax = 0;
  const total = pricing?.total != null ? parseFloat(pricing.total) : subtotal + shipping + tax;
  const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';

  return (
    <aside className="sticky top-20">
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">{t("order_summary", "Sipariş Özeti")}</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
            {cartCount} {cartCount === 1 ? 'Ürün' : 'Ürün'}
          </span>
        </div>

        {/* Items */}
        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 px-6">
          {cartItems.map((item) => {
            const isOffer = !!item.isOffer;
            const hasCampaign = !isOffer && item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
            const unitPrice = isOffer ? (item.offerTotalPrice != null && item.quantity ? parseFloat(item.offerTotalPrice) / item.quantity : item.listing.price) : hasCampaign ? item.listing.campaignPrice : item.listing.price;
            const lineTotal = isOffer ? parseFloat(item.offerTotalPrice) || 0 : parseFloat(unitPrice) * item.quantity;

            return (
              <div key={item.id} className="flex items-center gap-3 py-3.5">
                {/* Thumbnail */}
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                  {item.listing.imageUrl ? (
                    <img
                      src={item.listing.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className={`text-xs font-bold text-slate-400 ${item.listing.imageUrl ? 'hidden' : 'flex'}`}>
                    {item.listing.title.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-bold text-slate-900">
                    {item.listing.title}
                  </p>
                  {isOffer && (
                    <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {t("offer", "Özel Teklif")}
                    </span>
                  )}
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                  </p>
                </div>

                {/* Line total */}
                <span className="shrink-0 text-xs font-extrabold font-mono text-slate-900">
                  {formatCurrency(lineTotal, item.listing.currency)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Coupon + breakdown */}
        <div className="space-y-4 border-t border-slate-100 px-6 py-5 text-xs bg-slate-50/30">
          {/* Coupon Input */}
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <Tag className="h-3 w-3 text-emerald-600" />
                {t("coupon", "İndirim Kuponu")}
              </span>
              {isPreviewLoading && <span className="text-[10px] text-slate-400 font-medium">Uygulanıyor...</span>}
            </div>

            {appliedCouponCode ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 font-mono">
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                  {appliedCouponCode}
                </span>
                <button
                  type="button"
                  onClick={onRemoveCoupon}
                  className="text-[11px] font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700 transition"
                >
                  {t("remove", "Kaldır")}
                </button>
              </div>
            ) : (
              <div className="flex items-stretch gap-1.5">
                <input
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder={t("enter_code", "Kupon Kodu")}
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                />
                <button
                  type="button"
                  onClick={onApplyCoupon}
                  disabled={isPreviewLoading || !couponInput.trim()}
                  className="shrink-0 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-xs"
                >
                  {t("apply", "Uygula")}
                </button>
                <button
                  type="button"
                  onClick={onOpenCouponsModal}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50 shadow-xs"
                >
                  {t("browse", "Seç")}
                </button>
              </div>
            )}

            {couponError && <div className="text-[11px] font-bold text-rose-600 mt-1">{couponError}</div>}
          </div>

          {/* Price breakdown */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>{t("subtotal", "Ara Toplam")}</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatCurrency(originalSubtotal != null ? originalSubtotal : subtotal, currency)}
              </span>
            </div>

            {campaignDiscount > 0 && (
              <div className="flex justify-between items-center text-emerald-700 font-medium">
                <span>{t("campaign", "Kampanya İndirimi")}</span>
                <span className="font-mono font-bold">
                  −{formatCurrency(campaignDiscount, currency)}
                </span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-emerald-700 font-medium">
                <span>{t("coupon", "Kupon İndirimi")}</span>
                <span className="font-mono font-bold">
                  −{formatCurrency(couponDiscount, currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>{t("shipping", "Kargo Ücreti")}</span>
              <span className="font-bold text-emerald-600">{t("free", "Ücretsiz")}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>{t("tax", "KDV & Hizmet Bedeli")}</span>
              <span className="font-mono font-semibold text-slate-900">{formatCurrency(tax, currency)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-slate-200 pt-3.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">{t("total", "Toplam")}</span>
              <span className="text-xl font-extrabold font-mono text-emerald-700">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-center flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>256-Bit SSL ile %100 Güvenli Ödeme</span>
        </div>
      </div>
    </aside>
  );
};

export default memo(CheckoutOrderSummary);