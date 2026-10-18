import { useTranslation } from "react-i18next";
import { memo } from 'react';
import { formatCurrency } from '../../common/formatters.js';
import { Check, Tag, ShieldCheck, ShoppingBag, Crown, Loader2, X, ArrowRight } from 'lucide-react';

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
      <div className="overflow-hidden rounded-md border border-border/90 bg-white transition-all duration-300">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4.5 bg-background-secondary/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-text-primary" />
            <h3 className="text-xs font-semibold text-text-primary">
              {t("order_summary", "Sipariş Özeti")}
            </h3>
          </div>
          <span className="text-xs font-semibold text-text-secondary bg-white px-2.5 py-0.5 rounded-sm border border-border">
            {cartCount} {cartCount === 1 ? 'Ürün' : 'Ürün'}
          </span>
        </div>

        {/* ── Scrollable Items List ──────────────────────────────── */}
        <div className="max-h-[min(260px,35vh)] overflow-y-auto divide-y divide-border-light px-6">
          {cartItems.map((item) => {
            const itemPrice = parseFloat(item.listing.campaignPrice ?? item.listing.price) || 0;
            const itemTotal = itemPrice * item.quantity;

            return (
              <div key={item.id} className="flex items-center gap-3 py-3.5">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded border border-border bg-background-secondary flex items-center justify-center">
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
                  <span className={`text-xs font-semibold text-text-muted ${item.listing.imageUrl ? 'hidden' : 'flex'}`}>
                    {item.listing.title.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-semibold text-text-primary">
                    {item.listing.title}
                  </p>
                  <p className="text-xs text-text-tertiary font-medium mt-0.5">
                    {item.quantity} × {formatCurrency(itemPrice, item.listing.currency)}
                  </p>
                </div>

                <span className="shrink-0 text-xs font-semibold text-text-primary">
                  {formatCurrency(itemTotal, item.listing.currency)}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Coupon Operations in Cart ──────────────────────────── */}
        <div className="border-t border-border-light bg-background-secondary/40 p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-text-tertiary">
                <Tag className="h-3.5 w-3.5 text-text-secondary" />
                {t("coupon", "İndirim Kuponu")}
              </span>
              {isPreviewLoading && (
                <span className="inline-flex items-center gap-1 text-xs text-text-muted font-medium">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Hesaplanıyor...
                </span>
              )}
            </div>

            {appliedCouponCode ? (
              <div className="flex items-center justify-between gap-2 rounded border border-border bg-background-secondary px-3.5 py-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-success-text">
                  <Check className="h-3.5 w-3.5 text-status-success-text" strokeWidth={3} />
                  {appliedCouponCode}
                </span>
                <button
                  type="button"
                  onClick={onRemoveCoupon}
                  className="flex items-center gap-1 text-xs font-semibold text-status-error-text hover:text-status-error-text transition cursor-pointer"
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
                  className="min-w-0 flex-1 rounded border border-border bg-white px-3.5 py-2 text-xs font-semibold text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={onApplyCoupon}
                  disabled={isPreviewLoading || !couponInput.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3 shrink-0"
                >
                  {t("apply", "Uygula")}
                </button>
                <button
                  type="button"
                  onClick={onOpenCouponsModal}
                  className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3 shrink-0"
                >
                  {t("browse", "Seç")}
                </button>
              </div>
            )}

            {couponError && (
              <div className="text-xs font-semibold text-status-error-text duration-150">
                {couponError}
              </div>
            )}
          </div>

          {/* ── Price Breakdown ──────────────────────────────────── */}
          <div className="space-y-2.5 pt-2 border-t border-border/80 text-xs">
            <div className="flex justify-between items-center text-text-secondary font-medium">
              <span>{t("subtotal", "Ara Toplam")}</span>
              <span className="font-semibold text-text-primary">
                {formatCurrency(originalSubtotal, currency)}
              </span>
            </div>

            {hasCampaign && (
              <div className="flex justify-between items-center text-status-success-text font-medium">
                <span>{t("campaign", "Kampanya İndirimi")}</span>
                <span className="font-semibold">
                  −{formatCurrency(campaignDiscount, currency)}
                </span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-status-success-text font-medium">
                <span>{t("coupon", "Kupon İndirimi")}</span>
                <span className="font-semibold">
                  −{formatCurrency(couponDiscount, currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-text-secondary font-medium">
              <span>{t("shipping", "Kargo Bedeli")}</span>
              <div className="flex items-center gap-1.5">
                {isPremium && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold text-status-warning-text bg-background-secondary border border-border">
                    <Crown className="w-2.5 h-2.5 fill-status-warning text-status-warning-text" />
                    Öncelikli
                  </span>
                )}
                <span className="font-semibold text-status-success-text">{t("free", "Ücretsiz")}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-text-secondary font-medium">
              <span>{t("tax", "KDV & Hizmet Bedeli")}</span>
              <span className="font-semibold text-text-primary">Dahil</span>
            </div>

            {/* Total Row */}
            <div className="border-t border-border pt-3 flex items-baseline justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-text-primary block">
                  {t("total", "Toplam Tutar")}
                </span>
                <span className="text-xs text-text-muted font-medium">Vergiler Dahil</span>
              </div>
              <span className="text-2xl font-semibold text-text-primary">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Priority Shipping Perk Banner ────────────────────────── */}
        {isPremium ? (
          <div className="border-t border-border bg-background-secondary/70 px-6 py-3 flex items-center gap-2 text-xs text-status-warning-text font-medium">
            <Crown className="h-4 w-4 text-status-warning-text fill-status-warning shrink-0" />
            <span>{t("order_processed_with_priority", "Premium Avantajı: Siparişiniz öncelikli kargolanır.")}</span>
          </div>
        ) : onOpenPremiumModal ? (
          <div className="border-t border-border-light bg-background-secondary px-6 py-3 flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium">Kargonuz öncelikli hazırlansın mı?</span>
            <button
              type="button"
              onClick={onOpenPremiumModal}
              className="font-semibold text-status-warning-text hover:text-status-warning-text cursor-pointer text-xs flex items-center gap-1"
            >
              <span>{t('explore_premium', "Premium")}</span>
              <span>→</span>
            </button>
          </div>
        ) : null}

        {/* ── Checkout Button ─────────────────────────────────────── */}
        <div className="p-6 pt-4 border-t border-border-light">
          <button
            type="button"
            onClick={onCheckout}
            disabled={disabled}
            className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4 w-full"
          >
            <span>{t("proceed_to_checkout", "Ödeme Adımına Geç")}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-2.5 text-center text-xs text-text-muted font-medium">
            {t("you_will_enter_address_and_payment_on_th", "Sonraki adımda adres ve ödeme bilgilerinizi belirleyeceksiniz.")}
          </p>
        </div>

        {/* ── Trust Seal Footer ────────────────────────────────────── */}
        <div className="border-t border-border-light bg-background-secondary/50 px-6 py-3 text-center flex items-center justify-center gap-2 text-xs font-semibold text-text-tertiary">
          <ShieldCheck className="h-3.5 w-3.5 text-status-success-text" />
          <span>256-Bit SSL ile %100 Güvenli Ödeme</span>
        </div>
      </div>
    </aside>
  );
};

export default memo(OrderSummary);