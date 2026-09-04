import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { getListingFavoriteCount } from '../../favorites/favorites.js';
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
  Heart,
  Layers,
  MapPin,
  Package,
  Share2,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Settings
} from 'lucide-react';
import { useCart } from '../../cart/hooks/useCart.js';
import MakeOfferModal from '../../offer/components/MakeOfferModal.jsx';
import CompareButton from '../../comparison/components/CompareButton.jsx';
import ListingTrustPanel from '../components/ListingTrustPanel.jsx';
import ListingAnalyticsPanel from '../components/ListingAnalyticsPanel.jsx';
import { formatCurrency, formatPrice, formatDateTime } from '../../common/formatters.js';
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
  return Math.round(((o - s) / o) * 100);
};

/* ── Sub-components ──────────────────────────────────────── */

/** High-fidelity skeleton loader */
const DetailSkeleton = () => (
  <div className="min-h-screen bg-slate-50/60 font-sans pb-24">
    <div className="h-14 bg-white/80 border-b border-slate-200/80 animate-pulse" />
    <PageContainer className="max-w-[1360px] pt-6 sm:pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          <div className="aspect-[4/3] sm:aspect-[16/11] bg-slate-200/70 rounded-[28px] animate-pulse" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 w-24 bg-slate-200/60 rounded-2xl animate-pulse shrink-0" />
            ))}
          </div>
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/70 animate-pulse space-y-3">
            <div className="h-5 w-40 bg-slate-200 rounded-lg" />
            <div className="h-4 w-full bg-slate-100 rounded-md" />
            <div className="h-4 w-4/5 bg-slate-100 rounded-md" />
          </div>
        </div>
        {/* Right Column Skeleton */}
        <div className="lg:col-span-5 xl:col-span-5">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 animate-pulse space-y-5">
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-slate-200 rounded-md" />
              <div className="h-5 w-24 bg-slate-100 rounded-md" />
            </div>
            <div className="h-8 w-4/5 bg-slate-200 rounded-xl" />
            <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
            <div className="h-24 bg-slate-50 rounded-2xl border border-slate-100" />
            <div className="h-12 w-full bg-slate-900/10 rounded-2xl" />
            <div className="h-10 w-full bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </PageContainer>
  </div>
);

