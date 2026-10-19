import { useTranslation } from "react-i18next";
import { memo } from 'react';
import { formatCurrency } from '../../../common/formatters.js';
import { ShoppingBag, Tag, Store } from 'lucide-react';

const CheckoutOrderSummary = ({
  cartItems = [],
  calculateTotal,
  pricing,
}) => {
  const { t } = useTranslation();
  
  const subtotal = pricing?.subtotalAfterCampaigns != null 
    ? parseFloat(pricing.subtotalAfterCampaigns) 
    : calculateTotal ? calculateTotal() : 0;
  const originalSubtotal = pricing?.originalSubtotal != null ? parseFloat(pricing.originalSubtotal) : null;
  const campaignDiscount = pricing?.campaignDiscount != null ? parseFloat(pricing.campaignDiscount) : 0;
  const couponDiscount = pricing?.couponDiscount != null ? parseFloat(pricing.couponDiscount) : 0;
  const totalDiscounts = campaignDiscount + couponDiscount;
  const total = pricing?.total != null ? parseFloat(pricing.total) : subtotal - couponDiscount;
  const currency = cartItems.length > 0 ? cartItems[0]?.listing?.currency || 'TRY' : 'TRY';
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="sticky top-20">
      <div className="overflow-hidden rounded border border-border bg-background-primary transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light px-5 py-3.5 bg-background-primary">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-text-primary" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-text-primary">
              {t("order_summary", "Sipariş Özeti")}
            </h3>
          </div>
          <span className="rounded-sm border border-border-light bg-background-tertiary px-2 py-0.5 text-xs font-medium tabular-nums text-text-secondary">
            {cartCount} {cartCount === 1 ? t("item", "ürün") : t("items", "ürün")}
          </span>
        </div>

        {/* Product Items List */}
        <div className="max-h-[min(380px,45vh)] overflow-y-auto divide-y divide-border-light px-5">
          {cartItems.map((item) => {
            const isOffer = !!item.isOffer;
            const hasCampaign = !isOffer && item.listing?.campaignId && item.listing?.campaignPrice != null && parseFloat(item.listing?.campaignPrice) < parseFloat(item.listing?.price);
            const unitPrice = isOffer 
              ? (item.offerTotalPrice != null && item.quantity ? parseFloat(item.offerTotalPrice) / item.quantity : item.listing?.price) 
              : hasCampaign ? item.listing?.campaignPrice : item.listing?.price;
            const lineTotal = isOffer ? parseFloat(item.offerTotalPrice) || 0 : parseFloat(unitPrice) * item.quantity;
            const sellerFullName = [item.listing?.sellerName, item.listing?.sellerSurname].filter(Boolean).join(' ') || item.listing?.sellerUsername || 'Satıcı';

            return (
              <div key={item.id} className="py-4 space-y-2.5">
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded border border-border bg-background-secondary flex items-center justify-center">
                    {item.listing?.imageUrl ? (
                      <img
                        src={item.listing?.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={e => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={`text-xs font-semibold text-text-muted ${item.listing?.imageUrl ? 'hidden' : 'flex'}`}>
                      {item.listing?.title ? item.listing.title.charAt(0).toUpperCase() : 'P'}
                    </span>
                  </div>

                  {/* Title & Quantity */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="line-clamp-2 text-xs font-semibold text-text-primary leading-snug">
                      {item.listing?.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-2xs text-text-tertiary">
                      <span>{item.quantity} adet</span>
                      {isOffer && (
                        <span className="rounded-sm border border-border bg-background-tertiary px-1.5 py-0.2 text-2xs font-medium text-text-secondary">
                          {t("offer", "Özel Teklif")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right">
                    <span className="block text-xs font-semibold text-text-primary tabular-nums">
                      {formatCurrency(lineTotal, item.listing?.currency || currency)}
                    </span>
                    {item.quantity > 1 && (
                      <span className="block text-2xs text-text-tertiary tabular-nums">
                        {formatCurrency(unitPrice, item.listing?.currency || currency)} / ad.
                      </span>
                    )}
                  </div>
                </div>

                {/* Seller line */}
                <div className="flex items-center justify-between text-2xs text-text-tertiary px-2 py-1 rounded bg-background-secondary/50 border border-border-light">
                  <span className="flex items-center gap-1 truncate">
                    <Store className="h-3 w-3 text-text-tertiary shrink-0" />
                    <span>Satıcı:</span>
                    <strong className="text-text-secondary font-medium truncate">{sellerFullName}</strong>
                  </span>
                  {item.listing?.city && (
                    <span className="shrink-0">{item.listing.city}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing breakdown */}
        <div className="border-t border-border-light bg-background-secondary/20 p-5 space-y-3 text-xs">
          <div className="flex justify-between items-center text-text-secondary font-medium">
            <span>{t("subtotal", "Ara Toplam")}</span>
            <span className="font-semibold text-text-primary tabular-nums">
              {formatCurrency(originalSubtotal != null ? originalSubtotal : subtotal, currency)}
            </span>
          </div>

          {totalDiscounts > 0 && (
            <div className="flex justify-between items-center text-status-success font-medium">
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                <span>Toplam İndirim</span>
              </span>
              <span className="font-semibold tabular-nums">
                −{formatCurrency(totalDiscounts, currency)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-text-secondary font-medium">
            <span>{t("shipping", "Kargo Bedeli")}</span>
            <span className="font-semibold text-status-success">{t("free", "Ücretsiz")}</span>
          </div>

          <div className="flex justify-between items-center text-text-secondary font-medium">
            <span>{t("tax", "KDV & Hizmet Bedeli")}</span>
            <span className="font-semibold text-text-primary">Dahil</span>
          </div>

          {/* Total amount */}
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
      </div>
    </aside>
  );
};

export default memo(CheckoutOrderSummary);