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
import ShowcaseButton from '../../showcase/components/ShowcaseButton.jsx';
import { listingTypeRegistry } from '../components/typeRegistry.js';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { useShowcase } from '../../showcase/hooks/useShowcase.js';

const ListingDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { listing, isLoading, error, refetch: fetchListing } = useListingData(id);
  const { showcases } = useShowcase();

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!listing) return null;

  const isOwner = isAuthenticated && user?.id === listing?.sellerId;
  const isInShowcase = Array.isArray(showcases) && showcases.some(s => (s.listing?.id || s.listingId) === listing.id);

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Link 
                    to={ROUTES.LISTINGS} 
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Listings
                  </Link>
                  {listing.listingNo && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      #{listing.listingNo}
                    </span>
                  )}
                  {isInShowcase && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Featured
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{listing.title}</h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {listing.district}, {listing.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {formatDateTime(listing.createdAt)}
                  </span>
                </div>
              </div>
              <div className="ml-6">
                {!isOwner ? (
                    <FavoriteButton listingId={listing.id} listing={listing} size="lg" showCount={true} />
                ) : (
                    <ListingCardActions listing={listing} onChanged={fetchListing} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Price Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{formatCurrency(listing.price, listing.currency)}</h2>
                    <p className="text-sm text-gray-500 mt-1">Asking price</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Status</div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      listing.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                </div>
              </div>

              {/* Details Section */}
              {(() => {
                const cfg = listingTypeRegistry[listing.type];
                if (!cfg?.detailsComponent) return null;
                const Details = cfg.detailsComponent;
                return (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <Details listing={listing} />
                  </div>
                );
              })()}

              {/* Reviews Section */}
              <ListingReviewsSection listingId={listing.id} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Seller Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
                      {listing.sellerName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={ROUTES.USER_PROFILE(listing.sellerId)} 
                        className="block font-semibold text-gray-900 hover:text-gray-700 transition-colors truncate"
                      >
                        {listing.sellerName} {listing.sellerSurname}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">Verified Seller</p>
                    </div>
                  </div>

                  {!isOwner && (
                    <div className="mt-6 space-y-3">
                      <ContactSellerButton listing={listing} />
                      <div className="flex gap-2">
                        <ComplaintButton
                          targetUserId={listing.sellerId}
                          targetUserName={`${listing.sellerName} ${listing.sellerSurname}`}
                          listingId={listing.id}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

                  {isOwner && !isInShowcase && (
                    <div className="mt-6">
                      <ShowcaseButton listingId={listing.id} onSuccess={fetchListing} />
                    </div>
                  )}
                </div>

                {/* Listing Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Listing Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-600">Listing No</span>
                      <span className="text-sm font-medium text-gray-900">{listing.listingNo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-600">Views</span>
                      <span className="text-sm font-medium text-gray-900">-</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Favorites</span>
                      <ListingFavoriteStats listing={listing} size="sm" showIcon showText />
                    </div>
                  </div>
                </div>

                {/* Safety Tips */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Safety Tips</h4>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <svg className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Meet in public places
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Inspect items thoroughly
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Use secure payment methods
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ListingDetailPage;
