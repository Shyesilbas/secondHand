import { useTranslation } from "react-i18next";
import { memo, useId, useState } from 'react';
import { formatCurrency } from '../../../common/formatters.js';
import { useUserReviewStats } from '../../../reviews/hooks/useReviews.js';
import { StarIcon, STAR_SHAPE_PATH } from '../../../reviews/components/StarIcon.jsx';
import { ArrowLeft, ArrowRight, MapPin, Wallet, Loader2, Truck, Users, Lock } from 'lucide-react';
import Button from '../../../common/components/ui/Button.jsx';

/* ── Seller inline rating ─────────────────────────────────── */

const SellerRating = ({ sellerId }) => {
  const { stats, loading } = useUserReviewStats(sellerId);
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
      stars.push(<StarIcon key={`f-${i}`} className="h-3 w-3 shrink-0 text-text-primary" />);
    }
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="h-3 w-3 shrink-0 text-text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
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
      stars.push(<StarIcon key={`e-${i}`} className="h-3 w-3 shrink-0 text-border" />);
    }
    return stars;
  };

  return (
    <div className="inline-flex items-center gap-1.5 bg-background-secondary border border-border px-1.5 py-0.5 rounded">
      <div className="flex items-center">{renderStars(safeAvg)}</div>
      <span className="text-2xs font-semibold text-text-secondary tabular-nums">
        {safeAvg.toFixed(1)} <span className="text-text-tertiary font-normal">({total})</span>
      </span>
    </div>
  );
};

/* ── Review Step ───────────────────────────────────────────── */

const CheckoutReviewStep = ({
  cartItems,
  calculateTotal,
  addresses,
  selectedShippingAddressId,
  onNext,
  onBack,
  sendVerificationCode,
  deliveryMethod,
  meetupLocation
}) => {
  const { t } = useTranslation();
  const [isSendingCode, setIsSendingCode] = useState(false);
  const totalAmount = calculateTotal();
  const currency = cartItems[0]?.listing?.currency || 'TRY';
  const shippingAddress = addresses?.find(a => String(a.id) === String(selectedShippingAddressId));

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

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="border-b border-border-light pb-4">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            {t("review_your_order", "Sipariş Özeti & Onay")}
          </h2>
          <p className="mt-0.5 text-xs text-text-tertiary">
            {t("double_check_details_before_finishing_yo", "Lütfen sipariş bilgilerinizi son kez kontrol edin ve güvenlik kodunu isteyin.")}
          </p>
        </div>
      </div>

      {/* Products List Manifest */}
      <div>
        <h4 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary mb-2.5">
          Sepet İçeriği
        </h4>

        <div className="rounded border border-border bg-background-primary divide-y divide-border-light overflow-hidden">
          {cartItems.map(item => {
            const isOffer = !!item.isOffer;
            const hasCampaign = !isOffer && item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
            const unitPrice = isOffer 
              ? (item.offerTotalPrice != null && item.quantity ? parseFloat(item.offerTotalPrice) / item.quantity : item.listing.price) 
              : hasCampaign ? item.listing.campaignPrice : item.listing.price;
            const lineTotal = isOffer ? parseFloat(item.offerTotalPrice) || 0 : parseFloat(unitPrice) * item.quantity;

            return (
              <div key={item.id} className="flex items-center gap-3.5 p-3.5 hover:bg-background-secondary/30 transition-colors">
                {/* Product Thumbnail */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-background-secondary">
                  {item.listing.imageUrl ? (
                    <img src={item.listing.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-text-muted">
                      {item.listing.title.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Product Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-semibold text-text-primary truncate">
                      {item.listing.title}
                    </h3>
                    {isOffer && (
                      <span className="rounded border border-border bg-background-secondary px-1.5 py-0.5 text-2xs font-medium text-text-secondary">
                        {t("offer", "Özel Teklif")}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                    <span className="text-text-secondary font-medium">{item.listing.city}</span>
                    {(item.listing.sellerName || item.listing.sellerSurname) && (
                      <>
                        <span className="text-text-muted">·</span>
                        <span>Satıcı: <strong className="text-text-primary font-medium">{item.listing.sellerName} {item.listing.sellerSurname}</strong></span>
                        <SellerRating sellerId={item.listing.sellerId} />
                      </>
                    )}
                  </div>
                </div>

                {/* Price column */}
                <div className="shrink-0 text-right">
                  <div className="text-xs font-semibold text-text-primary tabular-nums">
                    {formatCurrency(lineTotal, item.listing.currency)}
                  </div>
                  <div className="mt-0.5 text-2xs text-text-tertiary tabular-nums">
                    {item.quantity} adet × {formatCurrency(unitPrice, item.listing.currency)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Bento Cards (Shipping & Payment) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Delivery / Meetup Bento Card */}
        <div className="rounded border border-border bg-background-primary p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
              {deliveryMethod === 'SAFE_MEETUP' ? <Users className="h-3.5 w-3.5 text-text-primary" /> : <Truck className="h-3.5 w-3.5 text-text-primary" />}
              <span>{deliveryMethod === 'SAFE_MEETUP' ? 'Elden Güvenli Teslimat' : 'Teslimat & Kargo Adresi'}</span>
            </div>
          </div>

          {deliveryMethod === 'SAFE_MEETUP' ? (
            <div className="text-xs space-y-1">
              <p className="font-semibold text-text-primary flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                <span>{meetupLocation || 'Belirtilmemiş'}</span>
              </p>
              <p className="text-text-tertiary text-2xs leading-relaxed">
                Satıcı ile buluştuğunuzda ürünü inceleyip 6 haneli güvenli PIN kodunu vererek işlemi onaylayabilirsiniz.
              </p>
            </div>
          ) : shippingAddress ? (
            <div className="text-xs space-y-1">
              <p className="font-semibold text-text-primary">{shippingAddress.title || 'Teslimat Adresi'}</p>
              <p className="text-text-secondary">{shippingAddress.addressLine}</p>
              <p className="text-text-tertiary text-2xs">
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </p>
            </div>
          ) : (
            <p className="text-xs text-text-muted">{t("no_shipping_address_chosen", "Adres seçilmedi.")}</p>
          )}
        </div>

        {/* Payment & Escrow Bento Card */}
        <div className="rounded border border-border bg-background-primary p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
              <Wallet className="h-3.5 w-3.5 text-text-primary" />
              <span>{t("payment_method", "Ödeme Yöntemi")}</span>
            </div>
          </div>

          <div className="text-xs space-y-1">
            <p className="font-semibold text-text-primary">SecondHand Cüzdan</p>
            <p className="text-text-secondary">
              Tahsil Edilecek Tutar: <strong className="text-text-primary font-semibold tabular-nums">{formatCurrency(totalAmount, currency)}</strong>
            </p>
            <p className="text-2xs text-text-tertiary leading-relaxed pt-1 border-t border-border-light">
              Tutar güvenli havuz hesabına alınır, ürün onayınıza dek satıcıya aktarılmaz.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-border-light pt-4">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <Button
            variant="secondary"
            onClick={onBack}
            disabled={isSendingCode}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back", "Ödeme Adımına Dön")}
          </Button>

          <Button
            variant="primary"
            onClick={handleNextClick}
            disabled={isSendingCode}
          >
            {isSendingCode ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("sending_code", "Doğrulama Kodu Gönderiliyor...")}</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>{t("confirm_send_code", "Onayla & Doğrulama Kodunu İste")}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(CheckoutReviewStep);