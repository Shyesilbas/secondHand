import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { Clock, Minus, Plus, Star, X } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
import { useUserReviewStats } from '../../reviews/hooks/useReviews.js';
import { useReservationTimer } from '../hooks/useReservationTimer.js';
import { ROUTES } from '../../common/constants/routes.js';

const CartItemCard = ({
  item,
  onQuantityChange,
  onRemoveItem,
  isUpdating,
  isRemoving,
}) => {
  const { t } = useTranslation();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    const max = item?.listing?.quantity;
    if (max != null && Number.isFinite(Number(max)) && newQuantity > Number(max)) {
      onQuantityChange(item.listing.id, Number(max));
      return;
    }
    onQuantityChange(item.listing.id, newQuantity);
  };

  const handleRemove = () => {
    onRemoveItem(item.listing.id);
  };

  const hasCampaign = Boolean(
    item.listing?.campaignId &&
    item.listing?.campaignPrice != null &&
    parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price)
  );

  const unitPrice = parseFloat(hasCampaign ? item.listing.campaignPrice : item.listing.price) || 0;
  const itemTotal = unitPrice * item.quantity;
  const originalItemTotal = (parseFloat(item.listing?.price) || 0) * item.quantity;

  const sellerName = [item.listing?.sellerName, item.listing?.sellerSurname].filter(Boolean).join(' ') || item.listing?.sellerName || 'Satıcı';
  const sellerId = item.listing?.sellerId;

  const { stats: sellerStats } = useUserReviewStats(sellerId);
  const sellerRating = sellerStats?.averageRating || 0;
  const sellerTotalReviews = sellerStats?.totalReviews || 0;

  const maxStock = item?.listing?.quantity;
  const isLowStock = maxStock != null && Number.isFinite(Number(maxStock)) && Number(maxStock) > 0 && Number(maxStock) < 5;

  const { timeRemaining, isExpired, isReserved } = useReservationTimer(item.reservedAt, item.reservationEndTime);
  const isReservationExpiring = Boolean(timeRemaining && timeRemaining.minutes < 3);

  const detailUrl = item.listing?.id ? ROUTES.LISTING_DETAIL(item.listing.id) : null;

  return (
    <article className="group p-4 transition-colors hover:bg-background-secondary/40 sm:p-5">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="relative shrink-0">
          {detailUrl ? (
            <Link to={detailUrl} className="block overflow-hidden rounded border border-border-light bg-background-tertiary">
              {item.listing?.imageUrl ? (
                <img
                  src={item.listing.imageUrl}
                  alt={item.listing.title || ''}
                  loading="lazy"
                  className="h-20 w-20 object-cover sm:h-24 sm:w-24 transition-opacity group-hover:opacity-95"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`h-20 w-20 items-center justify-center bg-background-tertiary sm:h-24 sm:w-24 ${
                  item.listing?.imageUrl ? 'hidden' : 'flex'
                }`}
              >
                <span className="text-sm font-semibold text-text-muted">
                  {item.listing?.title?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            </Link>
          ) : (
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded border border-border-light bg-background-tertiary flex items-center justify-center text-sm font-semibold text-text-muted">
              {item.listing?.title?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 flex flex-col justify-between">
          <div>
            {/* Title & Remove */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {detailUrl ? (
                  <Link
                    to={detailUrl}
                    className="text-sm font-semibold leading-snug text-text-primary hover:underline line-clamp-2"
                  >
                    {item.listing?.title}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold leading-snug text-text-primary line-clamp-2">
                    {item.listing?.title}
                  </p>
                )}

                {/* Seller & Meta */}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-secondary">
                  {sellerId ? (
                    <Link
                      to={ROUTES.USER_PROFILE(sellerId)}
                      className="font-medium text-text-secondary hover:text-text-primary hover:underline"
                    >
                      {sellerName}
                    </Link>
                  ) : (
                    <span>{sellerName}</span>
                  )}

                  {sellerTotalReviews > 0 && (
                    <span className="inline-flex items-center gap-0.5 tabular-nums text-text-tertiary">
                      <span>·</span>
                      <Star className="h-3 w-3 fill-status-warning text-status-warning" aria-hidden />
                      <span className="font-medium text-text-secondary">{sellerRating.toFixed(1)}</span>
                      <span>({sellerTotalReviews})</span>
                    </span>
                  )}

                  {item.listing?.city && (
                    <span className="text-text-tertiary">· {item.listing.city}</span>
                  )}
                </div>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={handleRemove}
                disabled={isRemoving}
                className="shrink-0 rounded p-1 text-text-muted transition hover:bg-background-secondary hover:text-status-error disabled:opacity-40"
                aria-label={t("remove")}
                title={t("remove")}
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Badges and Reservation status */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              {isLowStock && (
                <span className="rounded-sm border border-border-light bg-background-tertiary px-1.5 py-0.5 text-xs font-medium text-status-warning tabular-nums">
                  {t("stock", "Stok: ")} {Number(maxStock)}
                </span>
              )}

              {isReserved && !isExpired && (
                <span
                  className={`inline-flex items-center gap-1 font-medium tabular-nums ${
                    isReservationExpiring ? 'text-status-error' : 'text-text-secondary'
                  }`}
                >
                  <Clock className="h-3 w-3" strokeWidth={1.75} />
                  <span>
                    {timeRemaining?.minutes ?? 0}:{(timeRemaining?.seconds ?? 0).toString().padStart(2, '0')}
                  </span>
                  <span className="text-text-muted">{t("reserved", "rezerve")}</span>
                </span>
              )}

              {isReserved && isExpired && (
                <span className="text-status-error font-medium">{t("expired", "Süre doldu")}</span>
              )}

              {hasCampaign && (
                <span className="rounded-sm border border-border-light bg-background-tertiary px-1.5 py-0.5 text-xs font-semibold text-status-success">
                  {item.listing?.campaignName || t("campaign", "Kampanya")}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Bar: Stepper & Price */}
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3 pt-1">
            {/* Quantity Stepper */}
            <div className="inline-flex items-center rounded border border-border bg-background-primary h-8">
              <button
                type="button"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
                className="h-8 w-8 flex items-center justify-center text-text-secondary transition hover:bg-background-secondary disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Adet azalt"
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <span className="min-w-8 text-center text-xs font-semibold tabular-nums text-text-primary px-1">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={
                  isUpdating ||
                  (maxStock != null && Number.isFinite(Number(maxStock)) && item.quantity >= Number(maxStock))
                }
                className="h-8 w-8 flex items-center justify-center text-text-secondary transition hover:bg-background-secondary disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Adet artır"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>

            {/* Price display */}
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1.5">
                {hasCampaign && (
                  <span className="text-xs text-text-muted line-through tabular-nums">
                    {formatCurrency(originalItemTotal, item.listing?.currency)}
                  </span>
                )}
                <span className="text-base sm:text-lg font-semibold tabular-nums text-text-primary">
                  {formatCurrency(itemTotal, item.listing?.currency)}
                </span>
              </div>
              {item.quantity > 1 && (
                <p className="text-xs text-text-muted tabular-nums mt-0.5">
                  {item.quantity} × {formatCurrency(unitPrice, item.listing?.currency)}
                </p>
              )}
            </div>
          </div>

          {/* Notes if present */}
          {item.notes && (
            <div className="mt-3 rounded border border-border-light bg-background-secondary p-2.5 text-xs text-text-secondary">
              <span className="font-semibold text-text-primary mr-1">{t("note", "Not:")}</span>
              {item.notes}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default CartItemCard;