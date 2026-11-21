import { useTranslation } from "react-i18next";
import { useState, memo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingCardActions from './ListingCardActions.jsx';
import { formatCurrency } from '../../common/formatters.js';
import { LISTING_STATUS, LISTING_TYPES, NON_PURCHASABLE_TYPES } from '../types/index.js';
import { MapPin, Image as ImageIcon, Star, Eye, ShoppingBag, HandCoins, Zap, TrendingDown, Award, Check } from 'lucide-react';
import { useCart } from '../../cart/hooks/useCart.js';
import { useLoginPrompt } from '../../auth/hooks/useLoginPrompt.js';
import CompareButton from '../../comparison/components/CompareButton.jsx';
import { useComparison } from '../../comparison/hooks/useComparison.js';
import AddToListButton from '../../favoritelist/components/AddToListButton.jsx';
import { optimizeCloudinaryUrl } from '../../common/utils/imageOptimizer.js';
import { getListingFavoriteCount } from '../../favorites/favorites.js';

const ListingInfoModal = lazy(() => import('./ListingInfoModal.jsx'));
const MakeOfferModal = lazy(() => import('../../offer/components/MakeOfferModal.jsx'));

const LOW_STOCK_LIMIT = 10;
// Location decides a vehicle or property visit; for shippable goods the card shows the rating instead.
const LOCATION_TYPES = [LISTING_TYPES.VEHICLE, LISTING_TYPES.REAL_ESTATE];
// Badges over the photo are white chips with a shadow, not bordered boxes: a border on a photo adds a line without adding contrast.
const IMAGE_BADGE = 'inline-flex items-center gap-1 rounded-sm bg-background-primary px-2 py-0.5 text-xs font-medium shadow-sm';
const HOVER_ACTION = 'flex h-8 w-8 items-center justify-center rounded border border-border bg-background-primary text-text-secondary shadow-sm transition-colors duration-150 hover:border-card-border-hover hover:text-text-primary';

// Browse card: photo first, then price, title and one line of metadata. Seller details, favorite
// counts and social proof live on the listing page, so the card stays scannable in a dense grid.
const ListingCard = ({
  listing,
  onDeleted,
  showActions = true,
  isOwner,
  currentUserId,
  isInShowcase = false,
  priorityImage = false,
  isSelectable = false,
  isSelected = false,
  onSelectToggle = null
}) => {
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const promptLogin = useLoginPrompt();
  const stockCount = listing?.quantity != null ? Number(listing.quantity) : null;
  const isOutOfStock = stockCount === 0;
  const isPurchasableListing = Boolean(!isOwner && !NON_PURCHASABLE_TYPES.includes(listing?.type) && listing?.status === LISTING_STATUS.ACTIVE);
  const isPurchasable = Boolean(currentUserId && isPurchasableListing);
  const canAddToCart = isPurchasableListing && !isOutOfStock;
  const { addToCart, isAddingToCart, isInCart } = useCart({ loadCartItems: Boolean(currentUserId && canAddToCart) });
  const itemIsInCart = Boolean(currentUserId && canAddToCart && isInCart(listing?.id));
  const { isInComparison } = useComparison();

  if (!listing) return null;

  const detailPath = ROUTES.LISTING_DETAIL(listing.id);
  const isInCompare = isInComparison(listing.id);
  const reviewCount = Number(listing.reviewStats?.totalReviews ?? listing.reviewStats?.reviewCount ?? listing.reviewCount ?? 0) || 0;
  const averageRating = Number(listing.reviewStats?.averageRating ?? listing.averageRating ?? 0) || 0;
  const hasCampaign = listing.campaignId && listing.campaignPrice != null && parseFloat(listing.campaignPrice) < parseFloat(listing.price);
  const displayPrice = hasCampaign ? listing.campaignPrice : listing.price;
  const discountPct = hasCampaign ? Math.round((1 - parseFloat(listing.campaignPrice) / parseFloat(listing.price)) * 100) : 0;
  // A single remaining item is the norm for second-hand goods; only multi-unit listings running low are worth flagging.
  const isLowStock = stockCount != null && stockCount > 1 && stockCount < LOW_STOCK_LIMIT;
  const statusLabel = {
    [LISTING_STATUS.SOLD]: t('status_sold', 'Satıldı'),
    [LISTING_STATUS.PENDING]: t('status_pending', 'Beklemede')
  }[listing.status] ?? listing.status;
  const showImage = listing.imageUrl && !imageFailed;
  const showLocation = Boolean(listing.city) && LOCATION_TYPES.includes(listing.type);
  const showRating = reviewCount > 0;
  const stop = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  return <div
    className={`group relative flex h-full flex-col overflow-hidden rounded border bg-background-primary shadow-sm transition duration-150 hover:shadow-md
 ${isSelected || isInCompare ? 'border-accent-teal ring-1 ring-accent-teal' : 'border-border-light hover:border-border'}
 `}>
    {/* Select mode: the whole card toggles selection; the check mirrors the state for sighted users. */}
    {isSelectable && <button type="button" aria-pressed={isSelected} aria-label={listing.title || listing.listingNo} className="absolute inset-0 z-40 cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus" onClick={e => {
      stop(e);
      onSelectToggle?.(listing.id);
    }}>
      <span className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-sm border shadow-sm transition-colors duration-150 ${isSelected ? 'border-accent-teal bg-accent-teal text-white' : 'border-border bg-background-primary text-transparent'}`} aria-hidden>
        <Check className="h-4 w-4" strokeWidth={2} />
      </span>
    </button>}

    {/* Image */}
    <div className="relative aspect-4/3 shrink-0 overflow-hidden border-b border-border-light bg-secondary-200">
      <Link to={detailPath} tabIndex={-1} aria-hidden className="block h-full w-full">
        {showImage ? (
          <img
            src={optimizeCloudinaryUrl(listing.imageUrl, { width: 600, height: 450, crop: 'fill', gravity: 'auto' })}
            alt=""
            loading={priorityImage ? 'eager' : 'lazy'}
            fetchPriority={priorityImage ? 'high' : 'auto'}
            decoding="async"
            onError={() => setImageFailed(true)}
            className={`h-full w-full object-cover ${isOutOfStock ? 'opacity-50' : ''}`}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-text-muted">
            <ImageIcon className="h-8 w-8" strokeWidth={1.5} aria-hidden />
          </span>
        )}
      </Link>

      {/* Top-left badges */}
      <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
        {isOutOfStock ? (
          <span className={`${IMAGE_BADGE} text-status-error-text`}>{t('out_of_stock', 'Tükendi')}</span>
        ) : listing.status !== LISTING_STATUS.ACTIVE ? (
          <span className={`${IMAGE_BADGE} text-text-secondary`}>{statusLabel}</span>
        ) : null}
        {isInShowcase && <span className={`${IMAGE_BADGE} text-text-primary`}>
          <Zap className="h-3 w-3 text-status-warning" strokeWidth={1.5} aria-hidden />{t("featured")}</span>}
        {hasCampaign && discountPct > 0 && <span className={`${IMAGE_BADGE} tabular-nums text-status-error-text`}>
          <TrendingDown className="h-3 w-3" strokeWidth={1.5} aria-hidden />
          -{discountPct}%
        </span>}
      </div>

      {/* Top-right actions: owner menu always; quick actions on desktop hover */}
      <div className="absolute right-2 top-2 z-20 flex flex-col items-end gap-1.5">
        {/* Owner gear: hidden until hover or keyboard focus on pointer devices; touch screens have no hover, so it stays visible there. */}
        {showActions && isOwner && <div className="transition-opacity duration-150 group-focus-within:opacity-100 motion-reduce:transition-none [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
          <ListingCardActions listing={listing} onChanged={onDeleted} />
        </div>}
        <div className="hidden max-w-[72px] flex-wrap justify-end gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none md:flex">
          {isPurchasable && <button type="button" onClick={e => {
            stop(e);
            setIsOfferModalOpen(true);
          }} className={HOVER_ACTION} title={t("make_offer")} aria-label={t("make_offer")}>
            <HandCoins className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>}
          <AddToListButton listingId={listing.id} listingTitle={listing.title} size="sm" />
          <CompareButton listing={listing} size="sm" />
        </div>
      </div>

      {/* Quick view (desktop hover) */}
      <button type="button" onClick={e => {
        stop(e);
        setShowInfo(true);
      }} className="absolute bottom-2 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded border border-border bg-background-primary px-3 py-1.5 text-xs font-medium text-text-primary shadow-sm opacity-0 transition-opacity duration-150 hover:border-card-border-hover focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none md:flex">
        <Eye className="h-3.5 w-3.5 text-text-secondary" strokeWidth={1.5} aria-hidden />{t("quick_view")}</button>
    </div>

    {/* Body */}
    <div className="flex flex-1 flex-col gap-1 p-3.5">
      <Link to={detailPath} className="flex flex-col gap-1">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className={`text-lg font-semibold tabular-nums tracking-tight ${isOutOfStock ? 'text-text-tertiary' : 'text-text-price'}`}>
            {formatCurrency(displayPrice, listing.currency)}
          </span>
          {hasCampaign && <span className="text-xs tabular-nums text-text-tertiary line-through">
            {formatCurrency(listing.price, listing.currency)}
          </span>}
        </p>

        <h3 className="line-clamp-2 min-h-11 text-sm text-text-primary">
          {listing.title}
        </h3>
      </Link>

      <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-sm text-text-tertiary">
        <Link to={detailPath} className="flex min-w-0 flex-1 items-center gap-1 tabular-nums">
          {showLocation && <>
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
            <span className="truncate">{listing.city}</span>
          </>}
          {showRating && <span className={`inline-flex shrink-0 items-center gap-1 ${showLocation ? 'ml-1' : ''}`}>
            <Star className="h-3.5 w-3.5 fill-current text-status-warning" strokeWidth={1.5} aria-hidden />
            <span className="font-medium text-text-primary" aria-hidden>{averageRating.toFixed(1)}</span>
            <span aria-hidden>({reviewCount})</span>
            <span className="sr-only">
              {t('listing_rating_aria', { defaultValue: '{{rating}} puan, {{count}} değerlendirme', rating: averageRating.toFixed(1), count: reviewCount })}
            </span>
          </span>}
          {isLowStock && !isOwner && <span className="shrink-0 text-status-warning-text">
            {showLocation || showRating ? '· ' : ''}{t('only_x_left', { count: stockCount, defaultValue: `Son ${stockCount} adet` })}
          </span>}
        </Link>
        <span className="flex shrink-0 items-center gap-1">
          {listing.sellerGreatSellerEligible && <Award className="h-3.5 w-3.5 text-status-warning" strokeWidth={1.5} aria-label={t("great_seller")} />}
          <FavoriteButton
            listingId={listing.id}
            listing={listing}
            initialIsFavorited={listing.favoriteStats?.isFavorited ?? listing.favoriteStats?.favorited ?? false}
            initialCount={getListingFavoriteCount(listing)}
            size="sm"
            showCount={false}
            variant="ghost"
          />
          {canAddToCart && <button
            type="button"
            onClick={e => {
              stop(e);
              if (!currentUserId) {
                promptLogin();
                return;
              }
              if (!itemIsInCart) addToCart(listing.id);
            }}
            disabled={isAddingToCart || itemIsInCart}
            className={`flex h-8 w-8 items-center justify-center rounded transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
              itemIsInCart
                ? 'cursor-default text-status-success'
                : 'text-text-tertiary hover:bg-background-tertiary hover:text-text-primary'
            } ${isAddingToCart ? 'opacity-50' : ''}`}
            title={itemIsInCart ? t("in_cart") : t("add_to_cart")}
            aria-label={itemIsInCart ? t("in_cart") : t("add_to_cart")}
          >
            {isAddingToCart ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : itemIsInCart ? (
              <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            ) : (
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            )}
          </button>}
        </span>
      </div>
    </div>

    {showInfo && (
      <Suspense fallback={null}>
        <ListingInfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} listing={listing} displayPrice={displayPrice} isOwner={isOwner} isInShowcase={isInShowcase} />
      </Suspense>
    )}

    {isOfferModalOpen && (
      <Suspense fallback={null}>
        <MakeOfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} listing={listing} />
      </Suspense>
    )}
  </div>;
};
ListingCard.displayName = 'ListingCard';
export default memo(ListingCard, (prevProps, nextProps) =>
  prevProps.listing?.id === nextProps.listing?.id &&
  prevProps.listing?.sellerId === nextProps.listing?.sellerId &&
  prevProps.listing?.status === nextProps.listing?.status &&
  prevProps.listing?.quantity === nextProps.listing?.quantity &&
  prevProps.listing?.sellerGreatSellerEligible === nextProps.listing?.sellerGreatSellerEligible &&
  prevProps.listing?.reviewStats?.totalReviews === nextProps.listing?.reviewStats?.totalReviews &&
  prevProps.listing?.reviewStats?.averageRating === nextProps.listing?.reviewStats?.averageRating &&
  prevProps.listing?.averageRating === nextProps.listing?.averageRating &&
  getListingFavoriteCount(prevProps.listing) === getListingFavoriteCount(nextProps.listing) &&
  prevProps.listing?.favoriteStats?.isFavorited === nextProps.listing?.favoriteStats?.isFavorited &&
  prevProps.isOwner === nextProps.isOwner &&
  prevProps.currentUserId === nextProps.currentUserId &&
  prevProps.showActions === nextProps.showActions &&
  prevProps.isInShowcase === nextProps.isInShowcase &&
  prevProps.priorityImage === nextProps.priorityImage &&
  prevProps.isSelectable === nextProps.isSelectable &&
  prevProps.isSelected === nextProps.isSelected &&
  prevProps.onSelectToggle === nextProps.onSelectToggle
);
