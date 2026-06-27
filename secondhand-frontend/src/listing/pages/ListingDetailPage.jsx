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
    isAddingToCart
  } = useCart({
    loadCartItems: false
  });
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
  return <div className="min-h-screen bg-background-secondary pb-28 lg:pb-16 text-text-primary selection:bg-primary-50 selection:text-primary">

      {/* ▸ Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-background-primary border-b border-border-light text-sm">
        <PageContainer className="max-w-[1220px] h-[52px] flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm font-semibold min-w-0">
            <Link to={ROUTES.LISTINGS} className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5 shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t("explore")}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0 hidden sm:block" />
            <span className="text-text-muted hidden sm:inline shrink-0">{listing.type}</span>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0 hidden md:block" />
            <span className="text-text-primary truncate hidden md:inline max-w-[200px]">{listing.title}</span>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => navigate(ROUTES.AURA_CHAT, {
            state: {
              listing
            }
          })} className="flex items-center gap-2 px-3 py-2 text-text-muted hover:text-primary hover:bg-primary-light rounded-lg font-semibold transition-all group" title={t("ask_aura_ai")}>
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-sm">{t("ask_aura")}</span>
            </button>
            {!isOwner && <CompareButton listing={listing} size="md" className="hidden sm:flex" />}
            {!isOwner && <FavoriteButton listingId={listing.id} listing={listing} size="md" showCount={false} className="p-2 border border-transparent text-text-muted hover:text-status-error-text rounded-lg transition-all hover:bg-status-error-bg" />}
            <button onClick={handleShare} className="p-2 text-text-muted hover:text-text-primary rounded-lg transition-all hover:bg-secondary-light" aria-label={t("share_listing")} title={t("share")}>
              <Share2 className="w-4 h-4" />
            </button>
            {isOwner && <ListingCardActions listing={listing} onChanged={fetchListing} />}
          </div>
        </PageContainer>
      </header>

      {/* Offer Modal */}
      <MakeOfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} listing={listing} />

      {/* ▸ Main Content */}
      <PageContainer className="max-w-[1220px] pt-4 sm:pt-6">
        <div className="grid lg:grid-cols-12 gap-5 lg:gap-7">

          {/* ── Left Column ─────────────────────────────── */}
          <div className="lg:col-span-7 listing-stagger space-y-4">

            {/* Showcase Block (Title + Gallery + Key Specs) */}
            <section className="bg-background-primary rounded-xl p-4 sm:p-5 shadow-sm border border-border-light space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-text-primary px-2.5 py-1 text-caption font-bold text-text-inverse uppercase tracking-wider">
                    {listing.type}
                  </span>
                  {hasCampaign && <span className="listing-discount-badge inline-flex items-center gap-1 rounded-full bg-status-success-bg px-2.5 py-1 text-caption font-bold text-status-success-text uppercase tracking-wider border border-status-success-border">
                      <Tag className="w-3 h-3 text-status-success-icon" />
                      {listing.campaignName || 'Sale'}
                      {discount && <span className="ml-0.5">−{discount}%</span>}
                    </span>}
                  {listing.status !== LISTING_STATUS.ACTIVE && <span className="inline-flex items-center rounded-full bg-secondary-light px-2.5 py-1 text-caption font-bold text-text-muted uppercase tracking-wider border border-border-light">
                      {listing.status}
                    </span>}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight leading-[1.2] mb-2.5">
                  {listing.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-body text-text-muted font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {locationLabel}
                  </div>
                  <span className="hidden sm:block w-1 h-1 rounded-full bg-border-light" />
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateTime(listing.createdAt)}
                  </div>
                  <span className="hidden sm:block w-1 h-1 rounded-full bg-border-light" />
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    {listing.viewCount || 0} {t("views")}</div>
                </div>
              </div>

              {/* Gallery Frame */}
              <div ref={galleryRef} className="w-full aspect-[3/2] sm:aspect-[16/10] lg:max-h-[360px] bg-background-secondary rounded-xl overflow-hidden relative group cursor-pointer border border-border-light">
                {selectedImage && !imageError ? <img key={selectedImage} src={optimizeCloudinaryUrl(selectedImage, {
                width: 1200
              })} onError={() => setImageError(true)} alt={`${listing.title} - Image ${selectedImageIndex + 1}`} className="w-full h-full object-cover listing-image-enter listing-img-zoom" fetchpriority="high" decoding="async" loading="eager" /> : <div className="flex flex-col items-center justify-center h-full text-text-muted">
                    <div className="w-12 h-12 bg-background-primary rounded-lg flex items-center justify-center mb-3 border border-border-light">
                      <Package className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold">{t("no_image_available")}</p>
                  </div>}

                {/* Gallery nav arrows */}
                {images.length > 1 && <>
                    <button onClick={showPreviousImage} className="absolute left-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background-primary text-text-primary shadow-md flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 border border-border-light" aria-label={t("previous_image")}>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={showNextImage} className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background-primary text-text-primary shadow-md flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 border border-border-light" aria-label={t("next_image")}>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    {/* Image counter badge */}
                    <div className="absolute bottom-2.5 right-2.5 bg-background-primary border border-border-light rounded-full px-2 py-0.5 text-caption font-bold text-text-primary shadow-sm">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </>}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1 px-0.5 scrollbar-thin">
                  {images.slice(0, 10).map((imgUrl, idx) => <button key={`${imgUrl}-${idx}`} onClick={() => setSelectedImageIndex(idx)} className={`h-11 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${selectedImageIndex === idx ? 'border-primary ring-2 ring-primary/20 shadow-sm' : 'border-border-light/85 opacity-65 hover:opacity-100 hover:border-border-DEFAULT'}`}>
                      <img src={optimizeCloudinaryUrl(imgUrl, {
                  width: 120
                })} alt="" className="h-full w-full object-cover" width="56" height="44" decoding="async" loading="lazy" />
                    </button>)}
                </div>}

              {/* Key Specs Row */}
              {categoryBadges.length > 0 && <div className="pt-3 border-t border-border-light">
                  <div className="flex flex-wrap gap-1.5">
                    {categoryBadges.flatMap((badge, bIdx) => {
                  const labelStr = String(badge.label || '');
                  const parts = labelStr.includes(' • ') ? labelStr.split(' • ').map(p => p.trim()).filter(Boolean) : [labelStr];
                  return parts.map((part, pIdx) => <span key={`${bIdx}-${pIdx}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background-secondary text-text-primary text-body font-semibold border border-border-light">
                          {pIdx === 0 && badge.icon && <span className="text-xs">{badge.icon}</span>}
                          {part}
                        </span>);
                })}
                  </div>
                </div>}
            </section>

            {/* Aura AI Summary */}
            {listing?.id && <AuraSummary type="listing" id={listing.id} />}

            {/* Unified Product Info & Specifications */}
            <section className="bg-background-primary rounded-xl p-4 sm:p-5 shadow-sm border border-border-light space-y-5">
              {/* Description */}
              <div>
                <h2 className="text-base font-bold text-text-primary mb-2.5 tracking-tight">{t("about_this_item")}</h2>
                <div className={`text-sm leading-relaxed text-text-secondary whitespace-pre-wrap relative font-medium ${!isDescriptionExpanded && shouldClampDescription ? 'max-h-[140px] overflow-hidden' : ''}`}>
                  {listing.description || 'No description has been added for this listing.'}
                  {!isDescriptionExpanded && shouldClampDescription && <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-background-primary to-transparent pointer-events-none opacity-95" />}
                </div>
                {shouldClampDescription && <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="mt-2 inline-flex items-center gap-1.5 text-primary font-bold text-xs hover:text-primary transition-colors group">
                    {isDescriptionExpanded ? <><ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />{t("show_less")}</> : <><ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />{t("read_more")}</>}
                  </button>}
              </div>

              {/* Specifications */}
              {DetailsComponent && <div className="pt-4 border-t border-border-light">
                  <DetailsComponent listing={listing} flat={true} />
                </div>}
            </section>

            {/* Safe Meetup */}
            <SafeMeetupPanel />

            {/* Reviews */}
            {hasReviews && <ListingReviewsSection listing={listing} />}
          </div>

          {/* ── Right Column (Sticky Sidebar) ───────────── */}
          <div className="lg:col-span-5">
            <div className="sticky top-[66px] space-y-4 listing-float-in">

              {/* Card 1: Pricing & CTAs + Trust Guarantees */}
              <div className="bg-background-primary border border-border-light rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
                {/* Price block */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">{t("price")}</p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className={`text-3xl font-extrabold tabular-nums tracking-tight leading-none ${hasCampaign ? 'text-primary' : 'text-text-primary'}`}>
                      {formatCurrency(displayPrice, listing.currency)}
                    </span>
                    {hasCampaign && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-muted line-through font-semibold tabular-nums">
                          {formatCurrency(listing.price, listing.currency)}
                        </span>
                        {discount && (
                          <span className="listing-discount-badge inline-flex items-center gap-1 px-2 py-0.5 rounded bg-status-success-bg text-status-success-text text-[11px] font-extrabold border border-status-success-border">
                            −{discount}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stock & Reservation Info */}
                  {(hasStockInfo || activeReservations > 0) && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      {hasStockInfo && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${isLowStock ? 'bg-status-error-bg text-status-error-text border border-status-error-border' : 'bg-background-secondary text-text-secondary border border-border-light'}`}>
                          {isLowStock && <span className="w-1.5 h-1.5 rounded-full bg-status-error listing-stock-pulse" />}
                          <Package className="w-3.5 h-3.5" />
                          {isLowStock ? `Only ${Number(listing.quantity)} left` : `${Number(listing.quantity)} in stock`}
                        </span>
                      )}
                      {activeReservations > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-status-error-bg text-status-error-text text-xs font-bold border border-status-error-border">
                          <Flame className="w-3.5 h-3.5 text-status-error-icon" />
                          {activeReservations} {activeReservations === 1 ? 'person' : 'people'} {t("looking")}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                {(canAddToCart || canMakeOffer) && (
                  <div className="space-y-2 pt-2 border-t border-border-light/60">
                    {canAddToCart && (
                      <button onClick={() => addToCart(listing.id)} disabled={isAddingToCart} className="listing-cta-primary w-full flex items-center justify-center gap-2.5 py-2.5 bg-primary text-white hover:bg-primary-hover rounded-lg text-sm font-bold shadow-sm transition-all active:scale-[0.98]">
                        <ShoppingBag className="w-4 h-4" />
                        {isAddingToCart ? 'Adding to Cart…' : 'Add to Cart'}
                      </button>
                    )}
                    {canMakeOffer && (
                      <button onClick={() => setIsOfferModalOpen(true)} className="listing-cta-secondary w-full flex items-center justify-center gap-2.5 py-2.5 bg-secondary-light text-primary hover:bg-button-secondary-hover border border-border-light rounded-lg text-sm font-bold transition-all active:scale-[0.98]">
                        <HandCoins className="w-4 h-4" />
                        {t("make_an_offer")}
                      </button>
                    )}
                  </div>
                )}

                {/* Trust Guarantees */}
                <div className="bg-background-secondary rounded-lg p-3 flex items-center justify-around gap-2 text-[11px] font-bold text-text-muted border border-border-light/50">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-status-success" />
                    {t("buyer_protection")}
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-border-light" />
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {t("secure_escrow")}
                  </div>
                </div>
              </div>

              {/* Card 2: Seller Information */}
              <div className="bg-background-primary border border-border-light rounded-xl p-4 sm:p-5 shadow-sm">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3.5">{t("seller_information")}</h3>
                <ListingTrustPanel listing={listing} isOwner={isOwner} onShowcaseSuccess={fetchListing} flat={true} />
              </div>

              {/* Card 3: Market Insights */}
              <ListingAnalyticsPanel listing={listing} isOwner={isOwner} displayPrice={displayPrice} />
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        <div className="mt-6 listing-fade-in" style={{
        animationDelay: '0.3s'
      }}>
          <SimilarListings currentListing={listing} />
        </div>
      </PageContainer>

      {/* ▸ Mobile Bottom Bar */}
      {(canAddToCart || canMakeOffer || !isOwner) && <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-primary border-t border-border-light px-4 py-3 pb-safe">
          <div className="flex items-center justify-between gap-3">
            {/* Price */}
            <div className="flex-1 min-w-0">
              <p className={`text-lg font-bold tabular-nums tracking-tight leading-none mb-0.5 ${hasCampaign ? 'text-primary' : 'text-text-primary'}`}>
                {formatCurrency(displayPrice, listing.currency)}
              </p>
              {hasCampaign ? <div className="flex items-center gap-2">
                  <p className="text-xs text-text-muted line-through font-medium tabular-nums">{formatCurrency(listing.price, listing.currency)}</p>
                  {discount && <span className="text-caption font-bold text-status-success">−{discount}%</span>}
                </div> : <p className="text-xs text-text-muted font-semibold truncate">{locationLabel}</p>}
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              {!isOwner && <ContactSellerButton listing={listing} className="py-2.5 px-3 rounded-lg border border-border-light bg-background-primary text-text-primary hover:text-text-primary hover:bg-background-secondary transition-colors" />}
              {canMakeOffer && (
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="flex-1 py-2.5 rounded-lg border border-border-light bg-secondary-light text-primary text-sm font-medium hover:bg-button-secondary-hover transition-colors"
                >
                  {t('make_offer')}
                </button>
              )}
              {canAddToCart && <button onClick={() => addToCart(listing.id)} disabled={isAddingToCart} className="listing-cta-primary flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white hover:bg-primary-hover rounded-lg text-sm font-bold disabled:opacity-50">
                  <ShoppingBag className="w-4 h-4" />{t("cart")}</button>}
            </div>
          </div>
        </div>}
    </div>;
};
export default ListingDetailPage;