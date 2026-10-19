import { useTranslation } from "react-i18next";
import { memo } from 'react';
import { formatCurrency } from '../../common/formatters.js';
import { Check, Tag, Crown, Loader2, X, ArrowRight } from 'lucide-react';

const OrderSummary = ({
  cartItems,
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
        const price = parseFloat(item.listing?.price) || 0;
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
  const currency = cartItems.length > 0 ? cartItems[0].listing?.currency : 'TRY';
  const hasCampaign = campaignDiscount > 0;

  return (
    <aside className="sticky top-20">
      <div className="overflow-hidden rounded border border-border bg-background-primary transition-colors">
        {/* Coupon Section */}
        <div className="border-b border-border-light p-5 space-y-2.5 bg-background-secondary/30">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <Tag className="h-3.5 w-3.5 text-text-secondary" strokeWidth={1.75} />
              {t("coupon", "İndirim Kuponu")}
            </span>
            {isPreviewLoading && (
              <span className="inline-flex items-center gap-1 text-xs text-text-muted font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("calculating", "Hesaplanıyor...")}
              </span>
            )}
          </div>

          {appliedCouponCode ? (
            <div className="flex items-center justify-between gap-2 rounded border border-border bg-background-primary px-3 py-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-success">
                <Check className="h-3.5 w-3.5 text-status-success" strokeWidth={2.5} />
                {appliedCouponCode}
              </span>
              <button
                type="button"
                onClick={onRemoveCoupon}
                className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-status-error transition"
              >
                <X className="h-3.5 w-3.5" />
                <span>{t("remove", "Kaldır")}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-stretch gap-1.5">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder={t("enter_code", "Kupon kodu")}
                className="min-w-0 flex-1 rounded border border-border bg-background-primary px-3 py-1.5 text-xs font-medium text-text-primary outline-none transition placeholder:text-text-muted focus:border-border-focus"
              />
              <button
                type="button"
                onClick={onApplyCoupon}
                disabled={isPreviewLoading || !couponInput.trim()}
                className="inline-flex items-center justify-center rounded bg-primary px-3 text-xs font-medium text-text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40 shrink-0"
              >
                {t("apply", "Uygula")}
              </button>
              <button
                type="button"
                onClick={onOpenCouponsModal}
                className="inline-flex items-center justify-center rounded border border-border bg-background-primary px-2.5 text-xs font-medium text-text-secondary transition hover:bg-background-secondary hover:text-text-primary shrink-0"
              >
                {t("browse", "Seç")}
              </button>
            </div>
          )}

          {couponError && (
            <p className="text-xs font-medium text-status-error">
              {couponError}
            </p>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="p-5 space-y-3 text-xs">
          <div className="flex justify-between items-center text-text-secondary font-medium">
            <span>{t("subtotal", "Ara Toplam")}</span>
            <span className="font-semibold text-text-primary tabular-nums">
              {formatCurrency(originalSubtotal, currency)}
            </span>
          </div>

          {hasCampaign && (
            <div className="flex justify-between items-center text-status-success font-medium">
              <span>{t("campaign", "Kampanya İndirimi")}</span>
              <span className="font-semibold tabular-nums">
                −{formatCurrency(campaignDiscount, currency)}
              </span>
            </div>
          )}

          {couponDiscount > 0 && (
            <div className="flex justify-between items-center text-status-success font-medium">
              <span>{t("coupon", "Kupon İndirimi")}</span>
              <span className="font-semibold tabular-nums">
                −{formatCurrency(couponDiscount, currency)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-text-secondary font-medium">
            <span>{t("shipping", "Kargo Bedeli")}</span>
            <div className="flex items-center gap-1.5">
              {isPremium && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-xs font-semibold text-status-warning bg-background-tertiary border border-border-light">
                  <Crown className="w-3 h-3 text-status-warning" />
                  Öncelikli
                </span>
              )}
              <span className="font-semibold text-status-success">{t("free", "Ücretsiz")}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-text-secondary font-medium">
            <span>{t("tax", "KDV & Hizmet Bedeli")}</span>
            <span className="font-semibold text-text-primary">Dahil</span>
          </div>

          {/* Total Row */}
          <div className="border-t border-border-light pt-3.5 flex items-baseline justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary block">
                {t("total", "Toplam Tutar")}
              </span>
              <span className="text-xs text-text-muted font-normal">KDV Dahil</span>
            </div>
            <span className="text-2xl font-semibold tabular-nums text-text-primary">
              {formatCurrency(total, currency)}
            </span>
          </div>
        </div>

        {/* Priority Shipping Perk */}
        {isPremium ? (
          <div className="border-t border-border-light bg-background-secondary px-5 py-2.5 flex items-center gap-2 text-xs text-text-secondary">
            <Crown className="h-3.5 w-3.5 text-status-warning shrink-0" />
            <span>{t("order_processed_with_priority", "Premium Avantajı: Siparişiniz öncelikli kargolanır.")}</span>
          </div>
        ) : onOpenPremiumModal ? (
          <div className="border-t border-border-light bg-background-secondary px-5 py-2.5 flex items-center justify-between text-xs">
            <span className="text-text-secondary">Kargonuz öncelikli hazırlansın mı?</span>
            <button
              type="button"
              onClick={onOpenPremiumModal}
              className="font-semibold text-text-primary hover:underline text-xs"
            >
              Premium →
            </button>
          </div>
        ) : null}

        {/* Checkout Button */}
        <div className="p-5 border-t border-border-light bg-background-primary">
          <button
            type="button"
            onClick={onCheckout}
            disabled={disabled}
            className="inline-flex items-center justify-center gap-2 rounded bg-primary text-text-inverse hover:bg-primary-hover h-11 px-4 w-full text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>{t("proceed_to_checkout", "Ödeme Adımına Geç")}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-2 text-center text-xs text-text-muted">
            {t("you_will_enter_address_and_payment_on_th", "Sonraki adımda teslimat adresi ve ödeme yöntemi belirlenecektir.")}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default memo(OrderSummary);