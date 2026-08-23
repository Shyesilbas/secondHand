import { useTranslation } from "react-i18next";
import { memo, useId, useState } from 'react';
import { formatCurrency } from '../../../common/formatters.js';
import { useSellerReviewStatsCache } from '../../../reviews/hooks/useSellerReviewStatsCache.js';
import { StarIcon, STAR_SHAPE_PATH } from '../../../reviews/components/StarIcon.jsx';
import { ArrowLeft, ArrowRight, MapPin, Wallet, Loader2, PackageCheck, ShieldCheck } from 'lucide-react';

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
 <div className="inline-flex items-center gap-1 bg-amber-50/70 border border-amber-200/80 px-2 py-0.5 rounded-md">
 <div className="flex items-center">{renderStars(safeAvg)}</div>
 <span className="text-[11px] font-bold text-amber-900">
 {safeAvg.toFixed(1)} <span className="text-amber-700 font-normal">({total})</span>
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
 <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
 {/* Header */}
 <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
 <div>
 <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{t("review_your_order", "Sipariş Özeti & Onay")}</h2>
 <p className="mt-0.5 text-xs text-slate-500 font-medium">
 {t("double_check_details_before_finishing_yo", "Lütfen sipariş bilgilerinizi son kez kontrol edin ve güvenlik kodunu isteyin.")}
 </p>
 </div>
 <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
 <PackageCheck className="h-4 w-4 text-slate-900" />
 {cartItems.length} Ürün Hazır
 </span>
 </div>

 {/* Items list */}
 <div className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 divide-y divide-slate-200/70 overflow-hidden">
 {cartItems.map(item => {
 const isOffer = !!item.isOffer;
 const hasCampaign = !isOffer && item.listing.campaignId && item.listing.campaignPrice != null && parseFloat(item.listing.campaignPrice) < parseFloat(item.listing.price);
 const unitPrice = isOffer ? (item.offerTotalPrice != null && item.quantity ? parseFloat(item.offerTotalPrice) / item.quantity : item.listing.price) : hasCampaign ? item.listing.campaignPrice : item.listing.price;
 const lineTotal = isOffer ? parseFloat(item.offerTotalPrice) || 0 : parseFloat(unitPrice) * item.quantity;

 return (
 <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-white transition-colors">
 {/* Thumbnail */}
 <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
 {item.listing.imageUrl ? (
 <img src={item.listing.imageUrl} alt="" className="h-full w-full object-cover" />
 ) : (
 <span className="text-base font-extrabold text-slate-400">
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
 <span className="rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-900">
 {t("offer", "Özel Teklif")}
 </span>
 )}
 </div>
 <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
 <span className="text-slate-600 font-semibold">{item.listing.city}</span>
 {(item.listing.sellerName || item.listing.sellerSurname) && (
 <>
 <span className="text-slate-300">·</span>
 <span>Satıcı: <strong className="text-slate-800">{item.listing.sellerName} {item.listing.sellerSurname}</strong></span>
 <SellerRating sellerId={item.listing.sellerId} />
 </>
 )}
 </div>
 </div>

 {/* Price */}
 <div className="shrink-0 text-right">
 <div className="text-sm font-extrabold text-slate-900">
 {formatCurrency(lineTotal, item.listing.currency)}
 </div>
 <div className="mt-0.5 text-[11px] text-slate-500">
 {item.quantity} adet × {formatCurrency(unitPrice, item.listing.currency)}
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* Summary Bento Cards (Shipping & Payment) */}
 <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
 {/* Address / Meetup Card */}
 <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
 <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
 <MapPin className="h-4 w-4 text-slate-900" />
 <span>{deliveryMethod === 'SAFE_MEETUP' ? 'Elden Buluşma Noktası' : 'Teslimat & Fatura Adresi'}</span>
 </div>
 {deliveryMethod === 'SAFE_MEETUP' ? (
 <div className="text-xs">
 <p className="font-bold text-slate-900 text-sm">{meetupLocation || 'Belirtilmemiş'}</p>
 <p className="mt-2 text-slate-600 font-medium leading-relaxed">
 {t("sipari_inizi_elden_teslim_al_rken_sat_c_", "Satıcı ile buluştuğunuzda ürünü inceleyip 6 haneli güvenli PIN kodunu vererek işlemi tamamlayabilirsiniz.")}
 </p>
 </div>
 ) : shippingAddress ? (
 <div className="text-xs">
 <p className="font-bold text-slate-900 text-sm">{shippingAddress.title || 'Teslimat Adresi'}</p>
 <p className="mt-1 text-slate-700 font-semibold leading-relaxed">{shippingAddress.addressLine}</p>
 <p className="mt-0.5 text-slate-500 font-medium">
 {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
 </p>
 </div>
 ) : (
 <p className="text-xs text-slate-400 font-medium">{t("no_shipping_address_chosen", "Adres seçilmedi.")}</p>
 )}
 </div>

 {/* Payment Card */}
 <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
 <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
 <Wallet className="h-4 w-4 text-slate-900" />
 <span>{t("payment_method", "Ödeme Yöntemi")}</span>
 </div>
 <div className="text-xs">
 <p className="font-bold text-slate-900 text-sm">SecondHand Cüzdan</p>
 <p className="mt-1 text-slate-600 font-medium">
 Cüzdan Bakiyesinden Tahsil Edilecek Tutar: <strong className="text-slate-900">{formatCurrency(totalAmount, currency)}</strong>
 </p>
 <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 bg-slate-200/80 px-2.5 py-0.5 rounded-full border border-slate-300">
 <ShieldCheck className="h-3.5 w-3.5" />
 Escrow Güvencesi Altında
 </div>
 </div>
 </div>
 </div>

 {/* Subtotal Bar */}
 <div className="mb-6 flex items-baseline justify-between border-t border-slate-100 pt-5">
 <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("subtotal", "Toplam Tutar")}</span>
 <span className="text-2xl font-extrabold text-slate-900">
 {formatCurrency(totalAmount, currency)}
 </span>
 </div>

 {/* Navigation — desktop */}
 <div className="hidden items-center justify-between sm:flex border-t border-slate-100 pt-6">
 <button
 type="button"
 onClick={onBack}
 disabled={isSendingCode}
 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-50"
 >
 <ArrowLeft className="h-4 w-4" strokeWidth={2} />
 {t("back", "Geri")}
 </button>
 <button
 type="button"
 onClick={handleNextClick}
 disabled={isSendingCode}
 className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 shadow-xs active:scale-[0.98]"
 >
 {isSendingCode ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" />
 {t("sending_code", "Doğrulama Kodu Gönderiliyor...")}
 </>
 ) : (
 <>
 {t("confirm_send_code", "Onayla & Doğrulama Kodunu İste")}
 <ArrowRight className="h-4 w-4" strokeWidth={2} />
 </>
 )}
 </button>
 </div>

 {/* Navigation — mobile */}
 <div className="mt-6 grid grid-cols-2 gap-2 border-t border-slate-100 pt-5 sm:hidden">
 <button
 type="button"
 onClick={onBack}
 disabled={isSendingCode}
 className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 disabled:opacity-50"
 >
 <ArrowLeft className="h-4 w-4" strokeWidth={2} />
 {t("back", "Geri")}
 </button>
 <button
 type="button"
 onClick={handleNextClick}
 disabled={isSendingCode}
 className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white disabled:bg-slate-200 disabled:text-slate-400"
 >
 {isSendingCode ? (
 <Loader2 className="h-4 w-4 animate-spin" />
 ) : (
 <>
 {t("confirm_send", "Kodu Gönder")}
 <ArrowRight className="h-4 w-4" strokeWidth={2} />
 </>
 )}
 </button>
 </div>
 </div>
 );
};

export default memo(CheckoutReviewStep);