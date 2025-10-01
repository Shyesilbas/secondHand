import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingFavoriteStats from '../../favorites/components/ListingFavoriteStats.jsx';
import ListingReviewStats from '../../reviews/components/ListingReviewStats.jsx';
import ListingCardActions from './ListingCardActions.jsx';
import AddToCartButton from '../../cart/components/AddToCartButton.jsx';
import PriceHistoryModal from './PriceHistoryModal.jsx';
import ExchangeRateModal from './ExchangeRateModal.jsx';
import usePriceHistory from '../hooks/usePriceHistory.js';
import { formatCurrency } from '../../common/formatters.js';
import { LISTING_STATUS } from '../types/index.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useShowcase } from '../../showcase/hooks/useShowcase.js';

const ListingCard = memo(({ listing, onDeleted }) => {
    const [showPriceHistory, setShowPriceHistory] = useState(false);
    const { priceHistory, fetchPriceHistory } = usePriceHistory(listing?.id);
    const [showExchange, setShowExchange] = useState(false);
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
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
            {/* Header with badges */}
            <div className="relative p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(listing.status)}`}>
                            {listing.status}
                        </span>
                        {isInShowcase && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 font-medium">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Featured
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
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors leading-tight">
                            {listing.title}
                        </h3>
                        {listing.listingNo && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg whitespace-nowrap ml-3 flex-shrink-0">
                                #{listing.listingNo}
                            </span>
                        )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {listing.description}
                    </p>

                    {/* Price and Location */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                                {formatCurrency(listing.price, listing.currency)}
                            </span>
                            <button
                                onClick={handlePriceHistoryClick}
                                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                title="View Price History"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowExchange(true); }}
                                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                title="View Exchange Rates"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10a4 4 0 004 4h6a3 3 0 100-6H9a3 3 0 110-6h6" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate max-w-32">{listing.district}, {listing.city}</span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-700 font-medium text-sm">{listing.sellerName?.[0]?.toUpperCase()}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700 truncate max-w-24">
                                {listing.sellerName} {listing.sellerSurname}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <ListingFavoriteStats listing={listing} size="sm" showIcon showText />
                            {!['VEHICLE', 'REAL_ESTATE'].includes(listing.type) && (
                                <ListingReviewStats listingId={listing.id} size="sm" showIcon showText />
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canShowCartButton && <AddToCartButton listing={listing} size="sm" />}
                        <ListingCardActions listing={listing} onChanged={onDeleted} />
                    </div>
                </div>
            </div>

            <PriceHistoryModal
                isOpen={showPriceHistory}
                onClose={handleClosePriceHistory}
                priceHistory={priceHistory}
                listingTitle={listing.title}
            />

            <ExchangeRateModal
                isOpen={showExchange}
                onClose={() => setShowExchange(false)}
                price={listing.price}
                currency={listing.currency}
            />
        </div>
    );
});

ListingCard.displayName = 'ListingCard';

export default ListingCard;
