import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useListingData } from '../hooks/useListingData.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingFavoriteStats from '../../favorites/components/ListingFavoriteStats.jsx';
import ListingCardActions from '../components/ListingCardActions.jsx';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ComplaintButton from '../../complaint/components/ComplaintButton.jsx';
import ListingReviewsSection from '../../reviews/components/ListingReviewsSection.jsx';
import { listingTypeRegistry } from '../components/typeRegistry.js';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';

const ListingDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { listing, isLoading, error, refetch: fetchListing } = useListingData(id);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!listing) return null;

  const isOwner = isAuthenticated && user?.id === listing?.sellerId;

  return (
      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-bg rounded-card shadow-card-lg border border-card-border p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-card-text-primary">{listing.title}</h1>
              {!isOwner ? (
                  <FavoriteButton listingId={listing.id} listing={listing} size="lg" showCount={true} />
              ) : (
                  <ListingCardActions listing={listing} onChanged={fetchListing} />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-card-text-muted mb-4">
              <span>{listing.district}, {listing.city}</span>
              <span className="font-semibold text-highlight">{formatCurrency(listing.price, listing.currency)}</span>
              <span>{formatDateTime(listing.createdAt)}</span>
              {listing.listingNo && <span className="bg-gray-100 text-card-text-secondary px-2 py-1 rounded-full text-xs">#{listing.listingNo}</span>}
            </div>

            <p className="text-card-text-secondary text-base leading-relaxed">{listing.description}</p>

            {(() => {
              const cfg = listingTypeRegistry[listing.type];
              if (!cfg?.detailsComponent) return null;
              const Details = cfg.detailsComponent;
              return <Details listing={listing} />;
            })()}
          </div>

          {/* Seller Reviews Section */}
          <ListingReviewsSection listingId={listing.id} />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card-bg rounded-card-2xl shadow-card-lg border p-6 sticky top-4 space-y-6">
            <h3 className="text-xl font-semibold text-card-text-primary">Seller Information</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-lg font-medium text-white">
                {listing.sellerName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <Link to={ROUTES.USER_PROFILE(listing.sellerId)} className="block font-semibold text-card-text-primary hover:text-btn-primary">
                  {listing.sellerName} {listing.sellerSurname}
                </Link>
                <p className="text-sm text-card-text-muted">Member since: {user.accountCreationDate}</p>
              </div>
            </div>

            {!isOwner && (
                <div className="flex gap-4 mt-3 text-card-text-secondary">
                  <ContactSellerButton listing={listing} iconOnly />
                  <ComplaintButton
                      targetUserId={listing.sellerId}
                      targetUserName={`${listing.sellerName} ${listing.sellerSurname}`}
                      listingId={listing.id}
                      iconOnly
                  />
                </div>
            )}

            <div className="pt-6 border-t border-sidebar-border space-y-2">
              <h4 className="font-medium text-card-text-primary mb-2">Listing Stats</h4>
              <div className="flex justify-between text-sm text-card-text-secondary"><span>Listing No:</span><span className="font-medium">{listing.listingNo || 'N/A'}</span></div>
              <div className="flex justify-between text-sm text-card-text-secondary"><span>Views:</span><span className="font-medium">-</span></div>
              <div className="flex justify-between text-sm text-card-text-secondary items-center">
                <span>Favorites:</span>
                <ListingFavoriteStats listing={listing} size="sm" showIcon showText />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ListingDetailPage;
