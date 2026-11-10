import { useTranslation } from "react-i18next";
import { useState, useMemo, useRef, useEffect, memo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingCardActions from './ListingCardActions.jsx';
import { formatCurrency } from '../../common/formatters.js';
import { LISTING_STATUS, NON_PURCHASABLE_TYPES } from '../types/index.js';
import { MapPin, Image as ImageIcon, Star, Eye, Heart, ShoppingBag, HandCoins, Zap, TrendingDown, Award, Check, Flame } from 'lucide-react';
import { useCart } from '../../cart/hooks/useCart.js';
import CompareButton from '../../comparison/components/CompareButton.jsx';
import { useComparison } from '../../comparison/hooks/useComparison.js';
import AddToListButton from '../../favoritelist/components/AddToListButton.jsx';
import { optimizeCloudinaryUrl } from '../../common/utils/imageOptimizer.js';
import { getListingFavoriteCount } from '../../favorites/favorites.js';

const ListingInfoModal = lazy(() => import('./ListingInfoModal.jsx'));
const MakeOfferModal = lazy(() => import('../../offer/components/MakeOfferModal.jsx'));

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
  const {
    t
  } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const isOutOfStock = listing?.quantity != null && Number(listing.quantity) === 0;
  const canAddToCart = Boolean(currentUserId && !isOwner && !NON_PURCHASABLE_TYPES.includes(listing?.type) && listing?.status === LISTING_STATUS.ACTIVE && !isOutOfStock);
  const canMakeOffer = Boolean(currentUserId && !isOwner && !NON_PURCHASABLE_TYPES.includes(listing?.type) && listing?.status === LISTING_STATUS.ACTIVE);
  const {
    addToCart,
    isAddingToCart,
    isInCart
  } = useCart({
    loadCartItems: canAddToCart
  });
  const itemIsInCart = canAddToCart && isInCart(listing?.id);
  const {
    isInComparison
  } = useComparison();
  const activeViewers = Number(listing?.socialProof?.viewsLast24Hours ?? listing?.viewsLast24Hours ?? 0);
  const cartReservations = Number(listing?.socialProof?.inCartCount ?? listing?.inCartCount ?? 0);
  const cardFavoriteCount = getListingFavoriteCount(listing);

  // ── Sequential Micro-Story Social Proof Ticker ──
  const storyItems = useMemo(() => {
    const list = [];
    if (activeViewers > 0) {
      list.push({
        id: 'viewers',
        icon: <Eye className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />,
        text: t('social_proof_viewers', { count: activeViewers, defaultValue: `${activeViewers} kişi inceledi` }),
      });
    }
    if (cartReservations > 0) {
      list.push({
        id: 'cart',
        icon: <Flame className="w-3.5 h-3.5 shrink-0 text-status-warning" strokeWidth={1.5} />,
        text: t('social_proof_in_carts', { count: cartReservations, defaultValue: `${cartReservations} kişinin sepetinde` }),
      });
    }
    return list;
  }, [activeViewers, cartReservations, t]);

  const [storyIndex, setStoryIndex] = useState(-1);
  const [storyPlayed, setStoryPlayed] = useState(false);
  const storyTimerRef = useRef(null);

  const handleCardMouseEnter = () => {
    setIsCardHovered(true);
    if (storyPlayed || storyItems.length === 0) return;
    setStoryIndex(0);
  };

  const handleCardMouseLeave = () => {
    setIsCardHovered(false);
    if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    setStoryIndex(-1);
    setStoryPlayed(false);
  };

  useEffect(() => {
    if (isCardHovered && !storyPlayed && storyIndex === -1 && storyItems.length > 0) {
      setStoryIndex(0);
    }
  }, [isCardHovered, storyPlayed, storyIndex, storyItems.length]);

  useEffect(() => {
    if (storyIndex >= 0 && storyIndex < storyItems.length) {
      storyTimerRef.current = setTimeout(() => {
        setStoryIndex(prev => prev + 1);
      }, 1500);
      return () => {
        if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
      };
    } else if (storyIndex >= storyItems.length && storyItems.length > 0) {
      setStoryPlayed(true);
      setStoryIndex(-1);
    }
  }, [storyIndex, storyItems.length]);

  const currentStory = storyIndex >= 0 && storyIndex < storyItems.length ? storyItems[storyIndex] : null;

  if (!listing) return null;

  const isGreatSeller = Boolean(listing.sellerGreatSellerEligible);
  const isInCompare = isInComparison(listing.id);
  const getStatusConfig = status => {
    switch (status) {
      case LISTING_STATUS.ACTIVE:
        return {
          cls: 'bg-primary text-white border-primary',
          label: t('status_active', 'Aktif')
        };
      case LISTING_STATUS.SOLD:
        return {
          cls: 'bg-background-primary text-status-error-text border-border',
          label: t('status_sold', 'Satıldı')
        };
      case LISTING_STATUS.PENDING:
        return {
          cls: 'bg-background-primary text-status-warning-text border-border',
          label: t('status_pending', 'Beklemede')
        };
      default:
        return {
          cls: 'bg-background-primary text-text-secondary border-border',
          label: status
        };
    }
  };
  const reviewCount = Number(
    listing.reviewStats?.reviewCount ??
    listing.reviewStats?.totalReviews ??
    listing.reviewStats?.count ??
    listing.reviewCount ??
    listing.totalReviews ??
    (Array.isArray(listing.reviews) ? listing.reviews.length : 0)
  ) || 0;

  const avgRaw = Number(
    listing.reviewStats?.averageRating ??
    listing.reviewStats?.rating ??
    listing.reviewStats?.avgRating ??
    listing.averageRating ??
    listing.rating ??
    listing.avgRating ??
    0
  );

  const averageRating = Number.isFinite(avgRaw) && avgRaw > 0 ? avgRaw : 0;
  const shouldShowReviews = reviewCount > 0 || averageRating > 0;
  const hasCampaign = listing.campaignId && listing.campaignPrice != null && parseFloat(listing.campaignPrice) < parseFloat(listing.price);
  const displayPrice = hasCampaign ? listing.campaignPrice : listing.price;
  const isLowStock = listing.quantity != null && Number(listing.quantity) > 0 && Number(listing.quantity) < 10;
  const hasStockInfo = listing.quantity != null && Number.isFinite(Number(listing.quantity));
  const discountPct = hasCampaign ? Math.round((1 - parseFloat(listing.campaignPrice) / parseFloat(listing.price)) * 100) : 0;
  const statusConfig = getStatusConfig(listing.status);
  return <div
    onMouseEnter={handleCardMouseEnter}
    onMouseLeave={handleCardMouseLeave}
    className={`group relative flex flex-col h-full
 bg-background-primary rounded
 border transition-colors duration-150 ease-out

 ${isOutOfStock ? 'opacity-60' : ''}
 ${isSelectable && isInShowcase ? 'opacity-40 grayscale cursor-not-allowed' : ''}
 ${isSelected ? 'border-primary ring-2 ring-primary/20' : isInCompare ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-card-border-hover'}
 `}>
    {isSelectable && <div className="absolute inset-0 z-40 cursor-pointer" onClick={e => {
      e.preventDefault();
      e.stopPropagation();
      onSelectToggle?.(listing.id);
    }} />}

    {/* Top-right action buttons */}
    <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-150 motion-reduce:transition-none">
      {showActions && <ListingCardActions listing={listing} onChanged={onDeleted} />}
      <FavoriteButton listingId={listing.id} listing={listing} initialIsFavorited={listing.favoriteStats?.isFavorited ?? listing.favoriteStats?.favorited ?? false} initialCount={cardFavoriteCount} size="sm" showCount={false} />
      {canAddToCart && <button type="button" onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        if (!itemIsInCart) {
          addToCart(listing.id);
        }
      }} disabled={isAddingToCart || itemIsInCart} className={`w-8 h-8 rounded border border-border flex items-center justify-center transition-colors duration-150 ${itemIsInCart
          ? 'bg-background-secondary text-status-success cursor-default'
          : 'bg-background-primary text-text-secondary hover:text-text-primary hover:border-card-border-hover'
        }`} title={itemIsInCart ? t("in_cart") : t("add_to_cart")} aria-label={itemIsInCart ? t("in_cart") : t("add_to_cart")}>
        {isAddingToCart ? (
          <div className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : itemIsInCart ? (
          <Check className="w-4 h-4 text-status-success" strokeWidth={1.5} />
        ) : (
          <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
        )}
      </button>}
      {canMakeOffer && <button type="button" onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        setIsOfferModalOpen(true);
      }} className="w-8 h-8 rounded bg-background-primary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-card-border-hover transition-colors duration-150" title={t("make_offer")} aria-label={t("make_offer")}>
        <HandCoins className="w-4 h-4" strokeWidth={1.5} />
      </button>}
      <AddToListButton listingId={listing.id} listingTitle={listing.title} size="sm" />
      <CompareButton listing={listing} size="sm" />
    </div>

    {/* Image */}
    <div className="relative aspect-4/3 bg-background-tertiary overflow-hidden rounded-t border-b border-border-light">
      {listing.imageUrl ? <img src={optimizeCloudinaryUrl(listing.imageUrl, {
        width: 400,
        height: 300
      })} alt={listing.title} loading={priorityImage ? 'eager' : 'lazy'} fetchPriority={priorityImage ? 'high' : 'auto'} decoding="async" className="w-full h-full object-cover" onError={e => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }} /> : null}
      <div className={`w-full h-full flex flex-col items-center justify-center text-text-muted bg-background-tertiary ${listing.imageUrl ? 'hidden' : 'flex'}`}>
        <ImageIcon className="w-8 h-8" strokeWidth={1.5} />
      </div>

      {/* Top-left badges */}
      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 items-start">
        {listing.status !== LISTING_STATUS.ACTIVE && <span className={`inline-flex px-2 py-0.5 rounded-sm text-xs font-medium border ${statusConfig.cls}`}>
          {statusConfig.label}
        </span>}
        {isInShowcase && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium bg-background-primary text-text-primary border border-border">
          <Zap className="w-3 h-3 text-status-warning" strokeWidth={1.5} />{t("featured")}</span>}
        {hasCampaign && discountPct > 0 && <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-sm text-xs font-semibold tabular-nums bg-background-primary text-status-error-text border border-border">
          <TrendingDown className="w-3 h-3" strokeWidth={1.5} />
          -{discountPct}%
        </span>}
      </div>

      {/* Quick View */}
      <button type="button" onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        setShowInfo(true);
      }} className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded bg-background-primary text-xs font-medium text-text-primary border border-border opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition duration-150 motion-reduce:transition-none hover:border-card-border-hover flex items-center gap-1.5 whitespace-nowrap">
        <Eye className="w-3.5 h-3.5 text-text-secondary" strokeWidth={1.5} />{t("quick_view")}</button>
    </div>

    {/* Body */}
    <Link to={ROUTES.LISTING_DETAIL(listing.id)} className="flex-1 flex flex-col p-4">

      {/* Title */}
      <h3 className={`text-sm font-medium text-text-primary line-clamp-2 min-h-10 leading-snug mb-2 ${isOutOfStock ? 'line-through text-text-muted' : ''}`}>
        {listing.title}
      </h3>

      {/* Price & Rating row */}
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
          <span className={`text-base font-semibold tabular-nums tracking-tight ${isOutOfStock ? 'line-through text-text-muted' : 'text-text-primary'}`}>
            {formatCurrency(displayPrice, listing.currency)}
          </span>
          {hasCampaign && <span className="text-xs text-text-muted line-through tabular-nums">
            {formatCurrency(listing.price, listing.currency)}
          </span>}
        </div>

        {shouldShowReviews && (
          <div className="inline-flex items-center gap-1 shrink-0 text-xs tabular-nums">
            <Star className="w-3.5 h-3.5 text-status-warning fill-current shrink-0" strokeWidth={1.5} aria-hidden />
            <span className="font-medium text-text-secondary">{averageRating > 0 ? averageRating.toFixed(1) : '5.0'}</span>
            {reviewCount > 0 && <span className="text-text-muted">({reviewCount})</span>}
          </div>
        )}
      </div>

      {/* Stock / Campaign / Social Proof single-line meta */}
      {(hasStockInfo || hasCampaign || currentStory) && (
        <div className="flex items-center gap-1.5 mb-2.5 min-h-5 overflow-hidden whitespace-nowrap">
          {currentStory ? (
            <span
              key={currentStory.id}
              className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary truncate"
            >
              {currentStory.icon}
              <span className="truncate">{currentStory.text}</span>
            </span>
          ) : (
            <>
              {hasStockInfo && <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium tabular-nums shrink-0 border ${isOutOfStock ? 'bg-background-secondary text-status-error-text border-border' : isLowStock ? 'bg-background-secondary text-status-warning-text border-border' : 'bg-background-secondary text-text-tertiary border-border-light'}`}>
                {isOutOfStock
                  ? t('out_of_stock', 'Tükendi')
                  : isLowStock && !isOwner
                    ? t('only_x_left', { count: Number(listing.quantity), defaultValue: `Son ${Number(listing.quantity)} adet` })
                    : t('x_in_stock', { count: Number(listing.quantity), defaultValue: `${Number(listing.quantity)} stokta` })}
              </span>}
              {hasCampaign && listing.campaignName && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-background-secondary text-text-secondary text-xs font-medium border border-border-light truncate">
                  {listing.campaignName}
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-2.5 border-t border-border-light flex items-center justify-between gap-2 text-xs">
        {listing.sellerName ? <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="w-5 h-5 shrink-0 rounded-full bg-background-tertiary border border-border-light flex items-center justify-center text-xs font-semibold text-text-secondary">
            {listing.sellerName[0]?.toUpperCase()}
          </div>
          <span className="font-medium text-text-secondary truncate" title={listing.sellerName}>
            {listing.sellerName}
          </span>
          {isGreatSeller && <Award className="w-3.5 h-3.5 text-status-warning shrink-0" strokeWidth={1.5} title={t("great_seller")} aria-label={t("great_seller")} />}
        </div> : <div />}
        <div className="flex items-center gap-2.5 shrink-0 text-text-muted">
          {listing.city && <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span className="truncate max-w-24">{listing.city}</span>
          </div>}
          <div className="flex items-center gap-1 tabular-nums">
            <Heart className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span>{cardFavoriteCount}</span>
          </div>
        </div>
      </div>
    </Link>

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
  prevProps.listing?.sellerGreatSellerEligible === nextProps.listing?.sellerGreatSellerEligible &&
  prevProps.listing?.reviewStats?.totalReviews === nextProps.listing?.reviewStats?.totalReviews &&
  prevProps.listing?.reviewStats?.averageRating === nextProps.listing?.reviewStats?.averageRating &&
  prevProps.listing?.averageRating === nextProps.listing?.averageRating &&
  prevProps.listing?.rating === nextProps.listing?.rating &&
  getListingFavoriteCount(prevProps.listing) === getListingFavoriteCount(nextProps.listing) &&
  prevProps.listing?.favoriteStats?.isFavorited === nextProps.listing?.favoriteStats?.isFavorited &&
  prevProps.listing?.favoriteCount === nextProps.listing?.favoriteCount &&
  prevProps.isOwner === nextProps.isOwner &&
  prevProps.currentUserId === nextProps.currentUserId &&
  prevProps.showActions === nextProps.showActions &&
  prevProps.isInShowcase === nextProps.isInShowcase &&
  prevProps.priorityImage === nextProps.priorityImage &&
  prevProps.isSelectable === nextProps.isSelectable &&
  prevProps.isSelected === nextProps.isSelected &&
  prevProps.onSelectToggle === nextProps.onSelectToggle
);