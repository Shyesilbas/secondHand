import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useListingData } from '../hooks/useListingData.js';
import { getListingTypeOptions, listingTypeRegistry } from '../config/listingConfig.js';
import { LISTING_STATUS, NON_PURCHASABLE_TYPES } from '../types/index.js';
import { ROUTES } from '../../common/constants/routes.js';
import { listingStatusLabel } from '../../ai/utils/auraListingContext.js';
import { trackView } from '../services/listingAddonService.js';
import { getOrCreateSessionId } from '../../common/utils/sessionId.js';
import { getListingFavoriteCount } from '../../favorites/favorites.js';
import { AlertTriangle, ArrowLeft, BarChart3, ChevronRight, Sparkles } from 'lucide-react';
import Button, { buttonClasses } from '../../common/components/ui/Button.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import { useCart } from '../../cart/hooks/useCart.js';
import { formatCurrency } from '../../common/formatters.js';
import AuraSummary from '../../common/components/AuraSummary.jsx';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import SimilarListings from '../components/SimilarListings.jsx';
import ListingReviewsSection from '../../reviews/components/ListingReviewsSection.jsx';
import { optimizeCloudinaryUrl } from '../../common/utils/imageOptimizer.js';
import { useActiveReservationCount } from '../../cart/hooks/useActiveReservationCount.js';
import RecentlyViewedSection from '../components/RecentlyViewedSection.jsx';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js';
import ListingGallery from '../components/ListingGallery.jsx';
import ListingBuyBox from '../components/ListingBuyBox.jsx';
import ListingSellerCard from '../components/ListingSellerCard.jsx';

const ListingInfoModal = lazy(() => import('../components/ListingInfoModal.jsx'));
const MakeOfferModal = lazy(() => import('../../offer/components/MakeOfferModal.jsx'));

/* ── Helpers ─────────────────────────────────────────────── */

const LOW_STOCK_LIMIT = 10;
const DESCRIPTION_CLAMP_CHARS = 400;

const discountPercent = (original, sale) => {
  const o = parseFloat(original);
  const s = parseFloat(sale);
  if (!o || !s || o <= s) return null;
  return Math.round(((o - s) / o) * 100);
};

/* ── Sub-components ──────────────────────────────────────── */

const CARD = 'rounded border border-border bg-background-primary';

