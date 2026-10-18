import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Eye,
  Flame,
  Heart,
  MapPin,
  Package,
  Share2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import Button, { buttonClasses } from '../../common/components/ui/Button.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
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

const CARD = 'rounded border border-border bg-background-primary';

const DetailSkeleton = () => (
  <div className="min-h-screen bg-background-secondary pb-24">
    <div className="h-14 border-b border-border bg-background-primary" />
    <PageContainer className="pt-6 sm:pt-8">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 xl:gap-12">
        <div className="space-y-6 lg:col-span-7">
          <Skeleton className="aspect-4/3 w-full sm:aspect-16/11" />
          <div className="flex gap-3">
            {['a', 'b', 'c', 'd'].map(k => <Skeleton key={k} className="h-16 w-20 shrink-0" />)}
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </PageContainer>
  </div>
);

const DetailError = ({ error }) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-secondary p-4">
      <div className={`${CARD} w-full max-w-md p-8 text-center`}>
        <AlertTriangle className="mx-auto mb-4 h-5 w-5 text-status-error" strokeWidth={1.5} aria-hidden />
        <h1 className="mb-2 text-lg font-semibold text-text-primary">
          {t("listing_unavailable", "İlan Bulunamadı")}
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          {error || t("listing_unavailable_desc", "Bu ilan yayından kaldırılmış, satılmış veya silinmiş olabilir.")}
        </p>
        <Link to={ROUTES.LISTINGS} className={`${buttonClasses()} w-full`}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          <span>{t("back_to_listings", "İlanlara Dön")}</span>
        </Link>
      </div>
    </div>
  );
};

