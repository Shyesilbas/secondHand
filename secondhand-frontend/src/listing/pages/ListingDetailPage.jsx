import PageContainer from '@/common/components/layout/PageContainer';
import {useTranslation} from "react-i18next";
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {useListingData} from '../hooks/useListingData.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingCardActions from '../components/ListingCardActions.jsx';
import {listingTypeRegistry} from '../config/listingConfig.js';
import {LISTING_STATUS, NON_PURCHASABLE_TYPES} from '../types/index.js';
import {ROUTES} from '../../common/constants/routes.js';
import {trackView} from '../services/listingAddonService.js';
import {getOrCreateSessionId} from '../../common/utils/sessionId.js';
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
    HandCoins,
    MapPin,
    Package,
    Share2,
    Shield,
    ShoppingBag,
    Sparkles,
    Tag
} from 'lucide-react';
import {useCart} from '../../cart/hooks/useCart.js';
import MakeOfferModal from '../../offer/components/MakeOfferModal.jsx';
import CompareButton from '../../comparison/components/CompareButton.jsx';
import ListingTrustPanel from '../components/ListingTrustPanel.jsx';
import ListingAnalyticsPanel from '../components/ListingAnalyticsPanel.jsx';
import {formatCurrency, formatDateTime} from '../../common/formatters.js';
import AuraSummary from '../../common/components/AuraSummary.jsx';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import SimilarListings from '../components/SimilarListings.jsx';
import ListingReviewsSection from '../../reviews/components/ListingReviewsSection.jsx';
import {optimizeCloudinaryUrl} from '../../common/utils/imageOptimizer.js';
import {useActiveReservationCount} from '../../cart/hooks/useActiveReservationCount.js';
import SafeMeetupPanel from '../components/SafeMeetupPanel.jsx';

/* ── Helpers ─────────────────────────────────────────────── */

const discountPercent = (original, sale) => {
  const o = parseFloat(original);
  const s = parseFloat(sale);
  if (!o || !s || o <= s) return null;
  return Math.round((o - s) / o * 100);
};

/* ── Sub-components ──────────────────────────────────────── */

/** Premium skeleton loader */
const DetailSkeleton = () => <div className="min-h-screen bg-background-secondary">
    <div className="h-14 bg-background-primary border-b border-border-light/50" />
    <PageContainer className="max-w-[1220px] pt-5">
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="bg-background-primary rounded-2xl p-4 animate-pulse">
            <div className="h-5 w-20 bg-secondary-light rounded-full mb-3" />
            <div className="h-7 w-3/4 bg-secondary-light rounded-xl mb-2" />
            <div className="h-3.5 w-1/2 bg-secondary-light rounded-lg" />
          </div>
          <div className="aspect-[3/2] bg-secondary-light rounded-2xl animate-pulse" />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-background-primary rounded-2xl p-5 animate-pulse space-y-4">
            <div className="h-4 w-14 bg-secondary-light rounded-full" />
            <div className="h-9 w-36 bg-secondary-light rounded-xl" />
            <div className="h-11 w-full bg-secondary-light rounded-xl" />
            <div className="h-11 w-full bg-secondary-light rounded-xl" />
          </div>
        </div>
      </div>
    </PageContainer>
  </div>;

/** Error state */
const DetailError = ({
  error
}) => {
  const { t } = useTranslation();
  return <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
    <div className="text-center max-w-sm rounded-2xl border border-border-light bg-background-primary p-10 shadow-lg listing-fade-in">
      <div className="w-16 h-16 bg-background-secondary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
        <AlertTriangle className="w-7 h-7 text-rose-500" />
      </div>
      <h3 className="text-sm font-medium text-text-primary mb-2 tracking-tight">{t("listing_unavailable")}</h3>
      <p className="text-text-muted text-sm font-medium mb-8 leading-relaxed">{error || 'This listing could not be found or may have been removed.'}</p>
      <Link to={ROUTES.LISTINGS} className="inline-flex items-center gap-2.5 px-7 py-2.5 bg-text-primary text-white font-bold rounded-lg hover:bg-text-primary/90 transition-all shadow-sm listing-cta-primary text-sm">
        <ArrowLeft className="w-4 h-4" />{t("back_to_listings")}</Link>
    </div>
  </div>;
};

