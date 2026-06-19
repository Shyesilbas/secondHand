import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
  AlertTriangle, ArrowLeft, Calendar, ChevronLeft, ChevronRight,
  Eye, HandCoins, MapPin, Share2, ShoppingBag, Sparkles, Tag,
  ChevronDown, ChevronUp, Flame, Package, Clock, Shield
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
  return Math.round(((o - s) / o) * 100);
};

/* ── Sub-components ──────────────────────────────────────── */

/** Premium skeleton loader */
const DetailSkeleton = () => (
  <div className="min-h-screen bg-[#f7f8fa]">
    <div className="h-14 bg-white/80 border-b border-slate-200/50" />
    <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 pt-5">
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-4 animate-pulse">
            <div className="h-5 w-20 bg-slate-200 rounded-full mb-3" />
            <div className="h-7 w-3/4 bg-slate-200 rounded-xl mb-2" />
            <div className="h-3.5 w-1/2 bg-slate-100 rounded-lg" />
          </div>
          <div className="aspect-[3/2] bg-slate-200 rounded-2xl animate-pulse" />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white rounded-2xl p-5 animate-pulse space-y-4">
            <div className="h-4 w-14 bg-slate-200 rounded-full" />
            <div className="h-9 w-36 bg-slate-200 rounded-xl" />
            <div className="h-11 w-full bg-slate-200 rounded-xl" />
            <div className="h-11 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/** Error state */
const DetailError = ({ error }) => (
  <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-4">
    <div className="text-center max-w-sm rounded-[24px] border border-slate-200/80 bg-white p-10 shadow-lg listing-fade-in">
      <div className="w-16 h-16 bg-gradient-to-br from-rose-50 to-rose-100 rounded-[18px] flex items-center justify-center mx-auto mb-6 shadow-sm">
        <AlertTriangle className="w-7 h-7 text-rose-500" />
      </div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">Listing Unavailable</h3>
      <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">{error || 'This listing could not be found or may have been removed.'}</p>
      <Link
        to={ROUTES.LISTINGS}
        className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-sm listing-cta-primary text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Listings
      </Link>
    </div>
  </div>
);

/* ── Main Page ───────────────────────────────────────────── */

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthState();
  const { listing, isLoading, error, refetch: fetchListing } = useListingData(id);
  const { addToCart, isAddingToCart } = useCart({ loadCartItems: false });
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const viewTrackedRef = useRef(false);
  const galleryRef = useRef(null);
  const { count: activeReservations } = useActiveReservationCount(listing?.id);

  const images = listing?.imageUrls?.length > 0
    ? listing.imageUrls
    : (listing?.imageUrl ? [listing.imageUrl] : []);

  const isOwner = isAuthenticated && user?.id === listing?.sellerId;
  const hasCampaign = listing?.campaignId && listing?.campaignPrice != null && parseFloat(listing?.campaignPrice) < parseFloat(listing?.price);
  const displayPrice = hasCampaign ? listing?.campaignPrice : listing?.price;
  const discount = hasCampaign ? discountPercent(listing?.price, listing?.campaignPrice) : null;

  /* Reset image on listing change */
  useEffect(() => { setSelectedImageIndex(0); }, [listing?.id]);

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
      await navigator.share({ title: listing?.title || 'SecondHand listing', url });
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
    const handler = (e) => {
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
  const categoryBadges = listing ? (listingTypeRegistry[listing.type]?.compactBadges?.(listing) || []) : [];
  const selectedImage = images[selectedImageIndex];
  const shouldClampDescription = listing?.description?.length > 420;
  const locationLabel = listing ? ([listing.district, listing.city].filter(Boolean).join(', ') || 'Location not specified') : '';

  /* ── Render ──────────────────────────────────────────── */

  if (isLoading) return <DetailSkeleton />;
  if (error) return <DetailError error={error} />;
  if (!listing) return null;

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-28 lg:pb-16 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">

      {/* ▸ Sticky Navigation Header */}
      <header className="sticky top-0 z-40 listing-glass border-b border-slate-200/50" style={{fontSize:'13px'}}>
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 h-[52px] flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[13px] font-semibold min-w-0">
            <Link
              to={ROUTES.LISTINGS}
              className="text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Explore</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden sm:block" />
            <span className="text-slate-400 hidden sm:inline shrink-0">{listing.type}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden md:block" />
            <span className="text-slate-700 truncate hidden md:inline max-w-[200px]">{listing.title}</span>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => navigate(ROUTES.AURA_CHAT, { state: { listing } })}
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-xl font-semibold transition-all group"
              title="Ask Aura AI"
            >
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-[13px]">Ask Aura</span>
            </button>
            {!isOwner && <CompareButton listing={listing} size="md" className="hidden sm:flex" />}
            {!isOwner && (
              <FavoriteButton
                listingId={listing.id}
                listing={listing}
                size="md"
                showCount={false}
                className="p-2 border border-transparent text-slate-400 hover:text-rose-500 rounded-xl transition-all hover:bg-rose-50/80"
              />
            )}
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all hover:bg-slate-100/80"
              aria-label="Share listing"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {isOwner && <ListingCardActions listing={listing} onChanged={fetchListing} />}
          </div>
        </div>
      </header>

      {/* Offer Modal */}
      <MakeOfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} listing={listing} />

      {/* ▸ Main Content */}
      <main className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid lg:grid-cols-12 gap-5 lg:gap-7">

          {/* ── Left Column ─────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 listing-stagger space-y-4">

            {/* Title Block */}
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80">
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                  {listing.type}
                </span>
                {hasCampaign && (
                  <span className="listing-discount-badge inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                    <Tag className="w-3 h-3" />
                    {listing.campaignName || 'Sale'}
                    {discount && <span className="ml-0.5">−{discount}%</span>}
                  </span>
                )}
                {listing.status !== LISTING_STATUS.ACTIVE && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {listing.status}
                  </span>
                )}
              </div>

              <h1 className="text-[20px] sm:text-[22px] lg:text-[26px] font-extrabold text-slate-950 tracking-tight leading-[1.15] mb-3">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {locationLabel}
                </div>
                <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDateTime(listing.createdAt)}
                </div>
                <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {listing.viewCount || 0} views
                </div>
              </div>
            </section>

            {/* Image Gallery */}
            <section
              ref={galleryRef}
              className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80 overflow-hidden"
            >
              <div className="w-full aspect-[3/2] sm:aspect-[16/10] lg:max-h-[400px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden relative group cursor-pointer">
                {selectedImage ? (
                  <img
                    key={selectedImage}
                    src={optimizeCloudinaryUrl(selectedImage, { width: 1200 })}
                    alt={`${listing.title} - Image ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover listing-image-enter listing-img-zoom"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="w-14 h-14 bg-white/80 rounded-xl flex items-center justify-center mb-3 shadow-sm border border-slate-100">
                      <Package className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">No image available</p>
                  </div>
                )}

                {/* Gallery nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={showPreviousImage}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/95 text-slate-700 shadow-md flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={showNextImage}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/95 text-slate-700 shadow-md flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* Image counter badge */}
                    <div className="absolute bottom-2.5 right-2.5 listing-glass rounded-full px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-md">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 px-0.5 scrollbar-thin">
                  {images.slice(0, 10).map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-[48px] w-[60px] shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                        selectedImageIndex === idx
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 listing-thumb-active shadow-sm'
                          : 'border-slate-200/80 opacity-60 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={optimizeCloudinaryUrl(imgUrl, { width: 180 })}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Key Specs Strip */}
            {categoryBadges.length > 0 && (
              <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">Key Specs</h3>
                <div className="flex flex-wrap gap-2">
                  {categoryBadges.flatMap((badge, bIdx) => {
                    const parts = badge.label?.includes(' • ')
                      ? badge.label.split(' • ').map(p => p.trim()).filter(Boolean)
                      : [badge.label];
                    return parts.map((part, pIdx) => (
                      <span
                        key={`${bIdx}-${pIdx}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-[12px] font-semibold border border-slate-100/80 transition-all hover:bg-slate-100/80 hover:border-slate-200"
                      >
                        {pIdx === 0 && badge.icon && <span className="text-sm">{badge.icon}</span>}
                        {part}
                      </span>
                    ));
                  })}
                </div>
              </section>
            )}

            {/* Aura AI Summary */}
            {listing?.id && <AuraSummary type="listing" id={listing.id} />}

            {/* Description */}
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-950 mb-3 tracking-tight">About this item</h2>
              <div className={`text-[13px] leading-6 text-slate-600 whitespace-pre-wrap relative font-medium ${!isDescriptionExpanded && shouldClampDescription ? 'max-h-[180px] overflow-hidden' : ''}`}>
                {listing.description || 'No description has been added for this listing.'}
                {!isDescriptionExpanded && shouldClampDescription && (
                  <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
                )}
              </div>
              {shouldClampDescription && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-3 inline-flex items-center gap-1.5 text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors group"
                >
                  {isDescriptionExpanded ? (
                    <><ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Show less</>
                  ) : (
                    <><ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" /> Read more</>
                  )}
                </button>
              )}
            </section>

            {/* Specifications */}
            {DetailsComponent && (
              <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-950 mb-4 tracking-tight">Specifications</h2>
                <div className="bg-gradient-to-br from-slate-50/80 to-slate-50 rounded-xl p-4 sm:p-5 border border-slate-100/60">
                  <DetailsComponent listing={listing} />
                </div>
              </section>
            )}

            {/* Safe Meetup */}
            <SafeMeetupPanel />

            {/* Reviews */}
            {hasReviews && (
              <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-950 mb-4 tracking-tight">Reviews</h2>
                <ListingReviewsSection listing={listing} />
              </section>
            )}
          </div>

          {/* ── Right Column (Sticky Sidebar) ───────────── */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-[66px] space-y-4 listing-float-in">

              {/* Pricing Card */}
              <div className="listing-glass-elevated rounded-2xl p-5 sm:p-5">

                {/* Price */}
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">Price</p>
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className={`text-[26px] sm:text-[30px] font-extrabold tabular-nums tracking-tight leading-none ${hasCampaign ? 'listing-price-gradient' : 'text-slate-950'}`}>
                      {formatCurrency(displayPrice, listing.currency)}
                    </span>
                    {hasCampaign && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400 line-through font-semibold tabular-nums">
                          {formatCurrency(listing.price, listing.currency)}
                        </span>
                        {discount && (
                          <span className="listing-discount-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-100">
                            −{discount}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stock & Reservation Info */}
                  {(hasStockInfo || activeReservations > 0) && (
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {hasStockInfo && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          isLowStock
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                            : 'bg-slate-50 text-slate-600 border border-slate-200/80'
                        }`}>
                          {isLowStock && <span className="w-2 h-2 rounded-full bg-amber-500 listing-stock-pulse" />}
                          <Package className="w-3 h-3" />
                          {isLowStock ? `Only ${Number(listing.quantity)} left` : `${Number(listing.quantity)} in stock`}
                        </span>
                      )}
                      {activeReservations > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100">
                          <Flame className="w-3 h-3" />
                          {activeReservations} {activeReservations === 1 ? 'person' : 'people'} looking
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                {(canAddToCart || canMakeOffer) && (
                  <div className="space-y-2.5 mb-5">
                    {canAddToCart && (
                      <button
                        onClick={() => addToCart(listing.id)}
                        disabled={isAddingToCart}
                        className="listing-cta-primary w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[13px] font-bold disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {isAddingToCart ? 'Adding to Cart…' : 'Add to Cart'}
                      </button>
                    )}
                    {canMakeOffer && (
                      <button
                        onClick={() => setIsOfferModalOpen(true)}
                        className="listing-cta-secondary w-full flex items-center justify-center gap-2 py-3 border-2 border-slate-200 text-slate-800 rounded-xl text-[13px] font-bold"
                      >
                        <HandCoins className="w-4 h-4" />
                        Make an Offer
                      </button>
                    )}
                  </div>
                )}

                {/* Trust Guarantees */}
                <div className="flex items-center gap-3 py-3 border-t border-slate-100/60">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    Buyer Protection
                  </div>
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Secure Escrow
                  </div>
                </div>

                {/* Seller Trust Panel */}
                <ListingTrustPanel
                  listing={listing}
                  isOwner={isOwner}
                  onShowcaseSuccess={fetchListing}
                />

                {/* Analytics Panel */}
                <ListingAnalyticsPanel
                  listing={listing}
                  isOwner={isOwner}
                  displayPrice={displayPrice}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        <div className="mt-10 sm:mt-14 listing-fade-in" style={{ animationDelay: '0.3s' }}>
          <SimilarListings currentListing={listing} />
        </div>
      </main>

      {/* ▸ Mobile Bottom Bar */}
      {(canAddToCart || canMakeOffer || !isOwner) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 listing-mobile-bar border-t border-slate-200/50 px-4 py-3 pb-safe">
          <div className="flex items-center justify-between gap-3">
            {/* Price */}
            <div className="flex-1 min-w-0">
              <p className={`text-lg font-extrabold tabular-nums tracking-tight leading-none mb-0.5 ${hasCampaign ? 'listing-price-gradient' : 'text-slate-900'}`}>
                {formatCurrency(displayPrice, listing.currency)}
              </p>
              {hasCampaign ? (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400 line-through font-medium tabular-nums">{formatCurrency(listing.price, listing.currency)}</p>
                  {discount && <span className="text-[10px] font-extrabold text-emerald-600">−{discount}%</span>}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-semibold truncate">{locationLabel}</p>
              )}
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {!isOwner && (
                <ContactSellerButton
                  listing={listing}
                  className="py-3 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                />
              )}
              {canAddToCart && (
                <button
                  onClick={() => addToCart(listing.id)}
                  disabled={isAddingToCart}
                  className="listing-cta-primary flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-bold disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Cart
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
