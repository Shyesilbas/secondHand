import { formatCurrency } from '../../../common/formatters.js';
import ListingReviewStats from '../../../reviews/components/ListingReviewStats.jsx';
import { useSellerReviewStatsCache } from '../../../reviews/hooks/useSellerReviewStatsCache.js';
import { useId } from 'react';
import { StarIcon, STAR_SHAPE_PATH } from '../../../reviews/components/StarIcon.jsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/* ── Seller inline rating ─────────────────────────────────── */

const SellerRating = ({ sellerId }) => {
  const { stats, loading } = useSellerReviewStatsCache(sellerId);
  const halfStarGradientId = `seller-rating-half-${useId().replace(/:/g, '')}`;

  const total = Number(stats?.totalReviews);
  const avgRaw = Number(stats?.averageRating);
  const safeAvg = Number.isFinite(avgRaw) ? avgRaw : 0;

  if (loading || !stats || !Number.isFinite(total) || total <= 0) {
    return null;
  }

  const renderStars = (rating) => {
    const capped = Math.min(5, Math.max(0, rating));
    const stars = [];
    const fullStars = Math.floor(capped);
    const hasHalfStar = capped % 1 !== 0;

    for (let i = 0; i < fullStars; i += 1) {
      stars.push(<StarIcon key={`f-${i}`} className="h-3 w-3 shrink-0 text-[#ca5010]" />);
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="h-3 w-3 shrink-0 text-[#ca5010]" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <defs>
            <linearGradient id={halfStarGradientId}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill={`url(#${halfStarGradientId})`} d={STAR_SHAPE_PATH} />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(capped);
    for (let i = 0; i < emptyStars; i += 1) {
      stars.push(<StarIcon key={`e-${i}`} className="h-3 w-3 shrink-0 text-[#e0deda]" />);
    }

    return stars;
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">{renderStars(safeAvg)}</div>
      <span className="text-xs text-[#999]">
        {safeAvg.toFixed(1)} ({total})
      </span>
    </div>
  );
};

/* ── Review Step ───────────────────────────────────────────── */

const CheckoutReviewStep = ({ cartItems, calculateTotal, onNext, onBack }) => {
  const totalAmount = calculateTotal();
  const currency = cartItems[0]?.listing?.currency || 'TRY';

  return (
    <div className="p-5 sm:p-7">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-[#111]">Review your order</h2>
        <p className="mt-1 text-sm text-[#999]">Confirm items and quantities before continuing.</p>
      </div>

      {/* Items list */}
      <div className="mb-6">
        {cartItems.map((item, idx) => {
          const isOffer = !!item.isOffer;
          const hasCampaign =
            !isOffer &&
            item.listing.campaignId &&
            item.listing.campaignPrice != null &&
            parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
          const unitPrice = isOffer
            ? item.offerTotalPrice != null && item.quantity
              ? parseFloat(item.offerTotalPrice) / item.quantity
              : item.listing.price
            : hasCampaign
              ? item.listing.campaignPrice
              : item.listing.price;
          const lineTotal = isOffer
            ? parseFloat(item.offerTotalPrice) || 0
            : parseFloat(unitPrice) * item.quantity;

          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 py-4 ${
                idx < cartItems.length - 1 ? 'border-b border-[#f0efed]' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#eee] bg-[#fafaf9] sm:h-16 sm:w-16">
                {item.listing.imageUrl ? (
                  <img src={item.listing.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-[#bbb]">
                    {item.listing.title.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-medium text-[#111]">
                    {item.listing.title}
                  </h3>
                  {isOffer && (
                    <span className="rounded border border-[#e5e3df] bg-[#fafaf9] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#555]">
                      Offer
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#999]">
                  <span>
                    {item.listing.type} · {item.listing.city}
                  </span>
                  {(item.listing.sellerName || item.listing.sellerSurname) && (
                    <>
                      <span className="text-[#e0deda]">·</span>
                      <span>
                        {item.listing.sellerName} {item.listing.sellerSurname}
                      </span>
                      <SellerRating sellerId={item.listing.sellerId} />
                    </>
                  )}
                </div>
                {item.listing.reviewStats && item.listing.reviewStats.totalReviews > 0 && (
                  <div className="mt-1">
                    <ListingReviewStats
                      listing={item.listing}
                      listingId={item.listing.id}
                      size="xs"
                      showIcon
                      showText
                    />
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold tabular-nums text-[#111]">
                  {formatCurrency(lineTotal, item.listing.currency)}
                </div>
                <div className="mt-0.5 text-xs tabular-nums text-[#999]">
                  {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                </div>
                {hasCampaign && (
                  <div className="mt-0.5 text-[11px] font-medium text-[#107c10]">
                    {item.listing.campaignName || 'Campaign'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtotal */}
      <div className="mb-6 flex items-baseline justify-between border-t border-[#f0efed] pt-4">
        <span className="text-sm text-[#555]">Subtotal</span>
        <span className="text-xl font-semibold tabular-nums text-[#111]">
          {formatCurrency(totalAmount, currency)}
        </span>
      </div>

      {/* Navigation — desktop */}
      <div className="hidden items-center justify-between sm:flex">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-[#555] transition-colors hover:text-[#111]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back to cart
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 rounded-lg border border-[#1466c6] bg-[#1466c6] px-6 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:border-[#0f529e] hover:bg-[#0f529e] active:scale-[0.99]"
        >
          Continue
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Navigation — mobile */}
      <div className="sticky bottom-0 -mx-5 mt-4 border-t border-[#f0efed] bg-white px-5 py-4 sm:hidden">
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1466c6] bg-[#1466c6] py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-[#0f529e] active:scale-[0.99]"
        >
          Continue
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default CheckoutReviewStep;
