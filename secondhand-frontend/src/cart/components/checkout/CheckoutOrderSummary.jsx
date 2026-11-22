import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { Package } from 'lucide-react';
import { formatCurrency } from '../../../common/formatters.js';
import Skeleton from '../../../common/components/ui/Skeleton.jsx';
import { getCheckoutCurrency, indexPricedLines } from '../../utils/pricedLines.js';

// Line and total amounts come only from the backend pricing preview; skeletons show while it loads.
const CheckoutOrderSummary = ({ cartItems = [], pricing }) => {
  const { t } = useTranslation();
  const currency = getCheckoutCurrency(cartItems);
  const pricedLines = indexPricedLines(pricing);
  const hasDiscount = Number(pricing?.discountTotal) > 0;
  const itemCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const amount = (value, cur = currency, skeletonClass = 'h-4 w-16') =>
    (pricing ? formatCurrency(value, cur) : <Skeleton className={skeletonClass} />);

  return (
    <aside className="lg:sticky lg:top-36">
      <div className="overflow-hidden rounded border border-border-light bg-background-primary shadow-sm">
        <div className="flex items-baseline justify-between px-5 pb-2 pt-5">
          <h2 className="text-sm font-semibold text-text-primary">{t('order_summary', 'Sipariş özeti')}</h2>
          <span className="text-sm tabular-nums text-text-tertiary">
            {t('checkout_item_count', { defaultValue: '{{count}} ürün', count: itemCount })}
          </span>
        </div>

        <ul className="max-h-96 overflow-y-auto px-5">
          {cartItems.map((item) => {
            const listing = item.listing || {};
            const line = pricedLines.get(listing.id);
            const quantity = line?.quantity ?? item.quantity;
            const lineCurrency = listing.currency || currency;
            const seller = [listing.sellerName, listing.sellerSurname].filter(Boolean).join(' ') || listing.sellerUsername;
            return (
              <li key={item.id} className="flex items-start gap-3 py-2.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-background-tertiary">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-text-primary">{listing.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-text-tertiary">
                    {item.isOffer && (
                      <span className="font-medium text-text-secondary">
                        {t('offer', 'Teklif')} ·
                      </span>
                    )}
                    <span className="truncate">
                      {[
                        quantity > 1 && line ? `${quantity} × ${formatCurrency(line.campaignUnitPrice, lineCurrency)}` : null,
                        seller
                      ].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums text-text-primary">
                  {line ? formatCurrency(line.lineSubtotal, lineCurrency) : <Skeleton className="h-4 w-16" />}
                </span>
              </li>
            );
          })}
        </ul>

        <dl className="mt-2 space-y-2 bg-background-secondary px-5 py-4 text-sm">
          <div className="flex justify-between text-text-secondary">
            <dt>{t('subtotal', 'Ara toplam')}</dt>
            <dd className="tabular-nums">{amount(pricing?.originalSubtotal)}</dd>
          </div>
          {hasDiscount && (
            <div className="flex justify-between text-text-secondary">
              <dt>{t('discount', 'İndirim')}</dt>
              <dd className="tabular-nums font-medium text-status-success-text">−{formatCurrency(pricing.discountTotal, currency)}</dd>
            </div>
          )}
          <div className="flex justify-between text-text-secondary">
            <dt>{t('shipping', 'Kargo')}</dt>
            <dd>{t('free', 'Ücretsiz')}</dd>
          </div>
          <div className="flex items-baseline justify-between pt-2">
            <dt className="font-medium text-text-primary">{t('order_total', 'Sipariş toplamı')}</dt>
            <dd className="text-lg font-semibold tabular-nums text-text-price">{amount(pricing?.total, currency, 'h-6 w-24')}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
};

export default memo(CheckoutOrderSummary);
