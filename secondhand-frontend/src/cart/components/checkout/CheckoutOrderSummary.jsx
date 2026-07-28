import { useTranslation } from "react-i18next";
import { memo } from 'react';
import { formatCurrency } from '../../../common/formatters.js';
import { Check, ShoppingBag, ShieldCheck, Ticket } from 'lucide-react';

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
    <aside className="sticky top-14 lg:top-[4.5rem]">
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200/50 transition-all duration-300">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{t("order_summary", "Sipariş Özeti")}</h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              {cartCount} {cartCount === 1 ? t("item", "ürün") : t("items", "ürün")}
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        {/* Items */}
        <div className="max-h-60 overflow-y-auto border-b border-slate-100 px-6 py-3 divide-y divide-slate-100">
          {cartItems.map((item) => {
            const isOffer = !!item.isOffer;
            const hasCampaign = !isOffer && item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
            const unitPrice = isOffer ? (item.offerTotalPrice != null && item.quantity ? parseFloat(item.offerTotalPrice) / item.quantity : item.listing.price) : hasCampaign ? item.listing.campaignPrice : item.listing.price;
            const lineTotal = isOffer ? parseFloat(item.offerTotalPrice) || 0 : parseFloat(unitPrice) * item.quantity;

            return (
              <div key={item.id} className="flex items-center gap-3.5 py-3">
                {/* Thumbnail */}
                {item.listing.imageUrl ? (
                  <img
                    src={item.listing.imageUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover shadow-xs"
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-extrabold text-slate-500 ${item.listing.imageUrl ? 'hidden' : 'flex'}`}>
                  {item.listing.title.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-bold leading-snug text-slate-900">
                    {item.listing.title}
                  </p>
                  {isOffer && <p className="mt-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded w-fit">{t("offer", "Teklif")}</p>}
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500 font-mono">
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
        <div className="space-y-4 px-6 py-5 text-xs">
          {/* Coupon Input */}
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Ticket className="w-3 h-3 text-emerald-600" />
                {t("coupon", "Kupon Kodu")}
              </span>
              {isPreviewLoading && <span className="text-[10px] text-slate-400 font-medium">{t("applying", "Uygulanıyor...")}</span>}
            </div>

            {appliedCouponCode ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
                  <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} />
                  {appliedCouponCode}
                </span>
                <button type="button" onClick={onRemoveCoupon} className="text-xs font-extrabold uppercase tracking-wider text-rose-600 hover:text-rose-700 transition cursor-pointer">
                  {t("remove", "Kaldır")}
                </button>
              </div>
            ) : (
              <div className="flex items-stretch gap-2">
                <input
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder={t("enter_code", "Kupon kodu girin")}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
                <button
                  type="button"
                  onClick={onApplyCoupon}
                  disabled={isPreviewLoading || !couponInput.trim()}
                  className="shrink-0 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  {t("apply", "Uygula")}
                </button>
                <button
                  type="button"
                  onClick={onOpenCouponsModal}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                >
                  {t("browse", "Kuponlarım")}
                </button>
              </div>
            )}

            {couponError && <div className="text-xs font-bold text-rose-600 mt-1">{couponError}</div>}
          </div>

          {/* Price breakdown */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">{t("subtotal", "Ara Toplam")}</span>
              <span className="font-extrabold font-mono text-slate-900">
                {formatCurrency(originalSubtotal != null ? originalSubtotal : subtotal, currency)}
              </span>
            </div>

            {campaignDiscount > 0 && (
              <div className="flex justify-between items-center text-emerald-700">
                <span className="font-bold">{t("campaign", "Kampanya İndirimi")}</span>
                <span className="font-extrabold font-mono">
                  −{formatCurrency(campaignDiscount, currency)}
                </span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-emerald-700">
                <span className="font-bold">{t("coupon", "Kupon İndirimi")}</span>
                <span className="font-extrabold font-mono">
                  −{formatCurrency(couponDiscount, currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">{t("shipping", "Kargo Ücreti")}</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{t("free", "ÜCRETSİZ")}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">{t("tax", "KDV / Hizmet Bedeli")}</span>
              <span className="font-extrabold font-mono text-slate-900">{formatCurrency(tax, currency)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-slate-100 pt-3.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">{t("total", "Toplam Tutar")}</span>
              <span className="text-2xl font-black font-mono text-emerald-700">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-3 text-center flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t("secure_256_bit_ssl_checkout", "256-Bit SSL ile Güvenli Ödeme")}</span>
        </div>
      </div>
    </aside>
  );
};

export default memo(CheckoutOrderSummary);