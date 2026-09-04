import { useTranslation } from "react-i18next";
import React, { memo } from 'react';
import { formatCurrency } from '../../common/formatters.js';
import { 
  Check, 
  Tag, 
  ShieldCheck, 
  ShoppingBag, 
  Crown, 
  Sparkles, 
  Loader2, 
  X, 
  ArrowRight 
} from 'lucide-react';

const OrderSummary = ({
  cartItems,
  cartCount,
  calculateTotal,
  onCheckout,
  pricing,
  disabled = false,
  couponInput = '',
  setCouponInput = () => {},
  appliedCouponCode = null,
  couponError = null,
  isPreviewLoading = false,
  onApplyCoupon = () => {},
  onRemoveCoupon = () => {},
  onOpenCouponsModal = () => {},
  isPremium = false,
  onOpenPremiumModal = null,
}) => {
  const { t } = useTranslation();
  
  const originalSubtotal = pricing?.originalSubtotal != null 
    ? parseFloat(pricing.originalSubtotal) 
    : cartItems.reduce((sum, item) => {
        const price = parseFloat(item.listing.price) || 0;
        return sum + price * item.quantity;
      }, 0);

  const subtotalAfterCampaigns = pricing?.subtotalAfterCampaigns != null
    ? parseFloat(pricing.subtotalAfterCampaigns)
    : calculateTotal();

  const campaignDiscount = pricing?.campaignDiscount != null 
    ? parseFloat(pricing.campaignDiscount) 
    : Math.max(0, (originalSubtotal || 0) - (subtotalAfterCampaigns || 0));

  const couponDiscount = pricing?.couponDiscount != null 
    ? parseFloat(pricing.couponDiscount) 
    : 0;

  const total = pricing?.total != null ? parseFloat(pricing.total) : subtotalAfterCampaigns - couponDiscount;
  const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';
  const hasCampaign = campaignDiscount > 0;

  return (
    <aside className="sticky top-20">
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-slate-900" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {t("order_summary", "Sipariş Özeti")}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
            {cartCount} {cartCount === 1 ? 'Ürün' : 'Ürün'}
          </span>
        </div>

        {/* ── Scrollable Items List ──────────────────────────────── */}
        <div className="max-h-[min(260px,35vh)] overflow-y-auto divide-y divide-slate-100 px-6">
          {cartItems.map((item) => {
            const itemPrice = parseFloat(item.listing.campaignPrice ?? item.listing.price) || 0;
            const itemTotal = itemPrice * item.quantity;

            return (
              <div key={item.id} className="flex items-center gap-3 py-3.5">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                  {item.listing.imageUrl ? (
                    <img
                      src={item.listing.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={e => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className={`text-xs font-bold text-slate-400 ${item.listing.imageUrl ? 'hidden' : 'flex'}`}>
                    {item.listing.title.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-bold text-slate-900">
                    {item.listing.title}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {item.quantity} × {formatCurrency(itemPrice, item.listing.currency)}
                  </p>
                </div>

                <span className="shrink-0 text-xs font-black text-slate-900">
                  {formatCurrency(itemTotal, item.listing.currency)}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Coupon Operations in Cart ──────────────────────────── */}
        <div className="border-t border-slate-100 bg-slate-50/40 p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <Tag className="h-3.5 w-3.5 text-slate-700" />
                {t("coupon", "İndirim Kuponu")}
              </span>
              {isPreviewLoading && (
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Hesaplanıyor...
                </span>
              )}
            </div>

            {appliedCouponCode ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800">
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                  {appliedCouponCode}
                </span>
                <button
                  type="button"
                  onClick={onRemoveCoupon}
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700 transition cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  {t("remove", "Kaldır")}
                </button>
              </div>
            ) : (
              <div className="flex items-stretch gap-1.5">
                <input
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder={t("enter_code", "Kupon Kodu")}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                />
                <button
                  type="button"
                  onClick={onApplyCoupon}
                  disabled={isPreviewLoading || !couponInput.trim()}
                  className="shrink-0 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 shadow-xs"
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

            {couponError && (
              <div className="text-[11px] font-bold text-rose-600 animate-in fade-in duration-150">
                {couponError}
              </div>
            )}
          </div>

          {/* ── Price Breakdown ──────────────────────────────────── */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200/80 text-xs">
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>{t("subtotal", "Ara Toplam")}</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(originalSubtotal, currency)}
              </span>
            </div>

            {hasCampaign && (
              <div className="flex justify-between items-center text-emerald-700 font-medium">
                <span>{t("campaign", "Kampanya İndirimi")}</span>
                <span className="font-bold">
                  −{formatCurrency(campaignDiscount, currency)}
                </span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-emerald-700 font-medium">
                <span>{t("coupon", "Kupon İndirimi")}</span>
                <span className="font-bold">
                  −{formatCurrency(couponDiscount, currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>{t("shipping", "Kargo Bedeli")}</span>
              <div className="flex items-center gap-1.5">
                {isPremium && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200">
                    <Crown className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />
                    Öncelikli
                  </span>
                )}
                <span className="font-bold text-emerald-700">{t("free", "Ücretsiz")}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>{t("tax", "KDV & Hizmet Bedeli")}</span>
              <span className="font-bold text-slate-900">Dahil</span>
            </div>

            {/* Total Row */}
            <div className="border-t border-slate-200 pt-3 flex items-baseline justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                  {t("total", "Toplam Tutar")}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Vergiler Dahil</span>
              </div>
              <span className="text-2xl font-black text-slate-900">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Priority Shipping Perk Banner ────────────────────────── */}
        {isPremium ? (
          <div className="border-t border-amber-100 bg-amber-50/70 px-6 py-3 flex items-center gap-2 text-xs text-amber-900 font-medium">
            <Crown className="h-4 w-4 text-amber-600 fill-amber-500 shrink-0" />
            <span>{t("order_processed_with_priority", "Premium Avantajı: Siparişiniz öncelikli kargolanır.")}</span>
          </div>
        ) : onOpenPremiumModal ? (
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Kargonuz öncelikli hazırlansın mı?</span>
            <button
              type="button"
              onClick={onOpenPremiumModal}
              className="font-bold text-amber-800 hover:text-amber-900 uppercase tracking-wider cursor-pointer text-[11px] flex items-center gap-1"
            >
              <span>{t('explore_premium', "Premium")}</span>
              <span>→</span>
            </button>
          </div>
        ) : null}

        {/* ── Checkout Button ─────────────────────────────────────── */}
        <div className="p-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCheckout}
            disabled={disabled}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all"
          >
            <span>{t("proceed_to_checkout", "Ödeme Adımına Geç")}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-2.5 text-center text-[11px] text-slate-400 font-medium">
            {t("you_will_enter_address_and_payment_on_th", "Sonraki adımda adres ve ödeme bilgilerinizi belirleyeceksiniz.")}
          </p>
        </div>

        {/* ── Trust Seal Footer ────────────────────────────────────── */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-center flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>256-Bit SSL ile %100 Güvenli Ödeme</span>
        </div>
      </div>
    </aside>
  );
};

export default memo(OrderSummary);