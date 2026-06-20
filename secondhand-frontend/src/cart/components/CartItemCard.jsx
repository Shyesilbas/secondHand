import { useTranslation } from "react-i18next";
import { Clock, Minus, Plus, Star, X } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
import { useSellerReviewStatsCache } from '../../reviews/hooks/useSellerReviewStatsCache.js';
import { useReservationTimer } from '../hooks/useReservationTimer.js';
import { CART_UI, CART_SHAPE } from '../uiPalette.js';
const CartItemCard = ({
  item,
  onQuantityChange,
  onRemoveItem,
  isUpdating,
  isRemoving
}) => {
  const {
    t
  } = useTranslation();
  const handleQuantityChange = newQuantity => {
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
  const hasCampaign = item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
  const unitPrice = parseFloat(hasCampaign ? item.listing.campaignPrice : item.listing.price) || 0;
  const itemTotal = unitPrice * item.quantity;
  const sellerName = item.listing.sellerName;
  const sellerSurname = item.listing.sellerSurname;
  const sellerId = item.listing.sellerId;
  const reviewStats = item.listing.reviewStats;
  const averageRating = reviewStats?.averageRating || 0;
  const totalReviews = reviewStats?.totalReviews || 0;
  const {
    stats: sellerStats
  } = useSellerReviewStatsCache(sellerId);
  const sellerRating = sellerStats?.averageRating || 0;
  const sellerTotalReviews = sellerStats?.totalReviews || 0;
  const maxStock = item?.listing?.quantity;
  const isLowStock = maxStock != null && Number.isFinite(Number(maxStock)) && Number(maxStock) > 0 && Number(maxStock) < 10;
  const {
    timeRemaining,
    isExpired,
    isReserved
  } = useReservationTimer(item.reservedAt, item.reservationEndTime);
  const isReservationExpiring = timeRemaining && timeRemaining.minutes < 3;
  const metaParts = [item.listing.type, item.listing.city, [sellerName, sellerSurname].filter(Boolean).join(' ') || null].filter(Boolean);
  return <div className="group px-4 py-4 transition-colors hover:bg-[#eef4fb] sm:px-5">
      <div className="flex gap-4">
        <div className="relative shrink-0">
          {item.listing.imageUrl ? <img src={item.listing.imageUrl} alt="" loading="lazy" className={`h-20 w-20 border object-cover sm:h-24 sm:w-24 ${CART_SHAPE.radiusThumb}`} style={{
          borderColor: CART_UI.border
        }} onError={e => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }} /> : null}
          <div className={`flex h-20 w-20 items-center justify-center border bg-[#f7f6f5] sm:h-24 sm:w-24 ${CART_SHAPE.radiusThumb} ${item.listing.imageUrl ? 'hidden' : 'flex'}`} style={{
          borderColor: CART_UI.border
        }}>
            <span className="text-sm font-medium text-[#9c9894]">
              {item.listing.title.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-[#1a1918] sm:text-base">
                {item.listing.title}
              </p>
              {metaParts.length > 0 && <p className="mt-1 text-xs text-[#5f5b57]">
                  {metaParts.join(' · ')}
                  {sellerTotalReviews > 0 && <span className="whitespace-nowrap">
                      {' '}
                      ·{' '}
                      <Star className="inline-block h-3 w-3 align-text-bottom text-[#ca5010]" fill="currentColor" strokeWidth={0} aria-hidden />{' '}
                      <span className="tabular-nums">{sellerRating.toFixed(1)}</span>
                    </span>}
                </p>}
            </div>
            <button type="button" onClick={handleRemove} disabled={isRemoving} className="shrink-0 rounded-xl p-1.5 text-[#9c9894] transition hover:bg-[#eef4fb] hover:text-[#1466c6] disabled:opacity-40" title={t("remove")}>
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-[#5f5b57]">
            {isLowStock && <span className="tabular-nums">{t("stock")}{Number(maxStock)}</span>}
            {isReserved && !isExpired && <span className={`inline-flex items-center gap-1 tabular-nums ${isReservationExpiring ? 'text-[#d13438]' : 'text-[#1466c6]'}`}>
                <Clock className="h-3 w-3" strokeWidth={1.75} />
                {timeRemaining?.minutes ?? 0}:{(timeRemaining?.seconds ?? 0).toString().padStart(2, '0')}
              </span>}
            {isReserved && isExpired && <span className="text-[#9c9894]">{t("expired")}</span>}
            {hasCampaign && <span className="text-[#107c10]">
                {item.listing.campaignName || 'Campaign'}
              </span>}
            {totalReviews > 0 && sellerTotalReviews === 0 && <span className="tabular-nums">{t("rating")}{averageRating.toFixed(1)} ({totalReviews})
              </span>}
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base font-semibold tabular-nums text-[#1a1918]">
                {formatCurrency(itemTotal, item.listing.currency)}
              </p>
              {(item.quantity > 1 || hasCampaign) && <p className="mt-0.5 text-xs tabular-nums text-[#5f5b57]">
                  {item.quantity > 1 && <span>
                      {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                    </span>}
                  {hasCampaign && <span className={item.quantity > 1 ? ' ml-2' : ''}>
                      <span className="line-through">
                        {formatCurrency(item.listing.price, item.listing.currency)}
                      </span>
                    </span>}
                </p>}
            </div>

            <div className={`inline-flex items-stretch overflow-hidden border bg-white ${CART_SHAPE.radiusBox}`} style={{
            borderColor: CART_UI.border
          }}>
              <button type="button" onClick={() => handleQuantityChange(item.quantity - 1)} disabled={isUpdating || item.quantity <= 1} className="px-2 py-1.5 text-[#5f5b57] transition enabled:hover:bg-[#f7f6f5] disabled:opacity-35">
                <Minus className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <span className="flex min-w-[2rem] items-center justify-center border-x px-2 text-sm font-medium tabular-nums text-[#1a1918]" style={{
              borderColor: CART_UI.border
            }}>
                {item.quantity}
              </span>
              <button type="button" onClick={() => handleQuantityChange(item.quantity + 1)} disabled={isUpdating || maxStock != null && Number.isFinite(Number(maxStock)) && item.quantity >= Number(maxStock)} className="px-2 py-1.5 text-[#5f5b57] transition enabled:hover:bg-[#f7f6f5] disabled:opacity-35">
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {item.notes && <div className="mt-3 border-l-2 border-[#5f5b57] bg-[#f7f6f5] px-3 py-2 text-xs text-[#5f5b57]">
              <span className="font-medium text-[#1a1918]">{t("note")}</span>
              {item.notes}
            </div>}
        </div>
      </div>
    </div>;
};
export default CartItemCard;