const SectionCard = ({ title, children }) => (
  <section className={`${CARD} p-5`}>
    <h2 className="mb-4 border-b border-border-light pb-3 text-lg font-semibold text-text-primary">{title}</h2>
    {children}
  </section>
);

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
        text: `Şu an ${cartReservations} kişinin sepetinde`,
        subtext: 'Satın alma adımı başlatıldı',
        badge: 'Yüksek talep'
      });
    }
    if (activeViewers > 0) {
      const isSuperHot = activeViewers >= 10;
      list.push({
        id: 'viewers',
        text: `Son 24 saatte ${activeViewers} kişi inceledi`,
        subtext: isSuperHot ? 'Yoğun ilgi görüyor' : 'Popüler ilan',
        badge: isSuperHot ? 'Yoğun ilgi' : 'Popüler'
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

  const stockCount = Number(listing.quantity);
  const stock = stockCount === 0
    ? { dot: 'bg-secondary-400', label: 'Tükendi' }
    : isLowStock
    ? { dot: 'bg-status-error', label: `Son ${stockCount} adet` }
    : { dot: 'bg-status-success', label: `Stokta (${stockCount} adet)` };
  const cartLabel = isAddingToCart
    ? t("adding_to_cart", "Ekleniyor...")
    : itemIsInCart ? t("in_cart", "Sepette (Sepete Git)") : t("add_to_cart", "Sepete Ekle");
  const handleCartClick = () => (itemIsInCart ? navigate(ROUTES.SHOPPING_CART) : addToCart(listing.id));
  const openAura = () => navigate(ROUTES.AURA_CHAT, { state: { listing } });

  return (
    <div className="min-h-screen bg-background-secondary pb-28 text-text-primary">
      <header className="sticky top-0 z-40 border-b border-border bg-background-primary">
        <PageContainer className="flex h-14 items-center justify-between gap-4">
          <nav className="flex min-w-0 items-center gap-2 text-sm text-text-tertiary" aria-label="Breadcrumb">
            <Link to={ROUTES.LISTINGS} className="flex shrink-0 items-center gap-1.5 rounded px-2 py-1 transition-colors hover:bg-background-secondary hover:text-text-primary">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>{t("all_listings", "İlanlar")}</span>
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
            <span className="shrink-0 text-text-secondary">{listing.type}</span>
            <ChevronRight className="hidden h-4 w-4 shrink-0 text-text-muted md:block" strokeWidth={1.5} aria-hidden />
            <span className="hidden max-w-xs truncate text-text-primary md:inline">{listing.title}</span>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={openAura} title={t("ask_aura_tip", "Bu ilan hakkında Aura AI ile konuş")}>
              <Sparkles className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>{t("ask_aura", "Aura AI")}</span>
            </Button>
            {!isOwner && <CompareButton listing={listing} size="md" className="hidden sm:flex" />}
            {!isOwner && (
              <FavoriteButton
                listingId={listing.id}
                listing={listing}
                size="md"
                showCount={false}
                className="rounded border border-border bg-background-primary p-2 text-text-secondary transition-colors hover:bg-background-secondary hover:text-status-error-text"
              />
            )}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded border border-border bg-background-primary p-2 text-sm text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary"
              aria-label={t("share", "Paylaş")}
              title={copiedLink ? t("link_copied", "Bağlantı kopyalandı") : t("share", "Paylaş")}
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4 text-status-success" strokeWidth={1.5} aria-hidden />
                  <span className="hidden sm:inline">{t("copied", "Kopyalandı")}</span>
                </>
              ) : (
                <Share2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              )}
            </button>
            {isOwner && <ListingCardActions listing={listing} onChanged={fetchListing} />}
          </div>
        </PageContainer>
      </header>

      <MakeOfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} listing={listing} />

      <PageContainer className="pt-6 sm:pt-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 xl:gap-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="space-y-3">
              <div ref={galleryRef} className={`${CARD} group relative flex aspect-4/3 w-full items-center justify-center overflow-hidden sm:aspect-16/11`}>
                {selectedImage && !imageError ? (
                  <img
                    key={selectedImage}
                    src={optimizeCloudinaryUrl(selectedImage, { width: 1400 })}
                    onError={() => setImageError(true)}
                    alt={`${listing.title} - ${selectedImageIndex + 1}`}
                    className="h-full w-full object-contain p-4 sm:p-6"
                    fetchpriority="high"
                    decoding="async"
                    loading="eager"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                    <Package className="mb-3 h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
                    <p className="text-sm font-medium text-text-secondary">{t("no_image_available", "Fotoğraf bulunmuyor")}</p>
                    <p className="mt-1 text-sm text-text-tertiary">{t("seller_no_upload", "Satıcı bu ilan için görsel eklemedi.")}</p>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4 absolute left-4 top-1/2 w-11"
                      aria-label={t("previous", "Önceki")}
                    >
                      <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={showNextImage}
                      className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4 absolute right-4 top-1/2 w-11"
                      aria-label={t("next", "Sonraki")}
                    >
                      <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                    <div className="absolute bottom-4 right-4 rounded-sm bg-primary/80 px-2 py-1 text-xs font-medium tabular-nums text-white">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {images.map((imgUrl, idx) => (
                    <button
                      type="button"
                      key={`${imgUrl}-${idx}`}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-16 w-20 shrink-0 overflow-hidden rounded border bg-background-primary transition-colors duration-150 ${selectedImageIndex === idx ? 'border-primary' : 'border-border opacity-60 hover:opacity-100'}`}
                      aria-label={`Görsel ${idx + 1}`}
                      aria-current={selectedImageIndex === idx ? 'true' : undefined}
                    >
                      <img src={optimizeCloudinaryUrl(imgUrl, { width: 180 })} alt="" className="h-full w-full object-contain p-1" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <section className={`${CARD} p-5`}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Aura AI İlan Analizi</h2>
                  <p className="mt-1 text-sm text-text-secondary">Yapay zeka destekli piyasa ve satıcı değerlendirmesi</p>
                </div>
                <Button variant="secondary" size="sm" className="shrink-0" onClick={openAura}>Soru Sor</Button>
              </div>
              <div className="rounded border border-border-light bg-background-secondary p-4 text-sm leading-relaxed text-text-secondary">
                <AuraSummary type="listing" id={listing?.id} listing={listing} />
              </div>
            </section>

            <SectionCard title={t("about_this_item", "Ürün Açıklaması")}>
              <div className={`whitespace-pre-wrap text-sm leading-relaxed text-text-secondary ${!isDescriptionExpanded && shouldClampDescription ? 'relative max-h-40 overflow-hidden' : ''}`}>
                {listing.description || t("no_description_provided", "Bu ilan için detaylı açıklama girilmemiş.")}
                {!isDescriptionExpanded && shouldClampDescription && (
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-background-primary/90" />
                )}
              </div>
              {shouldClampDescription && (
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  aria-expanded={isDescriptionExpanded}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-text-primary hover:underline"
                >
                  {isDescriptionExpanded ? <ChevronUp className="h-4 w-4" strokeWidth={1.5} aria-hidden /> : <ChevronDown className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
                  <span>{isDescriptionExpanded ? t("show_less", "Daha Az Göster") : t("read_more", "Devamını Oku")}</span>
                </button>
              )}
            </SectionCard>

            {DetailsComponent && (
              <SectionCard title={t("specifications", "Teknik Özellikler & Detaylar")}>
                <DetailsComponent listing={listing} flat={true} />
              </SectionCard>
            )}

            <SafeMeetupPanel listing={listing} />

            {hasReviews && (
              <SectionCard title={t("reviews", "Kullanıcı Değerlendirmeleri")}>
                <ListingReviewsSection listing={listing} />
              </SectionCard>
            )}
          </div>

          <div className="space-y-6 lg:sticky lg:top-20 lg:col-span-5">
            <div className={`${CARD} space-y-5 p-5`}>
              <div className="space-y-2">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-tertiary">
                  <span>{listing.type}</span>
                  {hasCampaign && (
                    <span className="text-status-warning-text">
                      {listing.campaignName || 'İndirim'}{discount ? ` −%${discount}` : ''}
                    </span>
                  )}
                  {listing.status !== LISTING_STATUS.ACTIVE && <span>{listing.status}</span>}
                </p>

                <h1 className="text-2xl font-semibold leading-snug text-text-primary">{listing.title}</h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-text-tertiary">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
                    {locationLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Calendar className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
                    {formatDateTime(listing.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Heart className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
                    {favoriteCount} {t("favorites", "favori")}
                  </span>
                  {activeViewers > 0 && (
                    <span className="inline-flex items-center gap-1 tabular-nums text-status-warning-text">
                      <Flame className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                      {activeViewers >= 10 ? 'Yoğun ilgi' : 'Popüler'} ({activeViewers} kişi inceliyor)
                    </span>
                  )}
                  {isOwner && (
                    <span className="inline-flex items-center gap-1 tabular-nums" title="Sadece satıcıya özel görüntülenme verisi">
                      <Eye className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
                      {listing.viewCount ?? listing.viewStats?.totalViews ?? 0} {t("views", "görüntülenme")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-start justify-between gap-4 border-y border-border-light py-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-medium text-text-tertiary">
                      {listing.currency === 'TRY' ? '₺' : listing.currency === 'USD' ? '$' : listing.currency === 'EUR' ? '€' : listing.currency}
                    </span>
                    <span className="text-3xl font-semibold tabular-nums text-text-primary">
                      {formatPrice(displayPrice, { decimals: 0 })}
                    </span>
                    {Number(displayPrice) % 1 !== 0 && (
                      <span className="text-base font-medium tabular-nums text-text-tertiary">
                        ,{String(Number(displayPrice).toFixed(2)).split('.')[1]}
                      </span>
                    )}
                  </div>
                  {hasCampaign && (
                    <p className="mt-1 flex items-center gap-2 text-sm tabular-nums">
                      <span className="text-text-muted line-through">{formatCurrency(listing.price, listing.currency)}</span>
                      {discount && <span className="text-status-success-text">−%{discount} İndirim</span>}
                    </p>
                  )}
                </div>
                {hasStockInfo && (
                  <p className="inline-flex items-center gap-1.5 pt-1 text-sm tabular-nums text-text-secondary">
                    <span className={`h-1.5 w-1.5 rounded-full ${stock.dot}`} aria-hidden />
                    {stock.label}
                  </p>
                )}
              </div>

              {currentDetailStory && (
                <div key={currentDetailStory.id} className="flex items-center justify-between gap-3 rounded border border-border-light px-4 py-3" aria-live="polite">
                  <div className="flex min-w-0 items-center gap-3">
                    <Flame className="h-4 w-4 shrink-0 text-status-warning" strokeWidth={1.5} aria-hidden />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary">{currentDetailStory.text}</p>
                      {currentDetailStory.subtext && <p className="text-sm text-text-secondary">{currentDetailStory.subtext}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {currentDetailStory.badge && <span className="text-sm text-status-warning-text">{currentDetailStory.badge}</span>}
                    {detailStoryItems.length > 1 && (
                      <div className="flex gap-1">
                        {detailStoryItems.map(item => (
                          <span
                            key={item.id}
                            className={`h-1.5 w-1.5 rounded-full ${item.id === currentDetailStory.id ? 'bg-status-warning' : 'bg-secondary-200'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isOwner ? (
                <div className="space-y-3 rounded border border-border-light p-4">
                  <h2 className="text-sm font-medium text-text-primary">{t('seller_controls', 'İlan Sahibi Yönetim Paneli')}</h2>
                  <p className="text-sm text-text-secondary">
                    {t('seller_controls_desc', 'Fiyatını kır, stok güncelle, vitrine çıkar veya ilan durumunu değiştir.')}
                  </p>
                  <div className="flex items-center gap-2">
                    <ListingCardActions listing={listing} onChanged={fetchListing} variant="button" />
                  </div>
                </div>
              ) : (canAddToCart || canMakeOffer) ? (
                <div className="space-y-2">
                  {canAddToCart && (
                    <Button className="w-full" onClick={handleCartClick} disabled={isAddingToCart}>
                      {itemIsInCart && !isAddingToCart ? <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden /> : null}
                      <span>{cartLabel}</span>
                    </Button>
                  )}
                  {canMakeOffer && (
                    <Button variant="secondary" className="w-full" onClick={() => setIsOfferModalOpen(true)}>
                      {t("make_an_offer", "Teklif Ver")}
                    </Button>
                  )}
                </div>
              ) : null}

              <p className="flex items-center gap-2 text-sm text-text-secondary">
                <ShieldCheck className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                <span>{t("escrow_guarantee_text", "Escrow Güvenceli Ödeme & Güvenli Teslimat")}</span>
              </p>

              <div className="border-t border-border-light pt-4">
                <ListingTrustPanel listing={listing} isOwner={isOwner} onShowcaseSuccess={fetchListing} flat={true} />
              </div>
            </div>

            <ListingAnalyticsPanel listing={listing} isOwner={isOwner} displayPrice={displayPrice} />
          </div>
        </div>

        <div className="mt-14 space-y-12">
          <SimilarListings currentListing={listing} />
          <RecentlyViewedSection currentListingId={listing?.id} />
        </div>
      </PageContainer>

      {(canAddToCart || canMakeOffer || !isOwner) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background-primary px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold tabular-nums leading-none text-text-primary">
                {formatCurrency(displayPrice, listing.currency)}
              </p>
              {hasCampaign ? (
                <p className="mt-1 flex items-center gap-2 text-sm tabular-nums">
                  <span className="text-text-muted line-through">{formatCurrency(listing.price, listing.currency)}</span>
                  {discount && <span className="text-text-primary">−%{discount}</span>}
                </p>
              ) : (
                <p className="mt-1 truncate text-sm text-text-tertiary">{locationLabel}</p>
              )}
            </div>
            <div className="flex flex-1 items-center justify-end gap-2">
              {!isOwner && (
                <ContactSellerButton listing={listing} className={buttonClasses('secondary')} />
              )}
              {canMakeOffer && (
                <Button variant="secondary" className="flex-1" onClick={() => setIsOfferModalOpen(true)}>
                  {t('make_offer', 'Teklif')}
                </Button>
              )}
              {canAddToCart && (
                <Button className="flex-1" onClick={handleCartClick} disabled={isAddingToCart}>
                  {isAddingToCart ? t("adding_to_cart", "Ekleniyor...") : itemIsInCart ? t("in_cart", "Sepette") : t("cart", "Sepet")}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;