// Mirrors the final geometry: gallery + sections on the left, buy box + seller card on the right.
const DetailSkeleton = () => (
  <div className="min-h-screen bg-background-secondary pb-24">
    <PageContainer className="pt-4">
      <Skeleton className="mb-4 h-5 w-64" />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 xl:gap-8">
        <div className="space-y-6 lg:col-span-7">
          <Skeleton className="aspect-4/3 w-full" />
          <div className="hidden gap-2 sm:flex">
            {['a', 'b', 'c', 'd'].map(k => <Skeleton key={k} className="h-16 w-16 shrink-0" />)}
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-32 w-full" />
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

const DetailSection = ({ id, title, action, children }) => (
  <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 p-5">
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 id={`${id}-title`} className="text-lg font-semibold text-text-primary">{title}</h2>
      {action}
    </div>
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
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const viewTrackedRef = useRef(false);

  const { cartReservations, activeViewers } = useActiveReservationCount(listing?.id, {
    enablePolling: true,
    pollInterval: 10 * 60 * 1000
  });

  const images = useMemo(() => {
    const urls = listing?.imageUrls?.length > 0 ? listing.imageUrls : listing?.imageUrl ? [listing.imageUrl] : [];
    return [...new Set(urls.filter(Boolean))];
  }, [listing?.imageUrls, listing?.imageUrl]);

  const isOwner = isAuthenticated && user?.id === listing?.sellerId;
  const hasCampaign = listing?.campaignId && listing?.campaignPrice != null && parseFloat(listing?.campaignPrice) < parseFloat(listing?.price);
  const displayPrice = hasCampaign ? listing?.campaignPrice : listing?.price;
  const discount = hasCampaign ? discountPercent(listing?.price, listing?.campaignPrice) : null;
  const favoriteCount = getListingFavoriteCount(listing);

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

  /* Collapse the description and scroll to top when navigating to another listing */
  useEffect(() => {
    setIsDescriptionExpanded(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  /* SEO */
  useEffect(() => {
    if (!listing) return;
    const prevTitle = document.title;
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
    return () => {
      document.title = prevTitle;
      document.getElementById(schemaId)?.remove();
    };
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

  /* ── Render ──────────────────────────────────────────── */

  if (isLoading) return <DetailSkeleton />;
  if (error) return <DetailError error={error} />;
  if (!listing) return null;

  const DetailsComponent = listingTypeRegistry[listing.type]?.detailsComponent;
  const isPurchasableType = !NON_PURCHASABLE_TYPES.includes(listing.type);
  const isActive = listing.status === LISTING_STATUS.ACTIVE;
  const canPurchase = !isOwner && isPurchasableType && isActive;
  const typeLabel = getListingTypeOptions().find(o => o.value === listing.type)?.label ?? listing.type;
  const locationLabel = [listing.district, listing.city].filter(Boolean).join(', ') || t('location_not_specified', 'Konum belirtilmedi');
  const shouldClampDescription = listing.description?.length > DESCRIPTION_CLAMP_CHARS;

  const stockCount = Number(listing.quantity);
  const hasStockInfo = listing.quantity != null && Number.isFinite(stockCount);
  const stock = !hasStockInfo
    ? null
    : stockCount === 0
    ? { dot: 'bg-text-muted', label: t('out_of_stock', 'Tükendi') }
    : stockCount < LOW_STOCK_LIMIT
    ? { dot: 'bg-status-warning', label: t('stock_last_n', { defaultValue: 'Son {{count}} adet', count: stockCount }) }
    : { dot: 'bg-status-success', label: t('stock_in_n', { defaultValue: 'Stokta, {{count}} adet', count: stockCount }) };

  const socialProof = [
    cartReservations > 0 && t('social_in_carts', { defaultValue: '{{count}} kişinin sepetinde', count: cartReservations }),
    activeViewers > 0 && t('social_viewed_24h', { defaultValue: 'Son 24 saatte {{count}} kişi inceledi', count: activeViewers })
  ].filter(Boolean);

  const handleCartClick = () => (itemIsInCart ? navigate(ROUTES.SHOPPING_CART) : addToCart(listing.id));
  const openAura = () => navigate(ROUTES.AURA_CHAT, { state: { listing } });
  const openOffer = () => setIsOfferModalOpen(true);
  const showMobileBar = !isOwner;

  return (
    <div className={`min-h-screen bg-background-secondary text-text-primary ${showMobileBar ? 'pb-28 lg:pb-16' : 'pb-16'}`}>
      {isOfferModalOpen && (
        <Suspense fallback={null}>
          <MakeOfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} listing={listing} />
        </Suspense>
      )}
      {isInsightsOpen && (
        <Suspense fallback={null}>
          <ListingInfoModal
            isOpen={isInsightsOpen}
            onClose={() => setIsInsightsOpen(false)}
            listing={listing}
            displayPrice={displayPrice}
            isOwner={isOwner}
          />
        </Suspense>
      )}

      <PageContainer className="pt-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <nav className="flex min-w-0 items-center gap-1.5 text-sm text-text-tertiary" aria-label="Breadcrumb">
            <Link to={ROUTES.LISTINGS} className="shrink-0 hover:text-text-primary transition-colors">
              {t("all_listings", "İlanlar")}
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
            <span className="shrink-0 text-text-secondary">{typeLabel}</span>
            <ChevronRight className="hidden h-4 w-4 shrink-0 text-text-muted md:block" strokeWidth={1.5} aria-hidden />
            <span className="hidden truncate text-text-secondary md:inline" aria-current="page">{listing.title}</span>
          </nav>
          <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setIsInsightsOpen(true)}>
            <BarChart3 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            <span>{t("market_insights", "Piyasa analizi")}</span>
          </Button>
        </div>

        {!isActive && (
          <div className="mb-4">
            <Alert
              type="warning"
              message={t('listing_not_active', {
                defaultValue: 'Bu ilan şu anda satışta değil ({{status}}).',
                status: listingStatusLabel(listing.status)
              })}
            />
          </div>
        )}

        {/* DOM order is gallery -> buy box -> details so mobile reads top to bottom;
            on desktop the aside spans both rows and stays sticky beside the details. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 xl:gap-8">
          <div className="lg:col-span-7 lg:row-start-1">
            <ListingGallery key={listing.id} images={images} title={listing.title} />
          </div>

          <aside className="space-y-4 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-20">
            <ListingBuyBox
              listing={listing}
              typeLabel={typeLabel}
              locationLabel={locationLabel}
              price={{ display: displayPrice, hasCampaign, discount }}
              isOwner={isOwner}
              canPurchase={canPurchase}
              stock={stock}
              socialProof={isOwner ? [] : socialProof}
              favoriteCount={favoriteCount}
              cartReservations={cartReservations}
              cart={{ onClick: handleCartClick, isAdding: isAddingToCart, isInCart: itemIsInCart }}
              onMakeOffer={openOffer}
              onShare={handleShare}
              copiedLink={copiedLink}
              onChanged={fetchListing}
            />
            <ListingSellerCard listing={listing} isOwner={isOwner} />
          </aside>

          <div className="space-y-6 lg:col-span-7 lg:row-start-2">
            <div className={`${CARD} divide-y divide-border-light`}>
              {DetailsComponent && (
                <DetailSection id="specs" title={t("specifications", "Özellikler")}>
                  <DetailsComponent listing={listing} flat={true} />
                </DetailSection>
              )}

              <DetailSection id="description" title={t("about_this_item", "Açıklama")}>
                <p
                  className={`max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-text-secondary ${
                    shouldClampDescription && !isDescriptionExpanded ? 'line-clamp-6' : ''
                  }`}
                >
                  {listing.description || t("no_description_provided", "Bu ilan için açıklama girilmemiş.")}
                </p>
                {shouldClampDescription && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded(v => !v)}
                    aria-expanded={isDescriptionExpanded}
                    className="mt-3 text-sm font-medium text-text-primary hover:underline"
                  >
                    {isDescriptionExpanded ? t("show_less", "Daha az göster") : t("read_more", "Devamını oku")}
                  </button>
                )}
              </DetailSection>

              <DetailSection
                id="aura"
                title={t('aura_listing_analysis', 'Aura analizi')}
                action={
                  <Button variant="secondary" size="sm" onClick={openAura}>
                    <Sparkles className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    <span>{t('ask_aura', "Aura'ya sor")}</span>
                  </Button>
                }
              >
                <AuraSummary type="listing" id={listing.id} listing={listing} />
              </DetailSection>
            </div>

            {isPurchasableType && (
              <div id="reviews" className="scroll-mt-24">
                <ListingReviewsSection listing={listing} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-14 space-y-12">
          <SimilarListings currentListing={listing} />
          <RecentlyViewedSection currentListingId={listing.id} />
        </div>
      </PageContainer>

      {showMobileBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background-primary px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold leading-tight tabular-nums text-text-primary">
                {formatCurrency(displayPrice, listing.currency)}
              </p>
              {hasCampaign && (
                <p className="truncate text-sm tabular-nums text-text-muted line-through">
                  {formatCurrency(listing.price, listing.currency)}
                </p>
              )}
            </div>
            {canPurchase ? (
              <div className="flex shrink-0 items-center gap-2">
                <ContactSellerButton listing={listing} variant="secondary" iconOnly className="h-11 w-11" />
                <Button variant="secondary" className="h-11" onClick={openOffer}>
                  {t('make_offer', 'Teklif')}
                </Button>
                <Button className="h-11" onClick={handleCartClick} disabled={isAddingToCart}>
                  {isAddingToCart ? t("adding_to_cart", "Ekleniyor...") : itemIsInCart ? t("go_to_cart_short", "Sepete git") : t("add_to_cart", "Sepete ekle")}
                </Button>
              </div>
            ) : (
              <ContactSellerButton listing={listing} variant="primary" className="h-11 shrink-0" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;
