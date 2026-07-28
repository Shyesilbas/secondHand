import { useTranslation } from "react-i18next";
import { memo, useId, useState } from 'react';
import { formatCurrency } from '../../../common/formatters.js';
import { useSellerReviewStatsCache } from '../../../reviews/hooks/useSellerReviewStatsCache.js';
import { StarIcon, STAR_SHAPE_PATH } from '../../../reviews/components/StarIcon.jsx';
import { ArrowLeft, ArrowRight, MapPin, Wallet, Loader2, CheckCircle2 } from 'lucide-react';

const SellerRating = ({ sellerId }) => {
  const { stats, loading } = useSellerReviewStatsCache(sellerId);
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
      stars.push(
        <svg key="half" className="h-3 w-3 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
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
      stars.push(<StarIcon key={`e-${i}`} className="h-3 w-3 shrink-0 text-slate-200" />);
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">{renderStars(safeAvg)}</div>
      <span className="text-xs text-slate-500 font-medium">
        {safeAvg.toFixed(1)} ({total})
      </span>
    </div>
  );
};

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
  const { t } = useTranslation();
  const [isSendingCode, setIsSendingCode] = useState(false);
  const totalAmount = calculateTotal();
  const currency = cartItems[0]?.listing?.currency || 'TRY';
  const shippingAddress = addresses?.find(a => String(a.id) === String(selectedShippingAddressId));

  const getPaymentDisplay = () => {
    return {
      name: t("wallet_balance", "Cüzdan Bakiyesi"),
      detail: eWallet ? `${t("paid_from_wallet", "Cüzdandan tahsil edilecek")}: ${formatCurrency(totalAmount, currency)}` : 'Cüzdan',
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

  return (
    <div className="p-5 sm:p-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      {/* Header */}
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {t("review_your_order", "Siparişinizi İnceleyin")}
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          {t("double_check_details_before_finishing_yo", "Son onay kodunu göndermeden önce detayları kontrol edin.")}
        </p>
      </div>

      {/* Items list */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden px-4">
        {cartItems.map(item => {
          const isOffer = !!item.isOffer;
          const hasCampaign = !isOffer && item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
          const unitPrice = isOffer ? (item.offerTotalPrice != null && item.quantity ? parseFloat(item.offerTotalPrice) / item.quantity : item.listing.price) : hasCampaign ? item.listing.campaignPrice : item.listing.price;
          const lineTotal = isOffer ? parseFloat(item.offerTotalPrice) || 0 : parseFloat(unitPrice) * item.quantity;

          return (
            <div key={item.id} className="flex items-center gap-4 py-4">
              {/* Thumbnail */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:h-16 sm:w-16">
                {item.listing.imageUrl ? (
                  <img src={item.listing.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-slate-400">
                    {item.listing.title.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {item.listing.title}
                  </h3>
                  {isOffer && (
                    <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-800">
                      {t("offer", "Teklifli Ürün")}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 font-medium">
                  <span>
                    {item.listing.type} · {item.listing.city}
                  </span>
                  {(item.listing.sellerName || item.listing.sellerSurname) && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span>
                        {item.listing.sellerName} {item.listing.sellerSurname}
                      </span>
                      <SellerRating sellerId={item.listing.sellerId} />
                    </>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                <div className="text-sm font-extrabold font-mono text-slate-900">
                  {formatCurrency(lineTotal, item.listing.currency)}
                </div>
                <div className="mt-0.5 text-xs tabular-nums text-slate-400 font-medium">
                  {item.quantity} × {formatCurrency(unitPrice, item.listing.currency)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Address or Meetup Card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-xs">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>{deliveryMethod === 'SAFE_MEETUP' ? t("meetup_location", "Buluşma Noktası") : t("shipping_address", "Teslimat Adresi")}</span>
          </div>
          {deliveryMethod === 'SAFE_MEETUP' ? (
            <div className="text-sm">
              <p className="font-extrabold text-slate-900">📍 {meetupLocation || 'Belirtilmemiş'}</p>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed font-medium">
                {t("sipari_inizi_elden_teslim_al_rken_sat_c_", "Siparişinizi elden teslim alırken onay kodunu satıcıya iletin.")}
              </p>
            </div>
          ) : shippingAddress ? (
            <div className="text-sm">
              <p className="font-extrabold text-slate-900">{shippingAddress.addressLine}</p>
              <p className="mt-1 text-slate-600 font-medium text-xs">
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </p>
              <p className="mt-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{shippingAddress.country}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium">{t("no_shipping_address_chosen", "Adres seçilmedi.")}</p>
          )}
        </div>

        {/* Payment Card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-xs">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <PaymentIcon className="h-4 w-4 text-emerald-600" />
            <span>{t("payment_method", "Ödeme Yöntemi")}</span>
          </div>
          <div className="text-sm">
            <p className="font-extrabold text-slate-900">{paymentInfo.name}</p>
            {paymentInfo.detail && <p className="mt-1 text-slate-600 font-medium text-xs">{paymentInfo.detail}</p>}
          </div>
        </div>
      </div>

      {/* Subtotal Bar */}
      <div className="mb-6 flex items-baseline justify-between border-t border-slate-100 pt-5">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{t("subtotal", "Toplam Tutar")}</span>
        <span className="text-2xl font-black font-mono text-emerald-700">
          {formatCurrency(totalAmount, currency)}
        </span>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSendingCode}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          {t("back", "Geri")}
        </button>

        <button
          type="button"
          onClick={handleNextClick}
          disabled={isSendingCode}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-white transition-all shadow-md shadow-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-[0.98]"
        >
          {isSendingCode ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("sending_code", "Kod Gönderiliyor...")}
            </>
          ) : (
            <>
              {t("confirm_send_code", "Kodu Gönder & İlerle")}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default memo(CheckoutReviewStep);