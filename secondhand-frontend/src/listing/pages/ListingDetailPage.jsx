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
    <div className="min-h-screen bg-slate-50/50 pb-28 lg:pb-16 text-slate-900 selection:bg-emerald-50 selection:text-emerald-700 font-sans">

      {/* ▸ Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs text-sm">
        <PageContainer className="max-w-[1280px] h-14 flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-bold min-w-0">
            <Link to={ROUTES.LISTINGS} className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 shrink-0">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">{t("explore", "Keşfet")}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden sm:block" />
            <span className="text-slate-500 font-extrabold uppercase tracking-wider text-[11px] hidden sm:inline shrink-0">{listing.type}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden md:block" />
            <span className="text-slate-900 font-extrabold truncate hidden md:inline max-w-[240px]">{listing.title}</span>
          </nav>

          {/* Top Header Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => navigate(ROUTES.AURA_CHAT, { state: { listing } })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-95"
              title={t("ask_aura_ai", "Aura AI'a Danış")}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{t("ask_aura", "Aura AI")}</span>
            </button>
            {!isOwner && <CompareButton listing={listing} size="md" className="hidden sm:flex" />}
            {!isOwner && (
              <FavoriteButton
                listingId={listing.id}
                listing={listing}
                size="md"
                showCount={false}
                className="p-2 border border-slate-200/80 bg-white text-slate-500 hover:text-rose-600 rounded-xl transition-all hover:bg-rose-50 hover:border-rose-200 shadow-xs cursor-pointer"
              />
            )}
            <button
              onClick={handleShare}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl transition-all hover:bg-slate-100 border border-slate-200/80 bg-white shadow-xs cursor-pointer"
              aria-label={t("share_listing", "Paylaş")}
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

      {/* ▸ Main Content */}
      <PageContainer className="max-w-[1280px] pt-6 sm:pt-8">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">

          {/* ── Left Column (Main Gallery & Specs) ─────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">

            {/* Showcase Block (Title + Gallery + Key Specs) */}
            <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1 text-[11px] font-extrabold text-white uppercase tracking-wider">
                    {listing.type}
                  </span>
                  {hasCampaign && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider border border-emerald-200 shadow-xs">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      {listing.campaignName || 'İndirim'}
                      {discount && <span className="ml-0.5 font-mono">−{discount}%</span>}
                    </span>
                  )}
                  {listing.status !== LISTING_STATUS.ACTIVE && (
                    <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border border-slate-200">
                      {listing.status}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-3">
                  {listing.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{locationLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDateTime(listing.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{listing.viewCount || 0} {t("views", "görüntülenme")}</span>
                  </div>
                </div>
              </div>

              {/* Gallery Frame */}
              <div ref={galleryRef} className="w-full aspect-[16/9] sm:aspect-[16/10] lg:max-h-[360px] bg-slate-950 rounded-3xl overflow-hidden relative group cursor-pointer border border-slate-200 shadow-inner flex items-center justify-center">
                {selectedImage && !imageError ? (
                  <img
                    key={selectedImage}
                    src={optimizeCloudinaryUrl(selectedImage, { width: 1200 })}
                    onError={() => setImageError(true)}
                    alt={`${listing.title} - Image ${selectedImageIndex + 1}`}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    fetchpriority="high"
                    decoding="async"
                    loading="eager"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-3 border border-slate-700">
                      <Package className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-xs font-bold">{t("no_image_available", "Fotoğraf bulunmuyor")}</p>
                  </div>
                )}

                {/* Gallery nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={showPreviousImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-white/90 text-slate-900 shadow-lg flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 border border-slate-200 backdrop-blur-md cursor-pointer"
                      aria-label={t("previous_image", "Önceki")}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={showNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-white/90 text-slate-900 shadow-lg flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 border border-slate-200 backdrop-blur-md cursor-pointer"
                      aria-label={t("next_image", "Sonraki")}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* Image counter badge */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1 text-xs font-mono font-bold text-white shadow-md">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 px-0.5 scrollbar-none">
                  {images.slice(0, 10).map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-14 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs scale-105'
                          : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={optimizeCloudinaryUrl(imgUrl, { width: 150 })}
                        alt=""
                        className="h-full w-full object-cover"
                        width="80"
                        height="56"
                        decoding="async"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Key Specs Row */}
              {categoryBadges.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {categoryBadges.flatMap((badge, bIdx) => {
                      const labelStr = String(badge.label || '');
                      const parts = labelStr.includes(' • ') ? labelStr.split(' • ').map(p => p.trim()).filter(Boolean) : [labelStr];
                      return parts.map((part, pIdx) => (
                        <span key={`${bIdx}-${pIdx}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-extrabold border border-slate-200/80 shadow-xs">
                          {pIdx === 0 && badge.icon && <span className="text-sm">{badge.icon}</span>}
                          <span>{part}</span>
                        </span>
                      ));
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* ── Tabbed Content Navigation Card ─────────────────────────── */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Tab Navigation Header */}
              <div className="flex border-b border-slate-100 bg-slate-50/80 p-2 gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'details'
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{t("details_and_specs", "Detaylar & Özellikler")}</span>
                </button>

                {hasReviews && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === 'reviews'
                        ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                    }`}
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>{t("reviews", "Değerlendirmeler")}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('safety')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'safety'
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t("safe_meetup", "Güvenli Buluşma")}</span>
                </button>
              </div>

              {/* Tab Body */}
              <div className="p-5 sm:p-7 space-y-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Aura AI Summary */}
                    {listing?.id && <AuraSummary type="listing" id={listing.id} />}

                    {/* Description */}
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">{t("about_this_item", "Ürün Açıklaması")}</h2>
                      <div className={`text-xs sm:text-sm leading-relaxed text-slate-600 whitespace-pre-wrap relative font-medium ${!isDescriptionExpanded && shouldClampDescription ? 'max-h-[160px] overflow-hidden' : ''}`}>
                        {listing.description || 'Bu ilan için detaylı açıklama girilmemiş.'}
                        {!isDescriptionExpanded && shouldClampDescription && (
                          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none opacity-95" />
                        )}
                      </div>
                      {shouldClampDescription && (
                        <button
                          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                          className="mt-3 inline-flex items-center gap-1.5 text-emerald-700 font-extrabold text-xs uppercase tracking-wider hover:text-emerald-800 transition-colors group cursor-pointer"
                        >
                          {isDescriptionExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                              <span>{t("show_less", "Daha Az Göster")}</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                              <span>{t("read_more", "Devamını Oku")}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Specifications */}
                    {DetailsComponent && (
                      <div className="pt-5 border-t border-slate-100">
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
          </div>

          {/* ── Right Column (Sticky Sidebar & Buy Box) ───────────── */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-[72px] space-y-5">

              {/* Buy Box Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                {/* Price block */}
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">{t("price", "Fiyat")}</p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight leading-none font-mono ${hasCampaign ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {formatCurrency(displayPrice, listing.currency)}
                    </span>
                    {hasCampaign && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-slate-400 line-through font-bold tabular-nums font-mono">
                          {formatCurrency(listing.price, listing.currency)}
                        </span>
                        {discount && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-200">
                            −{discount}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stock & Reservation Alerts */}
                  {(hasStockInfo || activeReservations > 0) && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {hasStockInfo && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold ${isLowStock ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                          {isLowStock && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          <Package className="w-3.5 h-3.5" />
                          <span>{isLowStock ? `Son ${Number(listing.quantity)} adet!` : `${Number(listing.quantity)} adet stokta`}</span>
                        </span>
                      )}
                      {activeReservations > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 text-[11px] font-extrabold border border-amber-200">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          <span>{activeReservations} {t("people_looking", "kişi inceliyor")}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary & Secondary Action CTAs */}
                {(canAddToCart || canMakeOffer) && (
                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                    {canAddToCart && (
                      <button
                        onClick={() => itemIsInCart ? navigate(ROUTES.SHOPPING_CART) : addToCart(listing.id)}
                        disabled={isAddingToCart}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all cursor-pointer active:scale-[0.98] ${
                          itemIsInCart
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10'
                        }`}
                      >
                        {isAddingToCart ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : itemIsInCart ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-700" />
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
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200/80 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]"
                      >
                        <HandCoins className="w-4 h-4 text-slate-600" />
                        <span>{t("make_an_offer", "Teklif Ver")}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Seller Information */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">{t("seller_information", "Satıcı Bilgileri")}</h3>
                <ListingTrustPanel listing={listing} isOwner={isOwner} onShowcaseSuccess={fetchListing} flat={true} />
              </div>

              {/* Market Insights */}
              <ListingAnalyticsPanel listing={listing} isOwner={isOwner} displayPrice={displayPrice} />
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        <div className="mt-10">
          <SimilarListings currentListing={listing} />
        </div>

        {/* Recently Viewed Listings */}
        <RecentlyViewedSection currentListingId={listing?.id} />
      </PageContainer>

      {/* ▸ Mobile Bottom Bar */}
      {(canAddToCart || canMakeOffer || !isOwner) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-safe shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            {/* Price */}
            <div className="flex-1 min-w-0">
              <p className={`text-lg font-extrabold tabular-nums tracking-tight leading-none mb-0.5 font-mono ${hasCampaign ? 'text-emerald-700' : 'text-slate-900'}`}>
                {formatCurrency(displayPrice, listing.currency)}
              </p>
              {hasCampaign ? (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400 line-through font-bold tabular-nums font-mono">{formatCurrency(listing.price, listing.currency)}</p>
                  {discount && <span className="text-xs font-black text-emerald-700 font-mono">−{discount}%</span>}
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
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-emerald-600 text-white shadow-xs'
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