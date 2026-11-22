import { useTranslation } from "react-i18next";
import { memo } from 'react';
import { formatCurrency } from '../../common/formatters.js';
import { Check, Crown, Loader2, ArrowRight } from 'lucide-react';
import { FieldError } from '../../common/components/forms/FormPrimitives.jsx';
import { Button, Card } from '../../common/components/ui/index.js';
import { inputNormal } from '../../common/components/forms/inputStyles.js';
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
      <Card padding="none">
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">{t("coupon", "İndirim Kuponu")}</span>
            {isPreviewLoading && (
              <span className="inline-flex items-center gap-1 text-sm text-text-tertiary">
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} aria-hidden />
                {t("calculating", "Hesaplanıyor...")}
              </span>
            )}
          </div>

          {appliedCouponCode ? (
            <div className="flex items-center justify-between gap-2 rounded bg-background-secondary px-3 py-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-status-success-text">
                <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {appliedCouponCode}
              </span>
              <Button variant="ghost" size="sm" onClick={onRemoveCoupon} className="-mr-2 h-8">
                {t("remove", "Kaldır")}
              </Button>
            </div>
          ) : (
            <div className="flex items-stretch gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder={t("enter_code", "Kupon kodu")}
                aria-label={t("coupon", "İndirim Kuponu")}
                className={`${inputNormal} h-10 min-w-0 flex-1`}
              />
              <Button onClick={onApplyCoupon} disabled={isPreviewLoading || !couponInput.trim()} className="shrink-0">
                {t("apply", "Uygula")}
              </Button>
              <Button variant="secondary" onClick={onOpenCouponsModal} className="shrink-0">
                {t("browse", "Seç")}
              </Button>
            </div>
          )}

          <FieldError error={couponError} />
        </div>

        <div className={`space-y-3 border-t border-border-light p-5 text-sm transition-opacity duration-150 ${isRepricing ? 'opacity-50' : ''}`} aria-busy={isRepricing}>
          <div className="flex items-center justify-between text-text-secondary">
            <span>{t("subtotal", "Ara Toplam")}</span>
            <span className="font-medium tabular-nums text-text-primary">{amount(pricing?.originalSubtotal)}</span>
          </div>

          {hasCampaign && (
            <div className="flex items-center justify-between text-status-success-text">
              <span>{t("campaign", "Kampanya İndirimi")}</span>
              <span className="font-medium tabular-nums">−{amount(pricing?.campaignDiscount)}</span>
            </div>
          )}

          {hasCoupon && (
            <div className="flex items-center justify-between text-status-success-text">
              <span>{t("coupon", "Kupon İndirimi")}</span>
              <span className="font-medium tabular-nums">−{amount(pricing?.couponDiscount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-text-secondary">
            <span>{t("shipping", "Kargo Bedeli")}</span>
            <span className="inline-flex items-center gap-2">
              {isPremium && (
                <span className="inline-flex items-center gap-1 text-text-tertiary">
                  <Crown className="h-4 w-4 text-status-warning" strokeWidth={1.5} aria-hidden />
                  {t('priority', 'Öncelikli')}
                </span>
              )}
              <span className="font-medium text-status-success-text">{t("free", "Ücretsiz")}</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-text-secondary">
            <span>{t("tax", "KDV & Hizmet Bedeli")}</span>
            <span className="font-medium text-text-primary">Dahil</span>
          </div>

          <div className="flex items-baseline justify-between gap-4 border-t border-border-light pt-4">
            <div>
              <span className="block text-sm font-medium text-text-primary">{t("total", "Toplam Tutar")}</span>
              <span className="text-sm text-text-tertiary">KDV Dahil</span>
            </div>
            <span className="text-2xl font-semibold tabular-nums text-text-price">
              {amount(pricing?.total, 'h-7 w-28')}
            </span>
          </div>
        </div>

        <div className="space-y-3 p-5 pt-0">
          {isPremium ? (
            <p className="flex items-center gap-2 text-sm text-text-secondary">
              <Crown className="h-4 w-4 shrink-0 text-status-warning" strokeWidth={1.5} aria-hidden />
              <span>{t("order_processed_with_priority", "Premium Avantajı: Siparişiniz öncelikli kargolanır.")}</span>
            </p>
          ) : onOpenPremiumModal ? (
            <p className="flex items-center justify-between gap-2 text-sm text-text-secondary">
              <span>{t("priority_shipping_question", "Kargonuz öncelikli hazırlansın mı?")}</span>
              <button
                type="button"
                onClick={onOpenPremiumModal}
                className="shrink-0 rounded-sm font-medium text-text-link transition-colors duration-150 hover:text-text-linkHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                Premium
              </button>
            </p>
          ) : null}

          <Button onClick={onCheckout} disabled={disabled} className="h-11 w-full">
            <span>{t("proceed_to_checkout", "Ödeme Adımına Geç")}</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
          <p className="text-center text-sm text-text-tertiary">
            {t("you_will_enter_address_and_payment_on_th", "Sonraki adımda teslimat adresi ve ödeme yöntemi belirlenecektir.")}
          </p>
        </div>
      </Card>
    </aside>
  );
};

export default memo(OrderSummary);