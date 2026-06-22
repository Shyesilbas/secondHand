import { useTranslation } from "react-i18next";
import { memo } from 'react';
import { formatCurrency } from '../../../common/formatters.js';
import ListingReviewStats from '../../../reviews/components/ListingReviewStats.jsx';
import { useSellerReviewStatsCache } from '../../../reviews/hooks/useSellerReviewStatsCache.js';
import { useId, useState } from 'react';
import { StarIcon, STAR_SHAPE_PATH } from '../../../reviews/components/StarIcon.jsx';
import { ArrowLeft, ArrowRight, MapPin, Wallet, Loader2 } from 'lucide-react';

/* ── Seller inline rating ─────────────────────────────────── */

const SellerRating = ({
  sellerId
}) => {
  const {
    stats,
    loading
  } = useSellerReviewStatsCache(sellerId);
  const halfStarGradientId = `seller-rating-half-${useId().replace(/:/g, '')}`;
  const total = Number(stats?.totalReviews);
  const avgRaw = Number(stats?.averageRating);
  const safeAvg = Number.isFinite(avgRaw) ? avgRaw : 0;
  if (loading || !stats || !Number.isFinite(total) || total <= 0) {
    return null;
  }
  const renderStars = rating => {
    const capped = Math.min(5, Math.max(0, rating));
    const stars = [];
    const fullStars = Math.floor(capped);
    const hasHalfStar = capped % 1 !== 0;
    for (let i = 0; i < fullStars; i += 1) {
      stars.push(<StarIcon key={`f-${i}`} className="h-3 w-3 shrink-0 text-amber-500" />);
    }
    if (hasHalfStar) {
      stars.push(<svg key="half" className="h-3 w-3 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <defs>
            <linearGradient id={halfStarGradientId}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill={`url(#${halfStarGradientId})`} d={STAR_SHAPE_PATH} />
        </svg>);
    }
    const emptyStars = 5 - Math.ceil(capped);
    for (let i = 0; i < emptyStars; i += 1) {
      stars.push(<StarIcon key={`e-${i}`} className="h-3 w-3 shrink-0 text-border-light" />);
    }
    return stars;
  };
  return <div className="flex items-center gap-1">
      <div className="flex items-center">{renderStars(safeAvg)}</div>
      <span className="text-xs text-text-muted">
        {safeAvg.toFixed(1)} ({total})
      </span>
    </div>;
};

/* ── Review Step ───────────────────────────────────────────── */

