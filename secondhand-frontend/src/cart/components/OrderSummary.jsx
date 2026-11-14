import { useTranslation } from "react-i18next";
import { memo } from 'react';
import { formatCurrency } from '../../common/formatters.js';
import { Check, Tag, Crown, Loader2, X, ArrowRight } from 'lucide-react';
import { FieldError } from '../../common/components/forms/FormPrimitives.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { getCheckoutCurrency } from '../utils/pricedLines.js';

const OrderSummary = ({
  cartItems,
  onCheckout,
  pricing,
  disabled = false,
  couponInput = '',
  setCouponInput = () => { },
  appliedCouponCode = null,
  couponError = null,
  isPreviewLoading = false,
  isRepricing = false,
  onApplyCoupon = () => { },
  onRemoveCoupon = () => { },
  onOpenCouponsModal = () => { },
  isPremium = false,
  onOpenPremiumModal = null,
}) => {
  const { t } = useTranslation();

  // Every amount comes from the backend pricing preview; while it loads the amounts show skeletons.
  const currency = getCheckoutCurrency(cartItems);
  const hasCampaign = Number(pricing?.campaignDiscount) > 0;
  const hasCoupon = Number(pricing?.couponDiscount) > 0;
  const amount = (value, skeletonClass = 'h-4 w-16') => (pricing ? formatCurrency(value, currency) : <Skeleton className={skeletonClass} />);

  return (
    <aside className="sticky top-20">
      <div className="overflow-hidden rounded-md border border-border bg-background-primary shadow-sm">
        {/* Coupon Section */}
        <div className="border-b border-border-light p-5 space-y-2.5 bg-background-secondary">
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
            <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background-primary px-3 py-2">
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
                className="min-w-0 flex-1 rounded-md border border-border bg-background-primary px-3 py-1.5 text-xs font-medium text-text-primary outline-none transition placeholder:text-text-muted focus:border-border-focus"
              />
              <button
                type="button"
                onClick={onApplyCoupon}
                disabled={isPreviewLoading || !couponInput.trim()}
                className="inline-flex items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40 shrink-0"
              >
                {t("apply", "Uygula")}
              </button>
              <button
                type="button"
                onClick={onOpenCouponsModal}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background-primary px-2.5 text-xs font-medium text-text-secondary transition hover:bg-background-secondary hover:text-text-primary shrink-0"
              >
                {t("browse", "Seç")}
              </button>
            </div>
          )}

          <FieldError error={couponError} />
        </div>

        {/* Pricing Breakdown */}
        <div className={`p-5 space-y-3 text-xs transition-opacity duration-150 ${isRepricing ? 'opacity-50' : ''}`} aria-busy={isRepricing}>
          <div className="flex justify-between items-center text-text-secondary font-medium">
            <span>{t("subtotal", "Ara Toplam")}</span>
            <span className="font-semibold text-text-primary tabular-nums">
              {amount(pricing?.originalSubtotal)}
            </span>
          </div>

          {hasCampaign && (
            <div className="flex justify-between items-center text-status-success font-medium">
              <span>{t("campaign", "Kampanya İndirimi")}</span>
              <span className="font-semibold tabular-nums">
                −{amount(pricing?.campaignDiscount)}
              </span>
            </div>
          )}

          {hasCoupon && (
            <div className="flex justify-between items-center text-status-success font-medium">
              <span>{t("coupon", "Kupon İndirimi")}</span>
              <span className="font-semibold tabular-nums">
                −{amount(pricing?.couponDiscount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-text-secondary font-medium">
            <span>{t("shipping", "Kargo Bedeli")}</span>
            <div className="flex items-center gap-1.5">
              {isPremium && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-status-warning-text bg-status-warning-bg border border-status-warning-border">
                  <Crown className="w-3 h-3 text-status-warning" />
                  {t('priority', 'Öncelikli')}
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
            <span className="text-2xl font-semibold tabular-nums text-text-price">
              {amount(pricing?.total, 'h-7 w-28')}
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
            <span className="text-text-secondary">{t("priority_shipping_question", "Kargonuz öncelikli hazırlansın mı?")}</span>
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
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-text-inverse hover:bg-primary-hover h-11 px-4 w-full text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
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