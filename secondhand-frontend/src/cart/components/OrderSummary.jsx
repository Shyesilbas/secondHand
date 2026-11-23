import { useTranslation } from 'react-i18next';
import { memo, useId } from 'react';
import { formatCurrency } from '../../common/formatters.js';
import { Check, Crown, Loader2, ArrowRight } from 'lucide-react';
import { FieldError } from '../../common/components/forms/FormPrimitives.jsx';
import { Button, Card } from '../../common/components/ui/index.js';
import { inputError, inputNormal } from '../../common/components/forms/inputStyles.js';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { getCheckoutCurrency } from '../utils/pricedLines.js';
import { useFeeSchedule } from '../../fees/hooks/useFeeSchedule.js';
import { countShippingOrders } from '../utils/shipping.js';

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
  const couponInputId = useId();
  const couponErrorId = useId();

  // Every amount comes from the backend pricing preview; while it loads the amounts show skeletons.
  const currency = getCheckoutCurrency(cartItems);
  const hasCampaign = Number(pricing?.campaignDiscount) > 0;
  const hasCoupon = Number(pricing?.couponDiscount) > 0;
  // Cargo estimate per seller order; safe meetup (chosen at checkout) has no shipping fee.
  const { schedule: feeSchedule } = useFeeSchedule();
  const shippingOrders = countShippingOrders(pricing, feeSchedule?.freeShippingThreshold);
  const shippingEstimate = (Number(feeSchedule?.shippingFee) || 0) * shippingOrders.paid;
  const amount = (value, skeletonClass = 'h-4 w-16') => (pricing ? formatCurrency(value, currency) : <Skeleton className={skeletonClass} />);

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!isPreviewLoading && couponInput.trim()) {
      onApplyCoupon();
    }
  };

  return (
    <aside className="lg:sticky lg:top-24">
      <Card padding="none">
        <h2 className="sr-only">{t('order_summary', 'Sipariş özeti')}</h2>

        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <label htmlFor={couponInputId} className="text-sm font-medium text-text-primary">
              {t('coupon', 'İndirim Kuponu')}
            </label>
            {isPreviewLoading && (
              <span className="inline-flex items-center gap-1 text-sm text-text-tertiary">
                <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" strokeWidth={1.5} aria-hidden />
                {t('calculating', 'Hesaplanıyor...')}
              </span>
            )}
          </div>

          {appliedCouponCode ? (
            <div className="flex items-center justify-between gap-2 rounded bg-background-secondary px-3 py-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-status-success-text">
                <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {appliedCouponCode}
              </span>
              <Button variant="ghost" size="sm" onClick={onRemoveCoupon}>
                {t('remove', 'Kaldır')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCouponSubmit} className="flex items-stretch gap-2">
              <input
                id={couponInputId}
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder={t('enter_code', 'Kupon kodu')}
                aria-invalid={Boolean(couponError)}
                aria-describedby={couponError ? couponErrorId : undefined}
                className={`${couponError ? inputError : inputNormal} h-10 min-w-0 flex-1`}
              />
              <Button type="submit" disabled={isPreviewLoading || !couponInput.trim()} className="shrink-0">
                {t('apply', 'Uygula')}
              </Button>
              <Button variant="secondary" onClick={onOpenCouponsModal} className="shrink-0">
                {t('browse', 'Seç')}
              </Button>
            </form>
          )}

          <FieldError id={couponErrorId} error={couponError} />
        </div>

        <dl className={`space-y-3 border-t border-border-light p-5 text-sm transition-opacity duration-150 ${isRepricing ? 'opacity-50' : ''}`} aria-busy={isRepricing}>
          <div className="flex items-center justify-between text-text-secondary">
            <dt>{t('subtotal', 'Ara Toplam')}</dt>
            <dd className="font-medium tabular-nums text-text-primary">{amount(pricing?.originalSubtotal)}</dd>
          </div>

          {hasCampaign && (
            <div className="flex items-center justify-between text-status-success-text">
              <dt>{t('campaign', 'Kampanya İndirimi')}</dt>
              <dd className="font-medium tabular-nums">−{amount(pricing?.campaignDiscount)}</dd>
            </div>
          )}

          {hasCoupon && (
            <div className="flex items-center justify-between text-status-success-text">
              <dt>{t('coupon', 'Kupon İndirimi')}</dt>
              <dd className="font-medium tabular-nums">−{amount(pricing?.couponDiscount)}</dd>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-text-secondary">
            <dt>{t('shipping', 'Kargo Bedeli')}</dt>
            <dd className="text-right font-medium tabular-nums text-text-primary">
              {!pricing || !feeSchedule
                ? <Skeleton className="h-4 w-16" />
                : shippingEstimate > 0
                  ? formatCurrency(shippingEstimate, currency)
                  : t('free', 'Ücretsiz')}
            </dd>
          </div>
          {pricing && Number(feeSchedule?.freeShippingThreshold) > 0 ? (
            <p className="text-sm text-text-tertiary">
              {t('cart_free_shipping_note', '{{amount}} ve üzeri alışverişte kargo ücretsiz.', { amount: formatCurrency(feeSchedule.freeShippingThreshold, currency) })}
            </p>
          ) : null}

          <div className="flex items-center justify-between text-text-secondary">
            <dt>{t('tax', 'KDV & Hizmet Bedeli')}</dt>
            <dd className="font-medium text-text-primary">{t('included', 'Dahil')}</dd>
          </div>

          <div className="flex items-baseline justify-between gap-4 border-t border-border-light pt-4">
            <dt>
              <span className="block text-sm font-medium text-text-primary">{t('order_total', 'Toplam')}</span>
              <span className="text-sm text-text-tertiary">{t('vat_included', 'KDV dahil')}</span>
            </dt>
            <dd className="text-2xl font-semibold tabular-nums tracking-tight text-text-price">
              {amount(pricing?.total, 'h-7 w-28')}
            </dd>
          </div>
        </dl>

        <div className="space-y-3 p-5 pt-0">
          {isPremium ? (
            <p className="flex items-center gap-2 text-sm text-text-secondary">
              <Crown className="h-4 w-4 shrink-0 text-status-warning" strokeWidth={1.5} aria-hidden />
              <span>{t('order_processed_with_priority', 'Premium avantajı: Siparişiniz öncelikli kargolanır.')}</span>
            </p>
          ) : onOpenPremiumModal ? (
            <p className="flex items-center justify-between gap-2 text-sm text-text-secondary">
              <span>{t('priority_shipping_question', 'Kargonuz öncelikli hazırlansın mı?')}</span>
              <button
                type="button"
                onClick={onOpenPremiumModal}
                className="shrink-0 rounded-sm font-medium text-text-link transition-colors duration-150 hover:text-text-linkHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                Premium
              </button>
            </p>
          ) : null}

          <Button onClick={onCheckout} disabled={disabled} className="w-full">
            <span>{t('proceed_to_checkout', 'Ödeme Adımına Geç')}</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
        </div>
      </Card>
    </aside>
  );
};

export default memo(OrderSummary);