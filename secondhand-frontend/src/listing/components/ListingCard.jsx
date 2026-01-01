import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingCardActions from './ListingCardActions.jsx';
import ListingInfoModal from './ListingInfoModal.jsx';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { LISTING_STATUS } from '../types/index.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useShowcase } from '../../showcase/hooks/useShowcase.js';
import { MapPin, Image as ImageIcon, Star, Eye, Heart, ShoppingBag, HandCoins } from 'lucide-react';
import { useCart } from '../../cart/hooks/useCart.js';
import MakeOfferModal from '../../offer/components/MakeOfferModal.jsx';

const ListingCard = memo(({ listing, onDeleted, showActions = true }) => {
    const [showInfo, setShowInfo] = useState(false);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const { user } = useAuth();
    const { showcases } = useShowcase();
    const { addToCart, isAddingToCart } = useCart({ loadCartItems: false });

    if (!listing) return null;

    const isOwner = user?.id === listing.sellerId;
    const canAddToCart = !isOwner && !['REAL_ESTATE', 'VEHICLE'].includes(listing.type) && listing.status === LISTING_STATUS.ACTIVE;
    const canMakeOffer = !isOwner && !['REAL_ESTATE', 'VEHICLE'].includes(listing.type) && listing.status === LISTING_STATUS.ACTIVE;

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case LISTING_STATUS.ACTIVE: return 'bg-emerald-500 text-white shadow-sm';
            case LISTING_STATUS.SOLD: return 'bg-red-500 text-white shadow-sm';
            case LISTING_STATUS.INACTIVE: return 'bg-gray-500 text-white shadow-sm';
            default: return 'bg-gray-500 text-white';
        }
    };

    const isInShowcase = Array.isArray(showcases) && showcases.some(s => (s.listing?.id || s.listingId) === listing.id);

    // Review stats
    const reviewCount = listing.reviewStats?.totalReviews || 0;
    const averageRating = listing.reviewStats?.averageRating || 0;
    const favoriteCount = listing.favoriteStats?.favoriteCount || 0;
    const hasCampaign = listing.campaignId && listing.campaignPrice != null && parseFloat(listing.campaignPrice) < parseFloat(listing.price);
    const displayPrice = hasCampaign ? listing.campaignPrice : listing.price;
    const isLowStock = listing.quantity != null && Number(listing.quantity) > 0 && Number(listing.quantity) < 10;
    const hasStockInfo = listing.quantity != null && Number.isFinite(Number(listing.quantity));

    return (
        <div className="group bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full relative">
            <div className="aspect-square bg-gray-50 relative border-b border-gray-100 rounded-t-md">
                <div className="absolute inset-0 overflow-hidden rounded-t-md">
                    {listing.imageUrl ? (
                        <img 
                            src={listing.imageUrl} 
                            alt={listing.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    
                    <div className={`w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50 ${listing.imageUrl ? 'hidden' : 'flex'}`}>
                        <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
                    </div>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
                    {listing.status !== LISTING_STATUS.ACTIVE && (
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${getStatusBadgeClass(listing.status)}`}>
                            {listing.status}
                        </span>
                    )}
                    {isInShowcase && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-white shadow-sm uppercase tracking-wider backdrop-blur-md">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Featured
                        </span>
                    )}
                </div>
                
                {/* Action Buttons Overlay (Top Right) */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform translate-x-2 group-hover:translate-x-0">
                    {showActions && <ListingCardActions listing={listing} onChanged={onDeleted} />}
                    {canMakeOffer && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsOfferModalOpen(true);
                            }}
                            className="bg-white/90 backdrop-blur hover:bg-white text-gray-700 hover:text-emerald-600 border-none h-7 w-7 rounded-full shadow-sm flex items-center justify-center transition-colors"
                            title="Make Offer"
                        >
                            <HandCoins className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {canAddToCart && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart(listing.id);
                            }}
                            disabled={isAddingToCart}
                            className="bg-white/90 backdrop-blur hover:bg-white text-gray-700 hover:text-indigo-600 border-none h-7 w-7 rounded-full shadow-sm flex items-center justify-center transition-colors"
                            title="Add to Cart"
                        >
                            <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <FavoriteButton
                        listingId={listing.id}
                        listing={listing}
                        initialIsFavorited={listing.favoriteStats?.isFavorited ?? listing.favoriteStats?.favorited ?? false}
                        initialCount={listing.favoriteStats?.favoriteCount ?? 0}
                        size="sm"
                        className="bg-white/90 backdrop-blur hover:bg-white text-gray-700 hover:text-red-500 border-none h-7 w-7 rounded-full shadow-sm flex items-center justify-center"
                    />
                </div>

                 {/* Quick View Button (Bottom Center) */}
                 <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowInfo(true); }}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold text-gray-900 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-black hover:text-white flex items-center gap-1"
                >
                    <Eye className="w-2.5 h-2.5" />
                    Quick View
                </button>
            </div>

            {/* Content */}
            <Link to={ROUTES.LISTING_DETAIL(listing.id)} className="flex-1 p-2.5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                        {listing.title}
                    </h3>
                </div>
                {/* Rating & Reviews */}
                {reviewCount > 0 && (
                    <div className="flex items-center gap-0.5 mb-1">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-2.5 h-2.5 ${star <= Math.round(averageRating) ? 'text-amber-400 fill-current' : 'text-gray-200'}`}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-gray-500 ml-0.5">({reviewCount})</span>
                    </div>
                )}

                <div className="mt-1">
                    <div className="flex items-end gap-1.5 flex-wrap">
                        <p className="text-sm font-bold text-gray-900 tracking-tight">
                            {formatCurrency(displayPrice, listing.currency)}
                        </p>
                        {hasCampaign && (
                            <p className="text-[10px] font-medium text-gray-500 line-through">
                                {formatCurrency(listing.price, listing.currency)}
                            </p>
                        )}
                        {hasStockInfo && (
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold border ${isLowStock ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                {isLowStock && !isOwner ? '🔥 Low stock!' : `Stock: ${Number(listing.quantity)}`}
                            </span>
                        )}
                    </div>
                    {hasCampaign && (
                        <div className="mt-0.5 inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                            <span>{listing.campaignName || 'Campaign'}</span>
                        </div>
                    )}
                    {listing.description && (
                        <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">
                            {listing.description}
                        </p>
                    )}
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {listing.sellerName && (
                            <div className="flex items-center gap-1 group/seller">
                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500 group-hover/seller:bg-indigo-100 group-hover/seller:text-indigo-600 transition-colors">
                                    {listing.sellerName[0]?.toUpperCase()}
                                </div>
                                <span className="text-[10px] font-medium text-gray-600 truncate max-w-[60px] group-hover/seller:text-indigo-600 transition-colors">
                                    {listing.sellerName}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-0.5 text-[10px] text-gray-500">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate max-w-[60px]">{listing.city}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-[9px] text-gray-400">
                            <Heart className="w-2 h-2 shrink-0 fill-current text-gray-300" />
                            <span>{favoriteCount} likes</span>
                        </div>
                    </div>
                </div>
            </Link>

            <ListingInfoModal
                isOpen={showInfo}
                onClose={() => setShowInfo(false)}
                listingId={listing.id}
                listingTitle={listing.title}
                price={displayPrice}
                currency={listing.currency}
            />

            <MakeOfferModal
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
                listing={listing}
            />
        </div>
    );
});

ListingCard.displayName = 'ListingCard';

export default ListingCard;