const CheckoutReviewStep = ({
  cartItems,
  calculateTotal,
  addresses,
  selectedShippingAddressId,
  eWallet,
  onNext,
  onBack,
  sendVerificationCode,
  deliveryMethod,
  meetupLocation
}) => {
  const {
    t
  } = useTranslation();
  const [isSendingCode, setIsSendingCode] = useState(false);
  const totalAmount = calculateTotal();
  const currency = cartItems[0]?.listing?.currency || 'TRY';
  const shippingAddress = addresses?.find(a => String(a.id) === String(selectedShippingAddressId));
  const getPaymentDisplay = () => {
    return {
      name: 'Wallet Balance',
      detail: eWallet ? `Paid from wallet (${formatCurrency(totalAmount, currency)})` : 'Wallet',
      icon: Wallet
    };
  };
  const paymentInfo = getPaymentDisplay();
  const PaymentIcon = paymentInfo.icon;
  const handleNextClick = async () => {
    if (isSendingCode) return;
    setIsSendingCode(true);
    try {
      const success = await sendVerificationCode();
      if (success) {
        onNext();
      }
    } finally {
      setIsSendingCode(false);
    }
  };
  return <div className="p-5 sm:p-7">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("review_your_order")}</h2>
        <p className="mt-1 text-sm text-text-muted">{t("double_check_details_before_finishing_yo")}</p>
      </div>

      {/* Items list */}
      <div className="mb-6 rounded-lg border border-border-light bg-background-primary divide-y divide-border-light overflow-hidden px-4">
        {cartItems.map(item => {
        const isOffer = !!item.isOffer;
        const hasCampaign = !isOffer && item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
        const unitPrice = isOffer ? item.offerTotalPrice != null && item.quantity ? parseFloat(item.offerTotalPrice) / item.quantity : item.listing.price : hasCampaign ? item.listing.campaignPrice : item.listing.price;
        const lineTotal = isOffer ? parseFloat(item.offerTotalPrice) || 0 : parseFloat(unitPrice) * item.quantity;
        return <div key={item.id} className="flex items-center gap-4 py-4">
              {/* Thumbnail */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-light bg-background-secondary sm:h-16 sm:w-16">
                {item.listing.imageUrl ? <img src={item.listing.imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="text-sm font-medium text-text-muted">
                    {item.listing.title.charAt(0).toUpperCase()}
                  </span>}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium text-text-primary truncate">
                    {item.listing.title}
                  </h3>
                  {isOffer && <span className="rounded border border-border-light bg-background-secondary px-1.5 py-0.5 text-caption font-medium uppercase tracking-wider text-text-secondary">{t("offer")}</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-muted">
                  <span>
                    {item.listing.type} · {item.listing.city}
                  </span>
                  {(item.listing.sellerName || item.listing.sellerSurname) && <>
                      <span className="text-border-light">·</span>
                      <span>
                        {item.listing.sellerName} {item.listing.sellerSurname}
                      </span>
                      <SellerRating sellerId={item.listing.sellerId} />
                    </>}
                </div>
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold tabular-nums text-text-primary">
                  {formatCurrency(lineTotal, item.listing.currency)}
                </div>
                <div className="mt-0.5 text-xs tabular-nums text-text-muted">
                  {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                </div>
              </div>
            </div>;
      })}
      </div>

      {/* Dynamic Summary Panels (Shipping Address & Payment) */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Address or Meetup Card */}
        <div className="rounded-xl border border-border-light bg-background-primary p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{deliveryMethod === 'SAFE_MEETUP' ? 'Buluşma Noktası' : 'Shipping Details'}</span>
          </div>
          {deliveryMethod === 'SAFE_MEETUP' ? <div className="text-sm">
              <p className="font-semibold text-text-primary">📍 {meetupLocation || 'Belirtilmemiş'}</p>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed font-medium">{t("sipari_inizi_elden_teslim_al_rken_sat_c_")}</p>
            </div> : shippingAddress ? <div className="text-sm">
              <p className="font-semibold text-text-primary">{shippingAddress.addressLine}</p>
              <p className="mt-1 text-text-secondary font-medium">
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </p>
              <p className="mt-1.5 text-caption font-bold text-text-muted uppercase tracking-wider">{shippingAddress.country}</p>
            </div> : <p className="text-xs text-text-muted font-medium">{t("no_shipping_address_chosen")}</p>}
        </div>

        {/* Payment Card */}
        <div className="rounded-xl border border-border-light bg-background-primary p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            <PaymentIcon className="h-4 w-4 text-primary" />
            <span>{t("payment_method")}</span>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-text-primary">{paymentInfo.name}</p>
            {paymentInfo.detail && <p className="mt-1 text-text-secondary font-mono text-xs font-medium">{paymentInfo.detail}</p>}
          </div>
        </div>
      </div>

      {/* Subtotal */}
      <div className="mb-6 flex items-baseline justify-between border-t border-border-light pt-5">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{t("subtotal")}</span>
        <span className="text-2xl font-bold tabular-nums text-text-primary">
          {formatCurrency(totalAmount, currency)}
        </span>
      </div>

      {/* Navigation — desktop */}
      <div className="hidden items-center justify-between sm:flex">
        <button type="button" onClick={onBack} disabled={isSendingCode} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />{t("back")}</button>
        <button type="button" onClick={handleNextClick} disabled={isSendingCode} className="flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-background-secondary disabled:text-text-muted shadow-sm active:scale-[0.98]">
          {isSendingCode ? <>
              <Loader2 className="h-4 w-4 animate-spin" />{t("sending_code")}</> : <>{t("confirm_send_code")}<ArrowRight className="h-4 w-4" strokeWidth={2} />
            </>}
        </button>
      </div>

      {/* Navigation — mobile */}
      <div className="sticky bottom-0 -mx-5 mt-6 grid grid-cols-2 gap-2 border-t border-border-light bg-background-primary px-5 py-4 sm:hidden">
        <button type="button" onClick={onBack} disabled={isSendingCode} className="flex items-center justify-center gap-1.5 rounded-xl border border-border-light bg-background-primary py-3.5 text-xs font-bold uppercase tracking-wider text-text-secondary transition-all hover:bg-background-secondary disabled:opacity-50">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />{t("back")}</button>
        <button type="button" onClick={handleNextClick} disabled={isSendingCode} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-primary-hover disabled:bg-background-secondary disabled:text-text-muted active:scale-[0.98]">
          {isSendingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("confirm_send")}<ArrowRight className="h-4 w-4" strokeWidth={2} />
            </>}
        </button>
      </div>
    </div>;
};
export default memo(CheckoutReviewStep);