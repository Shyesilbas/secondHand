import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useListingData } from '../hooks/useListingData.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingCardActions from '../components/ListingCardActions.jsx';
import { listingTypeRegistry } from '../config/listingConfig.js';
import { LISTING_STATUS, NON_PURCHASABLE_TYPES } from '../types/index.js';
import { ROUTES } from '../../common/constants/routes.js';
import { trackView } from '../services/listingAddonService.js';
import { getOrCreateSessionId } from '../../common/utils/sessionId.js';
import {
 AlertTriangle,
 ArrowLeft,
 Calendar,
 Check,
 ChevronDown,
 ChevronLeft,
 ChevronRight,
 ChevronUp,
 Clock,
 Eye,
 Flame,
 FileText,
 HandCoins,
 MapPin,
 Package,
 Share2,
 Shield,
 ShieldCheck,
 ShoppingBag,
 Sparkles,
 Star,
 Tag
} from 'lucide-react';
import { useCart } from '../../cart/hooks/useCart.js';
import MakeOfferModal from '../../offer/components/MakeOfferModal.jsx';
import CompareButton from '../../comparison/components/CompareButton.jsx';
import ListingTrustPanel from '../components/ListingTrustPanel.jsx';
import ListingAnalyticsPanel from '../components/ListingAnalyticsPanel.jsx';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import AuraSummary from '../../common/components/AuraSummary.jsx';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import SimilarListings from '../components/SimilarListings.jsx';
import ListingReviewsSection from '../../reviews/components/ListingReviewsSection.jsx';
import { optimizeCloudinaryUrl } from '../../common/utils/imageOptimizer.js';
import { useActiveReservationCount } from '../../cart/hooks/useActiveReservationCount.js';
import SafeMeetupPanel from '../components/SafeMeetupPanel.jsx';
import RecentlyViewedSection from '../components/RecentlyViewedSection.jsx';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js';

/* ── Helpers ─────────────────────────────────────────────── */

const discountPercent = (original, sale) => {
 const o = parseFloat(original);
 const s = parseFloat(sale);
 if (!o || !s || o <= s) return null;
 return Math.round((o - s) / o * 100);
};

/* ── Sub-components ──────────────────────────────────────── */

/** Skeleton loader */
const DetailSkeleton = () => (
 <div className="min-h-screen bg-slate-50/50">
 <div className="h-14 bg-white border-b border-slate-200/80" />
 <PageContainer className="max-w-[1280px] pt-6">
 <div className="grid lg:grid-cols-12 gap-6">
 <div className="lg:col-span-7 xl:col-span-8 space-y-4">
 <div className="bg-white rounded-3xl p-6 border border-slate-200/80 animate-pulse">
 <div className="h-5 w-20 bg-slate-100 rounded-full mb-3" />
 <div className="h-8 w-3/4 bg-slate-200 rounded-xl mb-3" />
 <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
 </div>
 <div className="aspect-[16/9] bg-slate-200 rounded-3xl animate-pulse" />
 </div>
 <div className="lg:col-span-5 xl:col-span-4">
 <div className="bg-white rounded-3xl p-6 border border-slate-200/80 animate-pulse space-y-4">
 <div className="h-4 w-14 bg-slate-100 rounded-full" />
 <div className="h-9 w-36 bg-slate-200 rounded-xl" />
 <div className="h-11 w-full bg-slate-200 rounded-xl" />
 <div className="h-11 w-full bg-slate-100 rounded-xl" />
 </div>
 </div>
 </div>
 </PageContainer>
 </div>
);

/** Error state */
const DetailError = ({ error }) => {
 const { t } = useTranslation();
 return (
 <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
 <div className="text-center max-w-sm rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-sm">
 <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500 shadow-xs">
 <AlertTriangle className="w-7 h-7" />
 </div>
 <h3 className="text-sm font-extrabold text-slate-900 mb-1.5 tracking-tight">{t("listing_unavailable", "İlan Bulunamadı")}</h3>
 <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed">{error || 'Bu ilan yayından kaldırılmış veya silinmiş olabilir.'}</p>
 <Link
 to={ROUTES.LISTINGS}
 className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-95"
 >
 <ArrowLeft className="w-4 h-4" />
 <span>{t("back_to_listings", "İlanlara Dön")}</span>
 </Link>
 </div>
 </div>
 );
};

