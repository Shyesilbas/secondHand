import { useTranslation } from "react-i18next";
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../common/constants/routes.js';
import { formatCurrency } from '../../../common/formatters.js';
import { ReviewButton } from '../../../reviews/index.js';
import { getCancelRefundReasonLabel } from '../../../common/enums/cancelRefundReasons.js';

// One line per adjustment: "Partially cancelled (1/2) · Reason: ...". Colour only on the status words.
const Adjustment = ({ label, quantity, total, reason, reasonText, toneClass, reasonLabel }) => (
  <p className="mt-2 text-sm">
    <span className={toneClass}>{label} ({quantity}/{total})</span>
    {reason ? (
      <span className="text-text-secondary">
        {' · '}{reasonLabel}: {getCancelRefundReasonLabel(reason)}
        {reasonText ? ` — "${reasonText}"` : ''}
      </span>
    ) : null}
  </p>
);

const OrderItemRow = ({ item, currency, isSellerView, review, reviewsLoading, orderStatus, onReviewSuccess, onClose }) => {
  const { t } = useTranslation();
  const listingPath = item.listing?.id ? ROUTES.LISTING_DETAIL(item.listing.id) : null;
  const cancelled = item.cancelledQuantity > 0;
  const refunded = item.refundedQuantity > 0;
  const sellerName = [item.sellerName, item.sellerSurname].filter(Boolean).join(' ');
  const thumb = <img src={item.listing?.imageUrl} alt="" className="h-full w-full object-cover" />;

  return (
    <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded border border-border-light bg-background-secondary">
        {listingPath ? (
          <Link to={listingPath} onClick={onClose} tabIndex={-1} aria-hidden="true" className="block h-full w-full transition-opacity hover:opacity-80">{thumb}</Link>
        ) : thumb}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="line-clamp-2 text-sm font-medium text-text-primary">
              {listingPath ? <Link to={listingPath} onClick={onClose} className="hover:underline">{item.listing?.title}</Link> : item.listing?.title}
            </h4>
            <p className="mt-0.5 text-sm tabular-nums text-text-secondary">{item.quantity} × {formatCurrency(item.unitPrice, currency)}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-text-primary">{formatCurrency(item.totalPrice, currency)}</span>
        </div>

        {!isSellerView && sellerName ? (
          <p className="mt-1 text-sm text-text-tertiary">{t("seller")}: {sellerName}</p>
        ) : null}
        {item.campaignName ? (
          <p className="mt-1 text-sm text-text-tertiary">{t("od_campaign", "Kampanya")}: {item.campaignName}</p>
        ) : null}

        {cancelled ? (
          <Adjustment
            label={item.cancelledQuantity >= item.quantity ? t("od_cancelled", "İptal edildi") : t("od_partially_cancelled", "Kısmen iptal edildi")}
            quantity={item.cancelledQuantity}
            total={item.quantity}
            reason={item.cancelReason}
            reasonText={item.cancelReasonText}
            reasonLabel={t("od_reason", "Neden")}
            toneClass="text-status-error-text"
          />
        ) : null}
        {refunded ? (
          <Adjustment
            label={item.refundedQuantity >= item.quantity ? t("od_refunded", "İade edildi") : t("od_partially_refunded", "Kısmen iade edildi")}
            quantity={item.refundedQuantity}
            total={item.quantity}
            reason={item.refundReason}
            reasonText={item.refundReasonText}
            reasonLabel={t("od_reason", "Neden")}
            toneClass="text-status-warning-text"
          />
        ) : null}

        {!isSellerView ? (
          <div className="mt-3 empty:hidden">
            <ReviewButton orderItem={item} existingReview={review} reviewsLoading={reviewsLoading} onReviewCreated={onReviewSuccess} orderStatus={orderStatus} />
          </div>
        ) : null}
      </div>
    </li>
  );
};

export const OrderItemsSection = React.memo(({
  CardComponent: Card,
  items,
  order,
  isSellerView,
  orderReviews,
  reviewsLoading,
  onReviewSuccess,
  onClose
}) => {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-semibold text-text-primary">
          {isSellerView ? t('od_sold_items', 'Satılan ürünler') : t('od_order_items', 'Sipariş ürünleri')}
        </h3>
        <span className="text-sm tabular-nums text-text-tertiary">{t('od_items_count', { defaultValue: '{{count}} ürün', count: items.length })}</span>
      </div>
      <ul className="divide-y divide-border-light">
        {items.map((item, idx) => {
          const rawId = item?.id ?? item?.orderItemId;
          const reviewKey = rawId === undefined || rawId === null || rawId === '' ? null : String(rawId);
          return (
            <OrderItemRow
              key={reviewKey || `row-${idx}`}
              item={item}
              currency={order.currency}
              isSellerView={isSellerView}
              review={reviewKey ? orderReviews[reviewKey] : null}
              reviewsLoading={reviewsLoading}
              orderStatus={order.status}
              onReviewSuccess={onReviewSuccess}
              onClose={onClose}
            />
          );
        })}
      </ul>
    </Card>
  );
});
OrderItemsSection.displayName = 'OrderItemsSection';