/** Modern Error state */
const DetailError = ({ error }) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 font-sans">
      <div className="text-center max-w-md w-full rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-lg shadow-slate-900/5">
        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500 shadow-xs">
          <AlertTriangle className="w-8 h-8 stroke-[1.75]" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">
          {t("listing_unavailable", "İlan Bulunamadı")}
        </h3>
        <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed">
          {error || t("listing_unavailable_desc", "Bu ilan yayından kaldırılmış, satılmış veya silinmiş olabilir.")}
        </p>
        <Link
          to={ROUTES.LISTINGS}
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
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
  const [copiedLink, setCopiedLink] = useState(false);
  const viewTrackedRef = useRef(false);
  const galleryRef = useRef(null);

  const { cartReservations, activeViewers } = useActiveReservationCount(listing?.id, {
    enablePolling: true,
    pollInterval: 10 * 60 * 1000
  });

  const images = listing?.imageUrls?.length > 0
    ? listing.imageUrls
    : listing?.imageUrl
    ? [listing.imageUrl]
    : [];

  const isOwner = isAuthenticated && user?.id === listing?.sellerId;
  const hasCampaign = listing?.campaignId && listing?.campaignPrice != null && parseFloat(listing?.campaignPrice) < parseFloat(listing?.price);
  const displayPrice = hasCampaign ? listing?.campaignPrice : listing?.price;
  const discount = hasCampaign ? discountPercent(listing?.price, listing?.campaignPrice) : null;
  const favoriteCount = getListingFavoriteCount(listing);

  // ── Live Urgency & Social Proof Story Ticker ──
  const detailStoryItems = useMemo(() => {
    const list = [];
    if (cartReservations > 0) {
      list.push({
        id: 'cart',
        icon: <Flame className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0 animate-pulse" />,
        text: `Şu an ${cartReservations} kişinin sepetinde / satın alma adımında`,
        badge: 'Yüksek Talep',
        bg: 'bg-amber-500/10 text-amber-950 border-amber-300/80 shadow-xs'
      });
    }
    if (activeViewers > 0) {
      list.push({
        id: 'viewers',
        icon: <Eye className="w-4 h-4 text-slate-700 shrink-0" />,
        text: `Son 24 saatte ${activeViewers} kişi bu ilanı inceledi`,
        badge: 'Popüler',
        bg: 'bg-slate-100/90 text-slate-900 border-slate-200/90 shadow-2xs'
      });
    }
    return list;
  }, [activeViewers, cartReservations]);

  const [detailStoryIndex, setDetailStoryIndex] = useState(0);

  // Soft loop rotation if multiple signals exist
  useEffect(() => {
    if (detailStoryItems.length <= 1) return;

    const timer = setInterval(() => {
      setDetailStoryIndex(prev => (prev + 1) % detailStoryItems.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [detailStoryItems.length]);

  const currentDetailStory = detailStoryItems.length > 0
    ? detailStoryItems[detailStoryIndex % detailStoryItems.length]
    : null;

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
      try {
        await navigator.share({
          title: listing?.title || 'SecondHand İlanı',
          url
        });
        return;
      } catch {
        // Share cancelled or not supported, fallback to clipboard
      }
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  }, [listing?.title]);

  /* Gallery nav */
  const showPreviousImage = useCallback(() => {
    setSelectedImageIndex(c => (c === 0 ? Math.max(images.length - 1, 0) : c - 1));
  }, [images.length]);

  const showNextImage = useCallback(() => {
    setSelectedImageIndex(c => (c + 1 >= images.length ? 0 : c + 1));
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
  const selectedImage = images[selectedImageIndex];
  const shouldClampDescription = listing?.description?.length > 400;
  const locationLabel = listing ? [listing.district, listing.city].filter(Boolean).join(', ') || 'Konum belirtilmedi' : '';

  /* ── Render ──────────────────────────────────────────── */

  if (isLoading) return <DetailSkeleton />;
  if (error) return <DetailError error={error} />;
  if (!listing) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-28 text-slate-900 selection:bg-slate-200 selection:text-slate-900 font-sans">
      
      {/* ── Top Navigation & Quick Action Bar ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-xs transition-all">
        <PageContainer className="max-w-[1360px] h-14 sm:h-15 flex items-center justify-between gap-4">
          
          {/* Breadcrumb Path */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 min-w-0" aria-label="Breadcrumb">
            <Link
              to={ROUTES.LISTINGS}
              className="hover:text-slate-900 transition-colors flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-bold">{t("all_listings", "İlanlar")}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] shrink-0 bg-slate-100/90 border border-slate-200/60 px-2.5 py-0.5 rounded-lg">
              {listing.type}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden md:block" />
            <span className="text-slate-900 font-bold truncate hidden md:inline max-w-[340px]">
              {listing.title}
            </span>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Aura AI Chat Button */}
            <button
              onClick={() => navigate(ROUTES.AURA_CHAT, { state: { listing } })}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 text-slate-900 border border-indigo-200/70 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95"
              title={t("ask_aura_tip", "Bu ilan hakkında Aura AI ile konuş")}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>{t("ask_aura", "Aura AI")}</span>
            </button>

            {/* Compare Button */}
            {!isOwner && <CompareButton listing={listing} size="md" className="hidden sm:flex" />}

            {/* Favorite Button */}
            {!isOwner && (
              <FavoriteButton
                listingId={listing.id}
                listing={listing}
                size="md"
                showCount={false}
                className="p-2 border border-slate-200/90 bg-white text-slate-600 hover:text-rose-600 rounded-xl transition-all hover:bg-rose-50/60 hover:border-rose-200 shadow-2xs cursor-pointer active:scale-95"
              />
            )}

            {/* Share Button with Copied State Feedback */}
            <button
              onClick={handleShare}
              className={`p-2 rounded-xl transition-all border shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
                copiedLink
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border-slate-200/90'
              }`}
              aria-label={t("share", "Paylaş")}
              title={copiedLink ? t("link_copied", "Bağlantı kopyalandı!") : t("share", "Paylaş")}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in-50" />
                  <span className="hidden sm:inline text-[11px] text-emerald-700">{t("copied", "Kopyalandı!")}</span>
                </>
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* Owner Listing Actions */}
            {isOwner && <ListingCardActions listing={listing} onChanged={fetchListing} />}
          </div>

        </PageContainer>
      </header>

      {/* Offer Modal */}
      <MakeOfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} listing={listing} />

      {/* ── Main Stage (2 Columns: Left Storyline, Right Floating Buy Box) ── */}
      <PageContainer className="max-w-[1360px] pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">

          {/* ══════════════════════════════════════════════════════════════
              LEFT COLUMN: Media Gallery + Rich Storyline Content (7 Cols)
             ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-7">
            
            {/* 1. Media Gallery Stage */}
            <div className="space-y-3.5">
              <div 
                ref={galleryRef} 
                className="w-full aspect-[4/3] sm:aspect-[16/11] bg-gradient-to-b from-white to-slate-50/60 rounded-[28px] overflow-hidden relative group border border-slate-200/80 shadow-xs flex items-center justify-center transition-all"
              >
                {selectedImage && !imageError ? (
                  <img
                    key={selectedImage}
                    src={optimizeCloudinaryUrl(selectedImage, { width: 1400 })}
                    onError={() => setImageError(true)}
                    alt={`${listing.title} - ${selectedImageIndex + 1}`}
                    className="w-full h-full object-contain p-4 sm:p-6 transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    fetchpriority="high"
                    decoding="async"
                    loading="eager"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                      <Package className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <p className="text-xs font-bold text-slate-500">{t("no_image_available", "Fotoğraf bulunmuyor")}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t("seller_no_upload", "Satıcı bu ilan için görsel eklemedi.")}</p>
                  </div>
                )}

                {/* Gallery Navigation Floating Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={showPreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 border border-slate-200/80 cursor-pointer hover:scale-105 active:scale-95"
                      aria-label={t("previous", "Önceki")}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={showNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 border border-slate-200/80 cursor-pointer hover:scale-105 active:scale-95"
                      aria-label={t("next", "Sonraki")}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Image Counter Badge */}
                    <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-xs border border-white/10 flex items-center gap-1">
                      <span>{selectedImageIndex + 1}</span>
                      <span className="opacity-50">/</span>
                      <span>{images.length}</span>
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
                      className={`h-16 w-20 sm:h-18 sm:w-22 shrink-0 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                        selectedImageIndex === idx
                          ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-xs scale-100'
                          : 'border-slate-200/80 opacity-60 hover:opacity-100 hover:border-slate-400 scale-95'
                      }`}
                      aria-label={`Görsel ${idx + 1}`}
                    >
                      <img
                        src={optimizeCloudinaryUrl(imgUrl, { width: 180 })}
                        alt=""
                        className="h-full w-full object-contain p-1"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Aura AI Smart Insights Highlight Card */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-amber-50/50 rounded-3xl border border-indigo-100/90 p-6 sm:p-7 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
                    <Sparkles className="w-4 h-4 fill-amber-300 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Aura AI İlan Analizi
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Yapay zeka destekli piyasa ve satıcı değerlendirmesi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(ROUTES.AURA_CHAT, { state: { listing } })}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white/90 hover:bg-white border border-indigo-200/80 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
                >
                  Soru Sor →
                </button>
              </div>

              {/* AI Summary Content */}
              <div className="text-xs leading-relaxed text-slate-700 font-medium bg-white/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-indigo-100/70 shadow-2xs">
                <AuraSummary type="listing" id={listing?.id} listing={listing} />
              </div>
            </div>

            {/* 3. Description Section */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <FileText className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                  {t("about_this_item", "Ürün Açıklaması")}
                </h2>
              </div>
              <div className={`text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-medium ${!isDescriptionExpanded && shouldClampDescription ? 'max-h-[160px] overflow-hidden relative' : ''}`}>
                {listing.description || t("no_description_provided", "Bu ilan için detaylı açıklama girilmemiş.")}
                {!isDescriptionExpanded && shouldClampDescription && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>
              {shouldClampDescription && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-3.5 inline-flex items-center gap-1.5 text-slate-900 font-black text-xs uppercase tracking-wider hover:underline cursor-pointer"
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

            {/* 4. Structured Technical Specifications */}
            {DetailsComponent && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    {t("specifications", "Teknik Özellikler & Detaylar")}
                  </h2>
                </div>
                <DetailsComponent listing={listing} flat={true} />
              </div>
            )}

            {/* 5. Safe Meetup & Escrow Protection Hub */}
            <SafeMeetupPanel listing={listing} />

            {/* 6. Verified Reviews & Community Feedback */}
            {hasReviews && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    {t("reviews", "Kullanıcı Değerlendirmeleri")}
                  </h2>
                </div>
                <ListingReviewsSection listing={listing} />
              </div>
            )}

          </div>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT COLUMN: Floating Sticky Buy Box & Trust Hub (5 Cols)
             ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-6 lg:sticky lg:top-20">
            
            {/* Unified Floating Buy Box */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
              
              {/* Product Header & Meta Badges */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                    {listing.type}
                  </span>
                  {hasCampaign && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900 border border-amber-200">
                      <Tag className="w-3 h-3 text-amber-600" />
                      {listing.campaignName || 'İndirim'}
                      {discount && <span>−%{discount}</span>}
                    </span>
                  )}
                  {listing.status !== LISTING_STATUS.ACTIVE && (
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 uppercase">
                      {listing.status}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
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
                  <div className="flex items-center gap-1 text-slate-600">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>{favoriteCount} {t("favorites", "favori")}</span>
                  </div>
                  {isOwner && (
                    <>
                      <span>•</span>
                      <div className="inline-flex items-center gap-1 text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80 text-[11px]" title="Sadece satıcıya özel görüntülenme verisi">
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>{listing.viewCount ?? listing.viewStats?.totalViews ?? 0} {t("views", "görüntülenme")}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Price & Stock Availability Card ── */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs space-y-3.5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Price Block */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-slate-400 select-none">
                        {listing.currency === 'TRY' ? '₺' : listing.currency === 'USD' ? '$' : listing.currency === 'EUR' ? '€' : listing.currency}
                      </span>
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
                        {formatPrice(displayPrice, { decimals: 0 })}
                      </span>
                      {Number(displayPrice) % 1 !== 0 && (
                        <span className="text-base font-extrabold text-slate-400 tabular-nums">
                          ,{String(Number(displayPrice).toFixed(2)).split('.')[1]}
                        </span>
                      )}
                    </div>

                    {hasCampaign && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-slate-400 line-through font-bold tabular-nums">
                          {formatCurrency(listing.price, listing.currency)}
                        </span>
                        {discount && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black tracking-tight border border-emerald-200">
                            −%{discount} İndirim
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stock Availability Badge */}
                  {hasStockInfo && (
                    <div className="flex flex-col items-end gap-1 pt-0.5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        Number(listing.quantity) === 0
                          ? 'bg-slate-100 text-slate-500 border border-slate-200 shadow-2xs'
                          : isLowStock
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 ring-2 ring-rose-500/10 shadow-2xs'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                      }`}>
                        {Number(listing.quantity) === 0 ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span>Tükendi</span>
                          </>
                        ) : isLowStock ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                            <span>Son {Number(listing.quantity)} Adet!</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
                            <span>Stokta ({Number(listing.quantity)} Adet)</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Urgency / Social Proof Trigger Banner (Directly motivating the CTA) */}
              {currentDetailStory && (
                <div 
                  key={currentDetailStory.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-bottom-1 ${currentDetailStory.bg}`}
                >
                  <div className="flex items-center gap-2.5">
                    {currentDetailStory.icon}
                    <span>{currentDetailStory.text}</span>
                  </div>
                  {currentDetailStory.badge && (
                    <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-md bg-white/80 border border-current/20 shrink-0">
                      {currentDetailStory.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons: Buyer Actions vs. Seller Management */}
              {isOwner ? (
                <div className="space-y-2.5 pt-1">
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5 text-indigo-600" />
                        {t('seller_controls', 'İlan Sahibi Yönetim Paneli')}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                        {t('your_listing', 'Senin İlanın')}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-950/80 font-medium">
                      {t('seller_controls_desc', 'Fiyatını kır, stok güncelle, vitrine çıkar veya ilan durumunu değiştir.')}
                    </p>
                    <div className="flex items-center gap-2">
                      <ListingCardActions listing={listing} onChanged={fetchListing} variant="button" />
                    </div>
                  </div>
                </div>
              ) : (canAddToCart || canMakeOffer) ? (
                <div className="space-y-2.5 pt-1">
                  {canAddToCart && (
                    <button
                      onClick={() => itemIsInCart ? navigate(ROUTES.SHOPPING_CART) : addToCart(listing.id)}
                      disabled={isAddingToCart}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.99] ${
                        itemIsInCart
                          ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 hover:shadow-lg'
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
              ) : null}

              {/* Trust Badge Guarantee */}
              <div className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
                <span>{t("escrow_guarantee_text", "Escrow Güvenceli Ödeme & Güvenli Teslimat")}</span>
              </div>

              {/* Integrated Seller Profile */}
              <div className="pt-4 border-t border-slate-100">
                <ListingTrustPanel listing={listing} isOwner={isOwner} onShowcaseSuccess={fetchListing} flat={true} />
              </div>
            </div>

            {/* Market Insights & Analytics Card */}
            <ListingAnalyticsPanel listing={listing} isOwner={isOwner} displayPrice={displayPrice} />

          </div>

        </div>

        {/* ── Bottom Section: Similar & Recently Viewed Listings ── */}
        <div className="mt-14 space-y-12">
          {/* Similar Listings Carousel */}
          <div>
            <SimilarListings currentListing={listing} />
          </div>

          {/* Recently Viewed Listings */}
          <div>
            <RecentlyViewedSection currentListingId={listing?.id} />
          </div>
        </div>

      </PageContainer>

      {/* ── Mobile Sticky Bottom Bar ── */}
      {(canAddToCart || canMakeOffer || !isOwner) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 pb-safe shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            {/* Price */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-extrabold tabular-nums tracking-tight leading-none mb-0.5 text-slate-900">
                {formatCurrency(displayPrice, listing.currency)}
              </p>
              {hasCampaign ? (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400 line-through font-bold tabular-nums">{formatCurrency(listing.price, listing.currency)}</p>
                  {discount && <span className="text-xs font-black text-slate-900">−%{discount}</span>}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-bold truncate">{locationLabel}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              {!isOwner && (
                <ContactSellerButton
                  listing={listing}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors"
                />
              )}
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