/* ── Main Page ───────────────────────────────────────────── */

const ListingDetailPage = () => {
 const { t } = useTranslation();
 const { id } = useParams();
 const navigate = useNavigate();
 const { user, isAuthenticated } = useAuthState();
 const { listing, isLoading, error, refetch: fetchListing } = useListingData(id);
 const { addToCart, isAddingToCart, isInCart } = useCart({ loadCartItems: true });
 const itemIsInCart = isInCart(listing?.id);
 const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
 const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
 const [selectedImageIndex, setSelectedImageIndex] = useState(0);
 const [imageError, setImageError] = useState(false);
 const [activeTab, setActiveTab] = useState('details');
 const viewTrackedRef = useRef(false);
 const galleryRef = useRef(null);
 const { count: activeReservations } = useActiveReservationCount(listing?.id);
 const images = listing?.imageUrls?.length > 0 ? listing.imageUrls : listing?.imageUrl ? [listing.imageUrl] : [];
 const isOwner = isAuthenticated && user?.id === listing?.sellerId;
 const hasCampaign = listing?.campaignId && listing?.campaignPrice != null && parseFloat(listing?.campaignPrice) < parseFloat(listing?.price);
 const displayPrice = hasCampaign ? listing?.campaignPrice : listing?.price;
 const discount = hasCampaign ? discountPercent(listing?.price, listing?.campaignPrice) : null;

 /* Reset image on listing change */
 useEffect(() => {
 setSelectedImageIndex(0);
 setImageError(false);
 }, [listing?.id]);

 useEffect(() => {
 setImageError(false);
 }, [selectedImageIndex]);

 const { addRecentlyViewed } = useRecentlyViewed();

 /* Save to recently viewed */
 useEffect(() => {
 if (listing?.id) {
 addRecentlyViewed(listing);
 }
 }, [listing, addRecentlyViewed]);

 /* Track view */
 useEffect(() => {
 if (listing && !viewTrackedRef.current && !isOwner) {
 viewTrackedRef.current = true;
 trackView(listing.id, getOrCreateSessionId(), navigator.userAgent);
 }
 }, [listing, isOwner]);

 /* SEO */
 useEffect(() => {
 if (!listing) return;
 document.title = `${listing.title} - ${formatCurrency(displayPrice, listing.currency)} | SecondHand`;
 const schemaId = 'listing-structured-data';
 let scriptEl = document.getElementById(schemaId);
 if (!scriptEl) {
 scriptEl = document.createElement('script');
 scriptEl.id = schemaId;
 scriptEl.type = 'application/ld+json';
 document.head.appendChild(scriptEl);
 }
 scriptEl.textContent = JSON.stringify({
 "@context": "https://schema.org/",
 "@type": "Product",
 "name": listing.title,
 "image": listing.imageUrl ? optimizeCloudinaryUrl(listing.imageUrl, { width: 1200 }) : "",
 "description": listing.description || "",
 "offers": {
 "@type": "Offer",
 "price": displayPrice?.toString(),
 "priceCurrency": listing.currency || "TRY",
 "availability": listing.status === 'ACTIVE' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
 }
 });
 return () => document.getElementById(schemaId)?.remove();
 }, [listing, displayPrice]);

 /* Share */
 const handleShare = useCallback(async () => {
 const url = window.location.href;
 if (navigator.share) {
 await navigator.share({
 title: listing?.title || 'SecondHand İlanı',
 url
 });
 return;
 }
 await navigator.clipboard?.writeText(url);
 }, [listing?.title]);

 /* Gallery nav */
 const showPreviousImage = useCallback(() => {
 setSelectedImageIndex(c => c === 0 ? Math.max(images.length - 1, 0) : c - 1);
 }, [images.length]);
 const showNextImage = useCallback(() => {
 setSelectedImageIndex(c => c + 1 >= images.length ? 0 : c + 1);
 }, [images.length]);

 /* Keyboard nav for gallery */
 useEffect(() => {
 const handler = e => {
 if (e.key === 'ArrowLeft') showPreviousImage();
 if (e.key === 'ArrowRight') showNextImage();
 };
 window.addEventListener('keydown', handler);
 return () => window.removeEventListener('keydown', handler);
 }, [showPreviousImage, showNextImage]);

 /* Derived */
 const DetailsComponent = listing ? listingTypeRegistry[listing.type]?.detailsComponent : null;
 const hasReviews = listing ? !NON_PURCHASABLE_TYPES.includes(listing.type) : false;
 const canAddToCart = listing && !isOwner && !NON_PURCHASABLE_TYPES.includes(listing.type) && listing.status === LISTING_STATUS.ACTIVE;
 const canMakeOffer = listing && !isOwner && !NON_PURCHASABLE_TYPES.includes(listing.type) && listing.status === LISTING_STATUS.ACTIVE;
 const isLowStock = listing?.quantity != null && Number(listing.quantity) > 0 && Number(listing.quantity) < 10;
 const hasStockInfo = listing?.quantity != null && Number.isFinite(Number(listing?.quantity));
 const categoryBadges = listing ? listingTypeRegistry[listing.type]?.compactBadges?.(listing) || [] : [];
 const selectedImage = images[selectedImageIndex];
 const shouldClampDescription = listing?.description?.length > 420;
 const locationLabel = listing ? [listing.district, listing.city].filter(Boolean).join(', ') || 'Konum belirtilmedi' : '';

 /* ── Render ──────────────────────────────────────────── */

 if (isLoading) return <DetailSkeleton />;
 if (error) return <DetailError error={error} />;
 if (!listing) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFB] pb-24 text-slate-900 selection:bg-slate-200 selection:text-slate-900 font-sans">
      
      {/* ▸ Minimal Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <PageContainer className="max-w-[1320px] h-14 flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 min-w-0">
            <Link to={ROUTES.LISTINGS} className="hover:text-slate-900 transition-colors flex items-center gap-1.5 shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span>{t("all_listings", "Tüm İlanlar")}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] shrink-0">{listing.type}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden md:block" />
            <span className="text-slate-900 font-bold truncate hidden md:inline max-w-[280px]">{listing.title}</span>
          </nav>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(ROUTES.AURA_CHAT, { state: { listing } })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">{t("ask_aura", "Aura AI")}</span>
            </button>
            {!isOwner && <CompareButton listing={listing} size="md" className="hidden sm:flex" />}
            {!isOwner && (
              <FavoriteButton
                listingId={listing.id}
                listing={listing}
                size="md"
                showCount={false}
                className="p-2 border border-slate-200 bg-white text-slate-600 hover:text-rose-600 rounded-xl transition-all hover:bg-rose-50 hover:border-rose-200 shadow-xs cursor-pointer"
              />
            )}
            <button
              onClick={handleShare}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl transition-all hover:bg-slate-100 border border-slate-200 bg-white shadow-xs cursor-pointer"
              aria-label={t("share", "Paylaş")}
              title={t("share", "Paylaş")}
            >
              <Share2 className="w-4 h-4" />
            </button>
            {isOwner && <ListingCardActions listing={listing} onChanged={fetchListing} />}
          </div>
        </PageContainer>
      </header>

      {/* Offer Modal */}
      <MakeOfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} listing={listing} />

      {/* ▸ Main Hero Stage */}
      <PageContainer className="max-w-[1320px] pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* ── Left Column: Clean Focused Media Gallery (7 cols) ── */}
          <div className="lg:col-span-7 space-y-3">
            {/* Main Image Stage */}
            <div 
              ref={galleryRef} 
              className="w-full aspect-[4/3] sm:aspect-[1/1] lg:max-h-[580px] bg-white rounded-3xl overflow-hidden relative group border border-slate-200/90 shadow-2xs flex items-center justify-center"
            >
              {selectedImage && !imageError ? (
                <img
                  key={selectedImage}
                  src={optimizeCloudinaryUrl(selectedImage, { width: 1400 })}
                  onError={() => setImageError(true)}
                  alt={`${listing.title} - ${selectedImageIndex + 1}`}
                  className="w-full h-full object-contain p-4 sm:p-6 transition-transform duration-300"
                  fetchpriority="high"
                  decoding="async"
                  loading="eager"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Package className="w-10 h-10 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-semibold">{t("no_image_available", "Fotoğraf bulunmuyor")}</p>
                </div>
              )}

              {/* Gallery Navigation Controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={showPreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 border border-slate-200 cursor-pointer hover:scale-105"
                    aria-label={t("previous", "Önceki")}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={showNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 border border-slate-200 cursor-pointer hover:scale-105"
                    aria-label={t("next", "Sonraki")}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto py-1 px-0.5 scrollbar-none">
                {images.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                      selectedImageIndex === idx
                        ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
                        : 'border-slate-200/80 opacity-60 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={optimizeCloudinaryUrl(imgUrl, { width: 160 })}
                      alt=""
                      className="h-full w-full object-contain p-1"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right Column: Unified Buy Box & Product Identity (5 cols) ── */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
              
              {/* Product Header & Meta */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                    {listing.type}
                  </span>
                  {categoryBadges.flatMap((badge, bIdx) => {
                    const labelStr = String(badge.label || '');
                    const parts = labelStr.includes(' • ') ? labelStr.split(' • ').map(p => p.trim()).filter(Boolean) : [labelStr];
                    return parts.map((part, pIdx) => (
                      <span key={`${bIdx}-${pIdx}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200/70">
                        {pIdx === 0 && badge.icon && <span className="text-xs">{badge.icon}</span>}
                        <span>{part}</span>
                      </span>
                    ));
                  })}
                  {hasCampaign && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900 border border-amber-200">
                      <Tag className="w-3 h-3 text-amber-600" />
                      {listing.campaignName || 'İndirim'}
                      {discount && <span>−{discount}%</span>}
                    </span>
                  )}
                  {listing.status !== LISTING_STATUS.ACTIVE && (
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 uppercase">
                      {listing.status}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {listing.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{locationLabel}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDateTime(listing.createdAt)}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{listing.viewCount || 0} {t("views", "görüntülenme")}</span>
                  </div>
                </div>
              </div>

              {/* Price Row */}
              <div className="py-3.5 px-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatCurrency(displayPrice, listing.currency)}
                  </span>
                  {hasCampaign && (
                    <div className="text-xs text-slate-400 line-through font-semibold mt-0.5">
                      {formatCurrency(listing.price, listing.currency)}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {hasStockInfo && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${
                      isLowStock ? 'bg-rose-100 text-rose-800' : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
                    }`}>
                      <Package className="w-3.5 h-3.5" />
                      <span>{isLowStock ? `Son ${Number(listing.quantity)} Adet!` : `${Number(listing.quantity)} Adet Stokta`}</span>
                    </span>
                  )}
                  {activeReservations > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 shadow-2xs">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      <span>{activeReservations} {t("people_looking", "kişi inceliyor")}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {(canAddToCart || canMakeOffer) && (
                <div className="space-y-2.5 pt-1">
                  {canAddToCart && (
                    <button
                      onClick={() => itemIsInCart ? navigate(ROUTES.SHOPPING_CART) : addToCart(listing.id)}
                      disabled={isAddingToCart}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.99] ${
                        itemIsInCart
                          ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10'
                      }`}
                    >
                      {isAddingToCart ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : itemIsInCart ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>{t("in_cart", "Sepette (Sepete Git)")}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>{t("add_to_cart", "Sepete Ekle")}</span>
                        </>
                      )}
                    </button>
                  )}
                  {canMakeOffer && (
                    <button
                      onClick={() => setIsOfferModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.99] shadow-2xs"
                    >
                      <HandCoins className="w-4 h-4 text-slate-600" />
                      <span>{t("make_an_offer", "Teklif Ver")}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Trust Badge Bar */}
              <div className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
                <span>Escrow Güvenceli Ödeme & Güvenli Teslimat</span>
              </div>

              {/* Integrated Seller Profile */}
              <div className="pt-4 border-t border-slate-100">
                <ListingTrustPanel listing={listing} isOwner={isOwner} onShowcaseSuccess={fetchListing} flat={true} />
              </div>
            </div>

            {/* Market Insights Card */}
            <ListingAnalyticsPanel listing={listing} isOwner={isOwner} displayPrice={displayPrice} />
          </div>

        </div>

        {/* ── Bottom Section: Full-Width Tabs (Specs, Description, Reviews) ── */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 gap-6 mb-8 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`pb-3 text-sm font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'details'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t("details_and_specs", "Detaylar & Özellikler")}</span>
            </button>

            {hasReviews && (
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-sm font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>{t("reviews", "Değerlendirmeler")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('safety')}
              className={`pb-3 text-sm font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'safety'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t("safe_meetup", "Güvenli Buluşma")}</span>
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'details' && (
              <div className="space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                    {t("about_this_item", "Ürün Açıklaması")}
                  </h3>
                  <div className={`text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-medium ${!isDescriptionExpanded && shouldClampDescription ? 'max-h-[160px] overflow-hidden relative' : ''}`}>
                    {listing.description || 'Bu ilan için detaylı açıklama girilmemiş.'}
                    {!isDescriptionExpanded && shouldClampDescription && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                  </div>
                  {shouldClampDescription && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-3 inline-flex items-center gap-1.5 text-slate-900 font-extrabold text-xs uppercase tracking-wider hover:underline cursor-pointer"
                    >
                      {isDescriptionExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>{t("show_less", "Daha Az Göster")}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>{t("read_more", "Devamını Oku")}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Structured Specifications Grid */}
                {DetailsComponent && (
                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                      {t("specifications", "Teknik Özellikler")}
                    </h3>
                    <DetailsComponent listing={listing} flat={true} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && hasReviews && (
              <ListingReviewsSection listing={listing} />
            )}

            {activeTab === 'safety' && (
              <SafeMeetupPanel listing={listing} />
            )}
          </div>
        </div>

        {/* Similar Listings */}
        <div className="mt-10">
          <SimilarListings currentListing={listing} />
        </div>

        {/* Recently Viewed Listings */}
        <div className="mt-8">
          <RecentlyViewedSection currentListingId={listing?.id} />
        </div>
      </PageContainer>

      {/* ▸ Mobile Bottom Bar */}
      {(canAddToCart || canMakeOffer || !isOwner) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-safe shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            {/* Price */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-extrabold tabular-nums tracking-tight leading-none mb-0.5 text-slate-900">
                {formatCurrency(displayPrice, listing.currency)}
              </p>
              {hasCampaign ? (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400 line-through font-bold tabular-nums">{formatCurrency(listing.price, listing.currency)}</p>
                  {discount && <span className="text-xs font-black text-slate-900">−{discount}%</span>}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-bold truncate">{locationLabel}</p>
              )}
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              {!isOwner && <ContactSellerButton listing={listing} className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors" />}
              {canMakeOffer && (
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-900 text-xs font-extrabold uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {t('make_offer', 'Teklif')}
                </button>
              )}
              {canAddToCart && (
                <button
                  onClick={() => itemIsInCart ? navigate(ROUTES.SHOPPING_CART) : addToCart(listing.id)}
                  disabled={isAddingToCart}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer ${
                    itemIsInCart
                      ? 'bg-slate-100 text-slate-900 border border-slate-400'
                      : 'bg-slate-900 text-white shadow-xs'
                  }`}
                >
                  {isAddingToCart ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : itemIsInCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t("in_cart", "Sepette")}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t("cart", "Sepet")}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;