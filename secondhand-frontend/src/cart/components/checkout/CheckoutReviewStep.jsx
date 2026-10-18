import { useTranslation } from "react-i18next";
import { memo, useId, useState } from 'react';
import { formatCurrency } from '../../../common/formatters.js';
import { useUserReviewStats } from '../../../reviews/hooks/useReviews.js';
import { StarIcon, STAR_SHAPE_PATH } from '../../../reviews/components/StarIcon.jsx';
import { ArrowLeft, ArrowRight, MapPin, Wallet, Loader2, PackageCheck, ShieldCheck, Truck, Users, Lock } from 'lucide-react';

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
      stars.push(<StarIcon key={`f-${i}`} className="h-3 w-3 shrink-0 text-status-warning" />);
    }
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="h-3 w-3 shrink-0 text-status-warning" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
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
      stars.push(<StarIcon key={`e-${i}`} className="h-3 w-3 shrink-0 text-secondary-200" />);
    }
    return stars;
  };

  return (
    <div className="inline-flex items-center gap-1.5 bg-background-secondary border border-border/80 px-2 py-0.5 rounded">
      <div className="flex items-center">{renderStars(safeAvg)}</div>
      <span className="text-xs font-semibold text-status-warning-text">
        {safeAvg.toFixed(1)} <span className="text-status-warning-text font-normal">({total})</span>
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
    <div className="p-6 sm:p-8 space-y-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border-light pb-5">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight">
            {t("review_your_order", "Sipariş Özeti & Onay")}
          </h2>
          <p className="mt-0.5 text-xs text-text-tertiary font-medium">
            {t("double_check_details_before_finishing_yo", "Lütfen sipariş bilgilerinizi son kez kontrol edin ve güvenlik kodunu isteyin.")}
          </p>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary bg-background-tertiary px-3.5 py-1.5 rounded border border-border">
          <PackageCheck className="h-4 w-4 text-text-primary" />
          {cartItems.length} Ürün Listelendi
        </span>
      </div>

      {/* ── Products List Manifest ──────────────────────────────── */}
      <div>
        <h4 className="text-xs font-semibold text-text-muted mb-3">
          Sepet İçeriği
        </h4>

        <div className="rounded-md border border-border/90 bg-background-secondary/50 divide-y divide-border-light overflow-hidden">
          {cartItems.map(item => {
            const isOffer = !!item.isOffer;
            const hasCampaign = !isOffer && item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
            const unitPrice = isOffer 
              ? (item.offerTotalPrice != null && item.quantity ? parseFloat(item.offerTotalPrice) / item.quantity : item.listing.price) 
              : hasCampaign ? item.listing.campaignPrice : item.listing.price;
            const lineTotal = isOffer ? parseFloat(item.offerTotalPrice) || 0 : parseFloat(unitPrice) * item.quantity;

            return (
              <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-white transition-colors">
                {/* Product Thumbnail */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-white">
                  {item.listing.imageUrl ? (
                    <img src={item.listing.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-base font-semibold text-text-muted">
                      {item.listing.title.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Product Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {item.listing.title}
                    </h3>
                    {isOffer && (
                      <span className="rounded-md border border-card-border-hover bg-background-tertiary px-2 py-0.5 text-xs font-semibold text-text-primary">
                        {t("offer", "Özel Teklif")}
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-text-tertiary font-medium">
                    <span className="text-text-secondary font-semibold">{item.listing.city}</span>
                    {(item.listing.sellerName || item.listing.sellerSurname) && (
                      <>
                        <span className="text-secondary-300">·</span>
                        <span>Satıcı: <strong className="text-text-primary">{item.listing.sellerName} {item.listing.sellerSurname}</strong></span>
                        <SellerRating sellerId={item.listing.sellerId} />
                      </>
                    )}
                  </div>
                </div>

                {/* Price column */}
                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-text-primary">
                    {formatCurrency(lineTotal, item.listing.currency)}
                  </div>
                  <div className="mt-0.5 text-xs text-text-tertiary font-medium">
                    {item.quantity} adet × {formatCurrency(unitPrice, item.listing.currency)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Summary Bento Cards (Shipping & Payment) ─────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Delivery / Meetup Bento Card */}
        <div className="rounded-md border border-border/90 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-tertiary">
              {deliveryMethod === 'SAFE_MEETUP' ? <Users className="h-4 w-4 text-text-primary" /> : <Truck className="h-4 w-4 text-text-primary" />}
              <span>{deliveryMethod === 'SAFE_MEETUP' ? 'Elden Güvenli Teslimat' : 'Teslimat & Kargo Adresi'}</span>
            </div>
            <span className="text-xs font-semibold text-status-success-text bg-background-secondary px-2 py-0.5 rounded border border-border">
              Seçildi
            </span>
          </div>

          {deliveryMethod === 'SAFE_MEETUP' ? (
            <div className="text-xs space-y-2">
              <p className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-status-warning-text shrink-0" />
                <span>{meetupLocation || 'Belirtilmemiş'}</span>
              </p>
              <p className="text-text-tertiary font-medium leading-relaxed">
                Satıcı ile buluştuğunuzda ürünü inceleyip 6 haneli güvenli PIN kodunu vererek işlemi onaylayabilirsiniz.
              </p>
            </div>
          ) : shippingAddress ? (
            <div className="text-xs space-y-1">
              <p className="font-semibold text-text-primary text-sm">{shippingAddress.title || 'Teslimat Adresi'}</p>
              <p className="text-text-secondary font-medium leading-relaxed">{shippingAddress.addressLine}</p>
              <p className="text-text-tertiary font-medium">
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </p>
            </div>
          ) : (
            <p className="text-xs text-text-muted font-medium">{t("no_shipping_address_chosen", "Adres seçilmedi.")}</p>
          )}
        </div>

        {/* Payment & Escrow Bento Card */}
        <div className="rounded-md border border-border/90 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-tertiary">
              <Wallet className="h-4 w-4 text-text-primary" />
              <span>{t("payment_method", "Ödeme Yöntemi")}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-status-success-text bg-background-secondary px-2 py-0.5 rounded border border-border">
              <ShieldCheck className="h-3 w-3" />
              Escrow Güvencesi
            </span>
          </div>

          <div className="text-xs space-y-1.5">
            <p className="font-semibold text-text-primary text-sm">SecondHand Cüzdan</p>
            <p className="text-text-secondary font-medium">
              Tahsil Edilecek Tutar: <strong className="text-text-primary font-semibold">{formatCurrency(totalAmount, currency)}</strong>
            </p>
            <p className="text-xs text-text-tertiary leading-relaxed pt-1 border-t border-border-light">
              Tutar güvenli havuz hesabına alınır, ürün onayınıza dek satıcıya aktarılmaz.
            </p>
          </div>
        </div>
      </div>

      {/* ── Subtotal Bar ────────────────────────────────────────── */}
      <div className="flex items-baseline justify-between rounded-md bg-background-secondary border border-border/80 p-5">
        <div>
          <span className="text-xs font-semibold text-text-muted block">
            {t("subtotal", "Toplam Tutar")}
          </span>
          <span className="text-xs text-text-tertiary font-medium">Kargo ve KDV dahil</span>
        </div>
        <span className="text-2xl font-semibold text-text-primary">
          {formatCurrency(totalAmount, currency)}
        </span>
      </div>

      {/* ── Navigation ──────────────────────────────────────────── */}
      <div className="border-t border-border-light pt-6">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSendingCode}
            className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {t("back", "Ödeme Adımına Dön")}
          </button>

          <button
            type="button"
            onClick={handleNextClick}
            disabled={isSendingCode}
            className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4"
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
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(CheckoutReviewStep);