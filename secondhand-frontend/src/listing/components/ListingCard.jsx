import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingCardActions from './ListingCardActions.jsx';
import ListingInfoModal from './ListingInfoModal.jsx';
import { formatCurrency } from '../../common/formatters.js';
import { LISTING_STATUS, NON_PURCHASABLE_TYPES } from '../types/index.js';
import { MapPin, Image as ImageIcon, Star, Eye, Heart, ShoppingBag, HandCoins, Zap, TrendingDown } from 'lucide-react';
import { useCart } from '../../cart/hooks/useCart.js';
import MakeOfferModal from '../../offer/components/MakeOfferModal.jsx';
import CompareButton from '../../comparison/components/CompareButton.jsx';
import { useComparison } from '../../comparison/hooks/useComparison.js';
import AddToListButton from '../../favoritelist/components/AddToListButton.jsx';

const ListingCard = ({ listing, onDeleted, showActions = true, isOwner, currentUserId, isInShowcase = false, priorityImage = false }) => {
    const [showInfo, setShowInfo] = useState(false);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const { addToCart, isAddingToCart } = useCart({ loadCartItems: false });
    const { isInComparison } = useComparison();

    if (!listing) return null;

    const isInCompare = isInComparison(listing.id);
    const isOutOfStock = listing.quantity != null && Number(listing.quantity) === 0;
    const canAddToCart = currentUserId && !isOwner && !NON_PURCHASABLE_TYPES.includes(listing.type) && listing.status === LISTING_STATUS.ACTIVE && !isOutOfStock;
    const canMakeOffer = currentUserId && !isOwner && !NON_PURCHASABLE_TYPES.includes(listing.type) && listing.status === LISTING_STATUS.ACTIVE;

    const getStatusConfig = (status) => {
        switch (status) {
            case LISTING_STATUS.ACTIVE: return { cls: 'bg-emerald-500 text-white', label: 'Active' };
            case LISTING_STATUS.SOLD: return { cls: 'bg-rose-500 text-white', label: 'Sold' };
            case LISTING_STATUS.INACTIVE: return { cls: 'bg-slate-400 text-white', label: 'Inactive' };
            default: return { cls: 'bg-slate-400 text-white', label: status };
        }
    };

    const reviewCount = Number(listing.reviewStats?.totalReviews) || 0;
    const avgRaw = Number(listing.reviewStats?.averageRating);
    const averageRating = Number.isFinite(avgRaw) ? avgRaw : 0;
    const roundedForStars = reviewCount > 0 ? Math.round(averageRating) : 0;
    const favoriteCount = listing.favoriteStats?.favoriteCount || 0;
    const hasCampaign = listing.campaignId && listing.campaignPrice != null && parseFloat(listing.campaignPrice) < parseFloat(listing.price);
    const displayPrice = hasCampaign ? listing.campaignPrice : listing.price;
    const isLowStock = listing.quantity != null && Number(listing.quantity) > 0 && Number(listing.quantity) < 10;
    const hasStockInfo = listing.quantity != null && Number.isFinite(Number(listing.quantity));
    const discountPct = hasCampaign
        ? Math.round((1 - parseFloat(listing.campaignPrice) / parseFloat(listing.price)) * 100)
        : 0;

    const statusConfig = getStatusConfig(listing.status);

    return (
        <div className={`
            group relative flex flex-col h-full
            bg-white rounded-2xl
            border transition-[transform,box-shadow,border-color] duration-200 ease-out
            hover:shadow-xl hover:-translate-y-1
            ${isOutOfStock ? 'opacity-55' : ''}
            ${isInCompare
                ? 'border-indigo-400 shadow-md shadow-indigo-100 ring-2 ring-indigo-100'
                : 'border-slate-200/80 shadow-sm hover:border-slate-300'}
        `}>

            {/* Top-right action buttons */}
            <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all duration-200 md:translate-x-2 md:group-hover:translate-x-0">
                {showActions && (
                    <ListingCardActions listing={listing} onChanged={onDeleted} />
                )}
                <FavoriteButton
                    listingId={listing.id}
                    listing={listing}
                    initialIsFavorited={listing.favoriteStats?.isFavorited ?? listing.favoriteStats?.favorited ?? false}
                    initialCount={listing.favoriteStats?.favoriteCount ?? 0}
                    size="sm"
                    showCount={false}
                />
                {canAddToCart && (
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(listing.id); }}
                        disabled={isAddingToCart}
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
                        title="Add to Cart"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                )}
                {canMakeOffer && (
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOfferModalOpen(true); }}
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-white transition-colors"
                        title="Make Offer"
                    >
                        <HandCoins className="w-3.5 h-3.5" />
                    </button>
                )}
                <AddToListButton listingId={listing.id} listingTitle={listing.title} size="sm" />
                <CompareButton listing={listing} size="sm" />
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden rounded-t-2xl">
                {listing.imageUrl ? (
                    <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        fetchPriority={priorityImage ? 'high' : 'auto'}
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-200 ease-out motion-reduce:transition-none motion-reduce:group-hover:scale-100 group-hover:scale-105"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div className={`w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100 ${listing.imageUrl ? 'hidden' : 'flex'}`}>
                    <ImageIcon className="w-8 h-8" />
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top-left badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                    {listing.status !== LISTING_STATUS.ACTIVE && (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusConfig.cls}`}>
                            {statusConfig.label}
                        </span>
                    )}
                    {isInShowcase && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-white shadow-sm">
                            <Zap className="w-2.5 h-2.5 fill-current" />
                            Featured
                        </span>
                    )}
                    {hasCampaign && discountPct > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-sm">
                            <TrendingDown className="w-2.5 h-2.5" />
                            -{discountPct}%
                        </span>
                    )}
                </div>

                {/* Quick View */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowInfo(true); }}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur text-[11px] font-semibold text-slate-700 shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-slate-900 hover:text-white flex items-center gap-1.5 whitespace-nowrap"
                >
                    <Eye className="w-3 h-3" />
                    Quick View
                </button>
            </div>

            {/* Body */}
            <Link to={ROUTES.LISTING_DETAIL(listing.id)} className="flex-1 flex flex-col p-3.5">

                {/* Title */}
                <h3 className={`text-[13px] font-semibold text-slate-800 line-clamp-2 leading-snug mb-1.5 group-hover:text-indigo-600 transition-colors ${isOutOfStock ? 'line-through text-slate-400' : ''}`}>
                    {listing.title}
                </h3>

                {/* Reviews: her zaman göster (API’de reviewStats yoksa 0 kabul) */}
                <div className="flex items-center gap-1.5 mb-1.5 min-h-[18px]">
                    <div className="flex shrink-0" aria-hidden>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-3 h-3 ${reviewCount > 0 && star <= roundedForStars ? 'text-amber-400 fill-current' : 'text-slate-200'}`}
                            />
                        ))}
                    </div>
                    <span className="text-[11px] text-slate-500 tabular-nums leading-none">
                        {reviewCount > 0 ? (
                            <>
                                <span className="font-medium text-slate-600">{averageRating.toFixed(1)}</span>
                                <span className="text-slate-400"> ({reviewCount})</span>
                            </>
                        ) : (
                            <span className="text-slate-400">0 reviews</span>
                        )}
                    </span>
                </div>

                {/* Price row */}
                <div className="flex items-end gap-2 flex-wrap mb-1">
                    <span className={`text-base font-bold text-slate-900 tracking-tight ${isOutOfStock ? 'line-through text-slate-400' : ''}`}>
                        {formatCurrency(displayPrice, listing.currency)}
                    </span>
                    {hasCampaign && (
                        <span className="text-[11px] text-slate-400 line-through font-medium">
                            {formatCurrency(listing.price, listing.currency)}
                        </span>
                    )}
                </div>

                {/* Campaign tag */}
                {hasCampaign && (
                    <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold border border-rose-100 mb-1.5">
                        {listing.campaignName || 'Campaign'}
                    </span>
                )}

                {/* Stock badge */}
                {hasStockInfo && (
                    <span className={`self-start inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold mb-1.5 ${
                        isOutOfStock
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : isLowStock
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-slate-50 text-slate-500 border border-slate-100'
                    }`}>
                        {isOutOfStock ? 'Out of stock' : isLowStock && !isOwner ? `🔥 Only ${Number(listing.quantity)} left` : `${Number(listing.quantity)} in stock`}
                    </span>
                )}

                {/* Description */}
                {listing.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                        {listing.description}
                    </p>
                )}

                {/* Footer */}
                <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    {listing.sellerName && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                                {listing.sellerName[0]?.toUpperCase()}
                            </div>
                            <span className="text-[11px] font-medium text-slate-500 truncate max-w-[64px]">
                                {listing.sellerName}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2.5 ml-auto">
                        {listing.city && (
                            <div className="flex items-center gap-0.5 text-[11px] text-slate-400">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate max-w-[56px]">{listing.city}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-0.5 text-[11px] text-slate-400">
                            <Heart className="w-2.5 h-2.5 shrink-0 fill-current" />
                            <span>{favoriteCount}</span>
                        </div>
                    </div>
                </div>
            </Link>

            <ListingInfoModal
                isOpen={showInfo}
                onClose={() => setShowInfo(false)}
                listing={listing}
                displayPrice={displayPrice}
                isOwner={isOwner}
                isInShowcase={isInShowcase}
            />

            <MakeOfferModal
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
                listing={listing}
            />
        </div>
    );
};

ListingCard.displayName = 'ListingCard';

export default memo(ListingCard, (prevProps, nextProps) =>
    prevProps.listing === nextProps.listing &&
    prevProps.isOwner === nextProps.isOwner &&
    prevProps.currentUserId === nextProps.currentUserId &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.isInShowcase === nextProps.isInShowcase &&
    prevProps.priorityImage === nextProps.priorityImage
);
