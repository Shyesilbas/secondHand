import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import FavoriteStats from '../../favorites/components/FavoriteStats.jsx';
import ListingCardActions from './ListingCardActions.jsx';
import { formatCurrency } from '../../common/formatters.js';

const ListingCard = ({ listing, onDeleted }) => {
    const formatPrice = (price, currency) => formatCurrency(price, currency);

    return (
        <div className="group bg-card-bg rounded-2xl shadow-card hover:shadow-card-lg border border-card-border hover:border-card-border-hover overflow-hidden transition-all duration-300">

            <Link to={ROUTES.LISTING_DETAIL(listing.id)} className="block p-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold text-card-text-primary line-clamp-1">
                        {listing.title}
                    </h3>
                    <p className="text-card-text-secondary text-sm line-clamp-2">
                        {listing.description}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex flex-col">
              <span className="text-xl font-extrabold text-btn-primary">
                {formatPrice(listing.price, listing.currency)}
              </span>
                            <span className="text-sm text-card-text-muted">
                {listing.city}, {listing.district}
              </span>
                        </div>
                        <FavoriteButton listingId={listing.id} listing={listing} size="md" showCount />
                    </div>
                </div>
            </Link>

            <div className="flex justify-between items-center p-3 border-t border-card-border bg-card-bg/70">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-card-text-muted">
                    <span className="truncate">{listing.sellerName} {listing.sellerSurname}</span>
                    <FavoriteStats listingId={listing.id} size="sm" showIcon showText />
                    <span className="hidden sm:inline">#{listing.listingNo}</span>
                </div>
                <ListingCardActions listing={listing} onChanged={onDeleted} />
            </div>
        </div>
    );
};

export default ListingCard;