/* ── Main Page ───────────────────────────────────────────── */

const ListingDetailPage = () => {
  const {
    t
  } = useTranslation();
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated
  } = useAuthState();
  const {
    listing,
    isLoading,
    error,
    refetch: fetchListing
  } = useListingData(id);
  const {
    addToCart,
    isAddingToCart,
    isInCart
  } = useCart({
    loadCartItems: true
  });
  const itemIsInCart = isInCart(listing?.id);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const viewTrackedRef = useRef(false);
  const galleryRef = useRef(null);
  const {
    count: activeReservations
  } = useActiveReservationCount(listing?.id);
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
      "image": listing.imageUrl ? optimizeCloudinaryUrl(listing.imageUrl, {
        width: 1200
      }) : "",
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
        title: listing?.title || 'SecondHand listing',
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
  const locationLabel = listing ? [listing.district, listing.city].filter(Boolean).join(', ') || 'Location not specified' : '';

  /* ── Render ──────────────────────────────────────────── */

  if (isLoading) return <DetailSkeleton />;
  if (error) return <DetailError error={error} />;
  if (!listing) return null;
  return <div className="min-h-screen bg-slate-50/60 pb-28 lg:pb-16 text-slate-900 selection:bg-emerald-50 selection:text-emerald-700">

      {/* ▸ Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm text-sm">
        <PageContainer className="max-w-[1280px] h-[54px] flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm font-semibold min-w-0">
            <Link to={ROUTES.LISTINGS} className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 shrink-0">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">{t("explore")}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
            <span className="text-slate-500 font-bold uppercase tracking-wider text-xs hidden sm:inline shrink-0">{listing.type}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden md:block" />
            <span className="text-slate-900 font-bold truncate hidden md:inline max-w-[240px]">{listing.title}</span>
          </nav>

          {/* Top Header Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => navigate(ROUTES.AURA_CHAT, {
            state: {
              listing
            }
          })} className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/20 rounded-xl font-bold transition-all shadow-sm group" title={t("ask_aura_ai")}>
              <Sparkles className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs">{t("ask_aura")}</span>
            </button>
            {!isOwner && <CompareButton listing={listing} size="md" className="hidden sm:flex" />}
            {!isOwner && <FavoriteButton listingId={listing.id} listing={listing} size="md" showCount={false} className="p-2 border border-slate-200 text-slate-500 hover:text-rose-600 rounded-xl transition-all hover:bg-rose-50 hover:border-rose-200" />}
            <button onClick={handleShare} className="p-2 text-slate-600 hover:text-slate-900 rounded-xl transition-all hover:bg-slate-100 border border-slate-200" aria-label={t("share_listing")} title={t("share")}>
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
            <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-md shadow-slate-200/50 border border-slate-200/90 space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1 text-xs font-extrabold text-white uppercase tracking-wider">
                    {listing.type}
                  </span>
                  {hasCampaign && <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 uppercase tracking-wider border border-emerald-200 shadow-sm">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      {listing.campaignName || 'Sale'}
                      {discount && <span className="ml-0.5 font-mono">−{discount}%</span>}
                    </span>}
                  {listing.status !== LISTING_STATUS.ACTIVE && <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider border border-slate-200">
                      {listing.status}
                    </span>}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-3">
                  {listing.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {locationLabel}
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {formatDateTime(listing.createdAt)}
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    {listing.viewCount || 0} {t("views")}</div>
                </div>
              </div>

              {/* Gallery Frame */}
              <div ref={galleryRef} className="w-full aspect-[3/2] sm:aspect-[16/10] lg:max-h-[420px] bg-slate-900 rounded-2xl overflow-hidden relative group cursor-pointer border border-slate-200 shadow-inner">
                {selectedImage && !imageError ? <img key={selectedImage} src={optimizeCloudinaryUrl(selectedImage, {
                width: 1200
              })} onError={() => setImageError(true)} alt={`${listing.title} - Image ${selectedImageIndex + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" fetchpriority="high" decoding="async" loading="eager" /> : <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-3 border border-slate-700">
                      <Package className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-xs font-bold">{t("no_image_available")}</p>
                  </div>}

                {/* Gallery nav arrows */}
                {images.length > 1 && <>
                    <button onClick={showPreviousImage} className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-white/90 text-slate-900 shadow-xl flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 border border-slate-200 backdrop-blur-md" aria-label={t("previous_image")}>
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={showNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-white/90 text-slate-900 shadow-xl flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 border border-slate-200 backdrop-blur-md" aria-label={t("next_image")}>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* Image counter badge */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1 text-xs font-mono font-bold text-white shadow-md">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </>}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && <div className="flex gap-2.5 overflow-x-auto pb-1 px-0.5 custom-scrollbar">
                  {images.slice(0, 10).map((imgUrl, idx) => <button key={`${imgUrl}-${idx}`} onClick={() => setSelectedImageIndex(idx)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${selectedImageIndex === idx ? 'border-emerald-600 ring-4 ring-emerald-500/20 shadow-md scale-105' : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'}`}>
                      <img src={optimizeCloudinaryUrl(imgUrl, {
                  width: 150
                })} alt="" className="h-full w-full object-cover" width="80" height="56" decoding="async" loading="lazy" />
                    </button>)}
                </div>}

              {/* Key Specs Row */}
              {categoryBadges.length > 0 && <div className="pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {categoryBadges.flatMap((badge, bIdx) => {
                  const labelStr = String(badge.label || '');
                  const parts = labelStr.includes(' • ') ? labelStr.split(' • ').map(p => p.trim()).filter(Boolean) : [labelStr];
                  return parts.map((part, pIdx) => <span key={`${bIdx}-${pIdx}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 text-slate-800 text-xs font-bold border border-slate-200/80 shadow-xs">
                          {pIdx === 0 && badge.icon && <span className="text-sm">{badge.icon}</span>}
                          {part}
                        </span>);
                })}
                  </div>
                </div>}
            </section>

            {/* Aura AI Summary */}
            {listing?.id && <AuraSummary type="listing" id={listing.id} />}

            {/* Product Info & Specifications */}
            <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-md shadow-slate-200/50 border border-slate-200/90 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 mb-3 tracking-tight">{t("about_this_item")}</h2>
                <div className={`text-sm leading-relaxed text-slate-600 whitespace-pre-wrap relative font-medium ${!isDescriptionExpanded && shouldClampDescription ? 'max-h-[160px] overflow-hidden' : ''}`}>
                  {listing.description || 'No description has been added for this listing.'}
                  {!isDescriptionExpanded && shouldClampDescription && <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none opacity-95" />}
                </div>
                {shouldClampDescription && <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="mt-3 inline-flex items-center gap-1.5 text-emerald-600 font-extrabold text-xs hover:text-emerald-700 transition-colors group">
                    {isDescriptionExpanded ? <><ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />{t("show_less")}</> : <><ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />{t("read_more")}</>}
                  </button>}
              </div>

              {/* Specifications */}
              {DetailsComponent && <div className="pt-5 border-t border-slate-100">
                  <DetailsComponent listing={listing} flat={true} />
                </div>}
            </section>

            {/* Safe Meetup */}
            <SafeMeetupPanel listing={listing} />

            {/* Reviews */}
            {hasReviews && <ListingReviewsSection listing={listing} />}
          </div>

          {/* ── Right Column (Sticky Sidebar & Buy Box) ───────────── */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-[72px] space-y-5">

              {/* Buy Box Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl shadow-slate-200/60 space-y-5">
                {/* Price block */}
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">{t("price")}</p>
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight leading-none font-mono ${hasCampaign ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {formatCurrency(displayPrice, listing.currency)}
                    </span>
                    {hasCampaign && (
                      <div className="flex items-center gap-2">
                        <span className="text-base text-slate-400 line-through font-bold tabular-nums font-mono">
                          {formatCurrency(listing.price, listing.currency)}
                        </span>
                        {discount && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                            −{discount}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stock & Reservation Alerts */}
                  {(hasStockInfo || activeReservations > 0) && (
                    <div className="flex flex-wrap items-center gap-2 mt-3.5">
                      {hasStockInfo && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${isLowStock ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                          {isLowStock && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                          <Package className="w-3.5 h-3.5" />
                          {isLowStock ? `Only ${Number(listing.quantity)} left` : `${Number(listing.quantity)} in stock`}
                        </span>
                      )}
                      {activeReservations > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          {activeReservations} {activeReservations === 1 ? 'person' : 'people'} {t("looking")}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary & Secondary Action CTAs */}
                {(canAddToCart || canMakeOffer) && (
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    {canAddToCart && (
                      <button
                        onClick={() => itemIsInCart ? navigate(ROUTES.SHOPPING_CART) : addToCart(listing.id)}
                        disabled={isAddingToCart}
                        className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
                          itemIsInCart
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 shadow-emerald-500/10'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25'
                        }`}
                      >
                        {isAddingToCart ? (
                          <>
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            {t("adding_to_cart", "Adding to Cart...")}
                          </>
                        ) : itemIsInCart ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            {t("in_cart", "In Cart")}
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            {t("add_to_cart", "Add to Cart")}
                          </>
                        )}
                      </button>
                    )}
                    {canMakeOffer && (
                      <button onClick={() => setIsOfferModalOpen(true)} className="w-full flex items-center justify-center gap-2.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-2xl text-sm font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                        <HandCoins className="w-4 h-4 text-slate-600" />
                        {t("make_an_offer")}
                      </button>
                    )}
                  </div>
                )}

                {/* Trust Guarantees */}
                <div className="bg-slate-50/80 rounded-2xl p-3.5 flex items-center justify-around gap-2 text-xs font-bold text-slate-600 border border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    {t("buyer_protection")}
                  </div>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    {t("secure_escrow")}
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md shadow-slate-200/50">
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">{t("seller_information")}</h3>
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
      </PageContainer>

      {/* ▸ Mobile Bottom Bar */}
      {(canAddToCart || canMakeOffer || !isOwner) && <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-safe shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            {/* Price */}
            <div className="flex-1 min-w-0">
              <p className={`text-lg font-bold tabular-nums tracking-tight leading-none mb-0.5 font-mono ${hasCampaign ? 'text-emerald-600' : 'text-slate-900'}`}>
                {formatCurrency(displayPrice, listing.currency)}
              </p>
              {hasCampaign ? <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400 line-through font-medium tabular-nums font-mono">{formatCurrency(listing.price, listing.currency)}</p>
                  {discount && <span className="text-xs font-bold text-emerald-600 font-mono">−{discount}%</span>}
                </div> : <p className="text-xs text-slate-500 font-semibold truncate">{locationLabel}</p>}
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              {!isOwner && <ContactSellerButton listing={listing} className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors" />}
              {canMakeOffer && (
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  {t('make_offer')}
                </button>
              )}
              {canAddToCart && (
                <button
                  onClick={() => itemIsInCart ? navigate(ROUTES.SHOPPING_CART) : addToCart(listing.id)}
                  disabled={isAddingToCart}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 transition-all ${
                    itemIsInCart
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  {isAddingToCart ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : itemIsInCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t("in_cart", "In Cart")}
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      {t("cart", "Cart")}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>}
    </div>;
};
export default ListingDetailPage;