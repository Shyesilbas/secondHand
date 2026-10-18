import { useTranslation } from "react-i18next";
import { useState, useMemo, useRef, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingCardActions from './ListingCardActions.jsx';
import ListingInfoModal from './ListingInfoModal.jsx';
import { formatCurrency } from '../../common/formatters.js';
import { LISTING_STATUS, NON_PURCHASABLE_TYPES } from '../types/index.js';
import { MapPin, Image as ImageIcon, Star, Eye, Heart, ShoppingBag, HandCoins, Zap, TrendingDown, Award, Check, Flame } from 'lucide-react';
import { useCart } from '../../cart/hooks/useCart.js';
import { useActiveReservationCount } from '../../cart/hooks/useActiveReservationCount.js';
import MakeOfferModal from '../../offer/components/MakeOfferModal.jsx';
import CompareButton from '../../comparison/components/CompareButton.jsx';
import { useComparison } from '../../comparison/hooks/useComparison.js';
import AddToListButton from '../../favoritelist/components/AddToListButton.jsx';
import { optimizeCloudinaryUrl } from '../../common/utils/imageOptimizer.js';
import { getListingFavoriteCount } from '../../favorites/favorites.js';
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
 const {
 addToCart,
 isAddingToCart,
 isInCart
 } = useCart({
 loadCartItems: true
 });
 const itemIsInCart = isInCart(listing?.id);
 const {
 isInComparison
 } = useComparison();
 const { cartReservations, activeViewers } = useActiveReservationCount(listing?.id);
 const cardFavoriteCount = getListingFavoriteCount(listing);

 // ── Sequential Micro-Story Social Proof Ticker ──
 const storyItems = useMemo(() => {
   const list = [];
   if (activeViewers > 0) {
     list.push({
       id: 'viewers',
       icon: <Eye className="w-2.5 h-2.5 text-status-warning" />,
       text: `${activeViewers} kişi inceledi`,
       bg: 'bg-primary/90 text-white'
     });
   }
   if (cardFavoriteCount > 0) {
     list.push({
       id: 'favorites',
       icon: <Heart className="w-2.5 h-2.5 text-status-error fill-status-error" />,
       text: `${cardFavoriteCount} kişi favoriledi`,
       bg: 'bg-status-error/90 text-white'
     });
   }
   if (cartReservations > 0) {
     list.push({
       id: 'cart',
       icon: <Flame className="w-2.5 h-2.5 text-status-warning fill-status-warning" />,
       text: `${cartReservations} kişi sepete ekledi`,
       bg: 'bg-status-warning/95 text-white animate-pulse'
     });
   }
   return list;
 }, [activeViewers, cardFavoriteCount, cartReservations]);

 const [storyIndex, setStoryIndex] = useState(-1);
 const [storyPlayed, setStoryPlayed] = useState(false);
 const storyTimerRef = useRef(null);

 const handleCardMouseEnter = () => {
   if (storyPlayed || storyItems.length === 0) return;
   setStoryIndex(0);
 };

 const handleCardMouseLeave = () => {
   if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
   setStoryIndex(-1);
   setStoryPlayed(false);
 };

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
 const isOutOfStock = listing.quantity != null && Number(listing.quantity) === 0;
 const canAddToCart = currentUserId && !isOwner && !NON_PURCHASABLE_TYPES.includes(listing.type) && listing.status === LISTING_STATUS.ACTIVE && !isOutOfStock;
 const canMakeOffer = currentUserId && !isOwner && !NON_PURCHASABLE_TYPES.includes(listing.type) && listing.status === LISTING_STATUS.ACTIVE;
 const getStatusConfig = status => {
 switch (status) {
 case LISTING_STATUS.ACTIVE:
 return {
 cls: 'bg-primary text-white font-semibold',
 label: 'Active'
 };
 case LISTING_STATUS.SOLD:
 return {
 cls: 'bg-background-secondary text-status-error-text font-semibold',
 label: 'Sold'
 };
 case LISTING_STATUS.PENDING:
 return {
 cls: 'bg-background-secondary text-status-warning-text font-semibold',
 label: 'Pending'
 };
 default:
 return {
 cls: 'bg-background-tertiary text-text-secondary font-semibold',
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
 const roundedForStars = shouldShowReviews ? Math.round(averageRating || 5) : 0;
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
 bg-background-primary rounded-md
 border transition duration-200 ease-out

 ${isOutOfStock ? 'opacity-55' : ''}
 ${isSelectable && isInShowcase ? 'opacity-40 grayscale cursor-not-allowed' : ''}
 ${isSelected ? 'border-primary ring-2 ring-primary/20' : isInCompare ? 'border-primary ring-2 ring-primary-200' : 'border-border-light/80 hover:border-card-border-hover'}
 `}>
 {isSelectable && <div className="absolute inset-0 z-40 cursor-pointer" onClick={e => {
 e.preventDefault();
 e.stopPropagation();
 onSelectToggle?.(listing.id);
 }} />}

 {/* Top-right action buttons */}
 <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all duration-200 md:translate-x-2">
 {showActions && <ListingCardActions listing={listing} onChanged={onDeleted} />}
 <FavoriteButton listingId={listing.id} listing={listing} initialIsFavorited={listing.favoriteStats?.isFavorited ?? listing.favoriteStats?.favorited ?? false} initialCount={cardFavoriteCount} size="sm" showCount={false} />
 {canAddToCart && <button onClick={e => {
 e.preventDefault();
 e.stopPropagation();
 if (!itemIsInCart) {
 addToCart(listing.id);
 }
 }} disabled={isAddingToCart || itemIsInCart} className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-colors ${
 itemIsInCart
 ? 'bg-background-secondary text-status-success-text cursor-default'
 : 'bg-background-primary/90 text-text-tertiary hover:text-primary hover:bg-background-primary'
 }`} title={itemIsInCart ? t("in_cart") : t("add_to_cart")}>
 {isAddingToCart ? (
 <div className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
 ) : itemIsInCart ? (
 <Check className="w-3.5 h-3.5 text-status-success" />
 ) : (
 <ShoppingBag className="w-3.5 h-3.5" />
 )}
 </button>}
 {canMakeOffer && <button onClick={e => {
 e.preventDefault();
 e.stopPropagation();
 setIsOfferModalOpen(true);
 }} className="w-8 h-8 rounded bg-background-primary shadow-sm flex items-center justify-center text-text-tertiary hover:text-status-success hover:bg-background-primary transition-colors" title={t("make_offer")}>
 <HandCoins className="w-3.5 h-3.5" />
 </button>}
 <AddToListButton listingId={listing.id} listingTitle={listing.title} size="sm" />
 <CompareButton listing={listing} size="sm" />
 </div>

 {/* Image */}
 <div className="relative aspect-4/3 bg-background-tertiary overflow-hidden rounded-t-md">
 {listing.imageUrl ? <img src={optimizeCloudinaryUrl(listing.imageUrl, {
 width: 400,
 height: 300
 })} alt={listing.title} loading={priorityImage ? 'eager' : 'lazy'} fetchPriority={priorityImage ? 'high' : 'auto'} decoding="async" className="w-full h-full object-cover transition-transform duration-200 ease-out motion-reduce:transition-none" onError={e => {
 e.target.style.display = 'none';
 e.target.nextSibling.style.display = 'flex';
 }} /> : null}
 <div className={`w-full h-full flex flex-col items-center justify-center text-secondary-300 bg-background-tertiary ${listing.imageUrl ? 'hidden' : 'flex'}`}>
 <ImageIcon className="w-8 h-8" />
 </div>

 {/* Gradient overlay */}
 <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

  {/* Top-left badges */}
  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 items-start">
  {listing.status !== LISTING_STATUS.ACTIVE && <span className={`inline-flex px-2 py-0.5 rounded-sm text-xs font-semibold ${statusConfig.cls}`}>
  {statusConfig.label}
  </span>}
  {isInShowcase && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-status-warning text-white">
  <Zap className="w-3 h-3 fill-current text-white" />{t("featured")}</span>}
  {isGreatSeller && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-background-secondary text-status-warning-text border border-border">
  <Award className="w-3 h-3 shrink-0 text-status-warning-text" />{t("great_seller")}</span>}
  {hasCampaign && discountPct > 0 && <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-status-error text-white ">
  <TrendingDown className="w-3 h-3" />
  -{discountPct}%
  </span>}
  </div>

  {/* Quick View */}
  <button onClick={e => {
  e.preventDefault();
  e.stopPropagation();
  setShowInfo(true);
  }} className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded bg-background-primary text-xs font-semibold text-text-secondary shadow-md opacity-0 group-hover:opacity-100 translate-y-2 transition-all duration-300 hover:bg-primary hover:text-white flex items-center gap-1.5 whitespace-nowrap">
  <Eye className="w-3 h-3" />{t("quick_view")}</button>
  </div>

  {/* Body */}
  <Link to={ROUTES.LISTING_DETAIL(listing.id)} className="flex-1 flex flex-col p-3.5">

  {/* Title */}
  <h3 className={`text-sm font-medium text-text-primary line-clamp-2 mb-1.5 group- transition-colors ${isOutOfStock ? 'line-through ' : ''}`}>
  {listing.title}
  </h3>

  {/* Reviews: en az bir değerlendirme veya puan varsa göster */}
  {shouldShowReviews && <div className="flex items-center gap-1.5 mb-1.5 min-h-4">
  <div className="flex shrink-0" aria-hidden>
  {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-3 h-3 ${star <= roundedForStars ? 'text-status-warning fill-current' : 'text-secondary-200'}`} />)}
  </div>
  <span className="text-xs text-text-tertiary tabular-nums leading-none">
  <span className="font-medium text-text-secondary">{averageRating > 0 ? averageRating.toFixed(1) : '5.0'}</span>
  {reviewCount > 0 && <span className="text-text-muted"> ({reviewCount})</span>}
  </span>
  </div>}

  {/* Price row */}
  <div className="flex items-end gap-2 flex-wrap mb-1">
  <span className={`text-base font-semibold text-text-primary tracking-tight ${isOutOfStock ? 'line-through text-text-muted' : ''}`}>
  {formatCurrency(displayPrice, listing.currency)}
  </span>
  {hasCampaign && <span className="text-xs text-text-muted line-through font-medium">
  {formatCurrency(listing.price, listing.currency)}
  </span>}
  </div>

  {/* Campaign tag */}
  {hasCampaign && <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-sm bg-background-secondary text-status-error-text text-xs font-semibold border border-border mb-1.5">
  {listing.campaignName || 'Campaign'}
  </span>}

  {/* Stock badge & Sequential Social Proof Micro-Story */}
  <div className="flex flex-wrap items-center gap-1.5 mb-1.5 min-h-5">
    {hasStockInfo && <span className={`self-start inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold shrink-0 ${isOutOfStock ? 'bg-background-secondary text-status-error-text border border-border' : isLowStock ? 'bg-background-secondary text-status-warning-text border border-border' : 'bg-background-secondary text-text-tertiary border border-border-light'}`}>
      {isOutOfStock ? 'Out of stock' : isLowStock && !isOwner ? `Only ${Number(listing.quantity)} left` : `${Number(listing.quantity)} in stock`}
    </span>}

    {/* Dynamic Sequential Micro-Story Ticker */}
    {currentStory && (
      <span
        key={currentStory.id}
        className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold transition-all duration-300 transform scale-100 ${currentStory.bg}`}
      >
        {currentStory.icon}
        <span>{currentStory.text}</span>
      </span>
    )}
  </div>

 {/* Description */}
 {listing.description && <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-2">
 {listing.description}
 </p>}

 {/* Footer */}
 <div className="mt-auto pt-2.5 border-t border-border-light flex items-center justify-between gap-2">
 {listing.sellerName ? <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
 <div className="w-5 h-5 shrink-0 rounded bg-primary-50 flex items-center justify-center text-xs font-semibold text-primary">
 {listing.sellerName[0]?.toUpperCase()}
 </div>
 <span className="text-xs font-medium text-text-tertiary truncate max-w-20" title={isGreatSeller ? 'Great Seller' : listing.sellerName}>
 {listing.sellerName}
 </span>
 {isGreatSeller && <Award className="w-3 h-3 text-status-warning shrink-0" aria-label={t("great_seller")} />}
 </div> : <div />}
 <div className="flex items-center gap-2.5 ml-auto">
 {listing.city && <div className="flex items-center gap-0.5 text-xs text-text-muted">
 <MapPin className="w-2.5 h-2.5 shrink-0" />
 <span className="truncate max-w-14">{listing.city}</span>
 </div>}
 <div className="flex items-center gap-0.5 text-xs text-text-muted">
 <Heart className="w-2.5 h-2.5 shrink-0 fill-current" />
 <span>{cardFavoriteCount}</span>
 </div>
 </div>
 </div>
 </Link>

 <ListingInfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} listing={listing} displayPrice={displayPrice} isOwner={isOwner} isInShowcase={isInShowcase} />

 <MakeOfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} listing={listing} />
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