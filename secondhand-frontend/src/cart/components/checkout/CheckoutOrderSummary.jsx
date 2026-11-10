import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { Package } from 'lucide-react';
import { formatCurrency } from '../../../common/formatters.js';
import { getCheckoutCurrency, getCheckoutLinePricing } from '../../utils/checkoutLinePricing.js';

const toNumber = (v) => (v != null ? parseFloat(v) : null);

const CheckoutOrderSummary = ({ cartItems = [], calculateTotal, pricing }) => {
  const { t } = useTranslation();
  const currency = getCheckoutCurrency(cartItems);
  const subtotal = toNumber(pricing?.subtotalAfterCampaigns) ?? (calculateTotal ? calculateTotal() : 0);
  const originalSubtotal = toNumber(pricing?.originalSubtotal);
  const discounts = (toNumber(pricing?.campaignDiscount) || 0) + (toNumber(pricing?.couponDiscount) || 0);
  const total = toNumber(pricing?.total) ?? subtotal - (toNumber(pricing?.couponDiscount) || 0);
  const itemCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return (
    <aside className="lg:sticky lg:top-20">
      <div className="rounded-md border border-border bg-background-primary shadow-sm">
        <div className="flex items-baseline justify-between border-b border-border-light px-5 py-4">
          <h2 className="text-sm font-semibold text-text-primary">{t('order_summary', 'Sipariş özeti')}</h2>
          <span className="text-xs tabular-nums text-text-tertiary">
            {t('checkout_item_count', { defaultValue: '{{count}} ürün', count: itemCount })}
          </span>
        </div>

        <ul className="max-h-96 divide-y divide-border-light overflow-y-auto px-5">
          {cartItems.map((item) => {
            const { unitPrice, lineTotal, quantity } = getCheckoutLinePricing(item);
            const listing = item.listing || {};
            const seller = [listing.sellerName, listing.sellerSurname].filter(Boolean).join(' ') || listing.sellerUsername;
            return (
              <li key={item.id} className="flex items-start gap-3 py-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-light bg-background-tertiary">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-text-primary">{listing.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-text-tertiary">
                    {item.isOffer && (
                      <span className="inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-text-secondary bg-background-secondary">
                        {t('offer', 'Teklif')}
                      </span>
                    )}
                    <span className="truncate">
                      {[
                        quantity > 1 ? `${quantity} × ${formatCurrency(unitPrice, listing.currency || currency)}` : null,
                        seller
                      ].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums text-text-primary">
                  {formatCurrency(lineTotal, listing.currency || currency)}
                </span>
              </li>
            );
          })}
        </ul>

        <dl className="space-y-2 border-t border-border-light px-5 py-4 text-sm">
          <div className="flex justify-between text-text-secondary">
            <dt>{t('subtotal', 'Ara toplam')}</dt>
            <dd className="tabular-nums">{formatCurrency(originalSubtotal ?? subtotal, currency)}</dd>
          </div>
          {discounts > 0 && (
            <div className="flex justify-between text-text-secondary">
              <dt>{t('discount', 'İndirim')}</dt>
              <dd className="tabular-nums font-medium text-status-success-text">−{formatCurrency(discounts, currency)}</dd>
            </div>
          )}
          <div className="flex justify-between text-text-secondary">
            <dt>{t('shipping', 'Kargo')}</dt>
            <dd>{t('free', 'Ücretsiz')}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-border-light pt-3">
            <dt className="font-medium text-text-primary">{t('total', 'Toplam')}</dt>
            <dd className="text-lg font-semibold tabular-nums text-text-price">{formatCurrency(total, currency)}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
};

export default memo(CheckoutOrderSummary);
