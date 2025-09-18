import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingFavoriteStats from '../../favorites/components/ListingFavoriteStats.jsx';
import ListingReviewStats from '../../reviews/components/ListingReviewStats.jsx';
import ListingCardActions from './ListingCardActions.jsx';
import AddToCartButton from '../../cart/components/AddToCartButton.jsx';
import PriceHistoryModal from './PriceHistoryModal.jsx';
import usePriceHistory from '../hooks/usePriceHistory.js';
import { formatCurrency } from '../../common/formatters.js';
import { LISTING_STATUS } from '../types/index.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useShowcase } from '../../showcase/hooks/useShowcase.js';

const ListingCard = memo(({ listing, onDeleted }) => {
    const [showPriceHistory, setShowPriceHistory] = useState(false);
    const { priceHistory, fetchPriceHistory } = usePriceHistory(listing?.id);
    const { user } = useAuth();
    const { showcases } = useShowcase();

    const handlePriceHistoryClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        fetchPriceHistory();
        setShowPriceHistory(true);
    }, [fetchPriceHistory]);

    const handleClosePriceHistory = useCallback(() => {
        setShowPriceHistory(false);
    }, []);

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
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between px-4 pt-4">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(listing.status)}`}>
                        {listing.status}
                    </span>
                    {isInShowcase && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 font-medium">
                            ⭐ This Listing is in Showcase!
                        </span>
                    )}
                </div>
                <FavoriteButton
                    listingId={listing.id}
                    listing={listing}
                    initialIsFavorited={listing.favoriteStats?.isFavorited ?? listing.favoriteStats?.favorited ?? false}
                    initialCount={listing.favoriteStats?.favoriteCount ?? 0}
                    size="md"
                />
            </div>

            <Link to={ROUTES.LISTING_DETAIL(listing.id)} className="block">
                <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {listing.title}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                            #{listing.listingNo}
                        </span>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                        {listing.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(listing.price, listing.currency)}
                                </span>
                                <button
                                    onClick={handlePriceHistoryClick}
                                    className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    title="View Price History"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         fill="none"
                                         viewBox="0 0 24 24"
                                         strokeWidth={1.5}
                                         stroke="currentColor"
                                         className="w-5 h-5">
                                        <path strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            </div>
                            {listing.createdAt && (
                                <span className="text-xs text-gray-400 mt-1">
                                    Created At: {listing.createdAt}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col items-end text-gray-500 text-sm">
                            <div>
                                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {listing.city}, {listing.district}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">{listing.sellerName?.[0]?.toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-24">
                            {listing.sellerName} {listing.sellerSurname}
                        </span>
                    </div>
                    <ListingFavoriteStats listing={listing} size="sm" showIcon showText />
                    <ListingReviewStats listingId={listing.id} size="sm" showIcon showText />
                </div>
                <div className="flex items-center space-x-2">
                    {canShowCartButton && <AddToCartButton listing={listing} size="sm" />}
                    <ListingCardActions listing={listing} onChanged={onDeleted} />
                </div>
            </div>

            <PriceHistoryModal
                isOpen={showPriceHistory}
                onClose={handleClosePriceHistory}
                priceHistory={priceHistory}
                listingTitle={listing.title}
            />
        </div>
    );
});

ListingCard.displayName = 'ListingCard';

export default ListingCard;
