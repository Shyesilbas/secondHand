import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingFavoriteStats from '../../favorites/components/ListingFavoriteStats.jsx';
import ListingReviewStats from '../../reviews/components/ListingReviewStats.jsx';
import ListingCardActions from './ListingCardActions.jsx';
import AddToCartButton from '../../cart/components/AddToCartButton.jsx';
import ListingInfoModal from './ListingInfoModal.jsx';
import usePriceHistory from '../hooks/usePriceHistory.js';
import { formatCurrency } from '../../common/formatters.js';
import { LISTING_STATUS } from '../types/index.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useShowcase } from '../../showcase/hooks/useShowcase.js';

const ListingCard = memo(({ listing, onDeleted }) => {
    const { priceHistory } = usePriceHistory(listing?.id);
    const [showInfo, setShowInfo] = useState(false);
    const { user } = useAuth();
    const { showcases } = useShowcase();

    

    if (!listing) return null;

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case LISTING_STATUS.ACTIVE: return 'bg-green-100 text-green-800';
            case LISTING_STATUS.SOLD: return 'bg-red-100 text-red-800';
            case LISTING_STATUS.INACTIVE: return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const canShowCartButton =
        listing.sellerId &&
        user?.id &&
        listing.sellerId !== user.id &&
        listing.status === 'ACTIVE' &&
        !['VEHICLE', 'REAL_ESTATE'].includes(listing.type);

    const isInShowcase = Array.isArray(showcases) && showcases.some(s => (s.listing?.id || s.listingId) === listing.id);


    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-200 group flex flex-col h-full">
            {/* Image */}
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                {listing.imageUrl ? (
                    <img 
                        src={listing.imageUrl} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${listing.imageUrl ? 'hidden' : 'flex'}`}>
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                
                {/* Badges overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(listing.status)}`}>
                        {listing.status}
                    </span>
                    {isInShowcase && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            ★
                        </span>
                    )}
                </div>
                
                {/* Top right overlay buttons */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <ListingCardActions listing={listing} onChanged={onDeleted} />
                    <FavoriteButton
                        listingId={listing.id}
                        listing={listing}
                        initialIsFavorited={listing.favoriteStats?.isFavorited ?? listing.favoriteStats?.favorited ?? false}
                        initialCount={listing.favoriteStats?.favoriteCount ?? 0}
                        size="sm"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <Link to={ROUTES.LISTING_DETAIL(listing.id)} className="block group-hover:text-gray-900 flex-1">
                    {/* Title and Listing No */}
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors flex-1">
                            {listing.title}
                        </h3>
                        {listing.listingNo && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2 flex-shrink-0 font-medium">
                                #{listing.listingNo}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                        {listing.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(listing.price, listing.currency)}
                        </span>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowInfo(true); }}
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            title="Info"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                            </svg>
                        </button>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate font-medium">{listing.district}, {listing.city}</span>
                    </div>
                </Link>

                {/* Footer */}
                <div className="border-t border-gray-100 pt-3 mt-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                                <span className="text-gray-700 font-semibold text-xs">{listing.sellerName?.[0]?.toUpperCase()}</span>
                            </div>
                            <span className="text-xs font-medium text-gray-700 truncate max-w-20">
                                {listing.sellerName}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            {canShowCartButton && <AddToCartButton listing={listing} size="xs" />}
                        </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-2">
                        <ListingFavoriteStats listing={listing} size="xs" showIcon showText />
                        {!['VEHICLE', 'REAL_ESTATE'].includes(listing.type) && (
                            <ListingReviewStats listingId={listing.id} size="xs" showIcon showText />
                        )}
                    </div>
                </div>
            </div>

            <ListingInfoModal
                isOpen={showInfo}
                onClose={() => setShowInfo(false)}
                listingId={listing.id}
                listingTitle={listing.title}
                price={listing.price}
                currency={listing.currency}
            />
        </div>
    );
});

ListingCard.displayName = 'ListingCard';

export default ListingCard;
