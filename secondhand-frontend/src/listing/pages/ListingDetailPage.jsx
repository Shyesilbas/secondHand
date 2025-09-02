import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingService } from '../services/listingService.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import FavoriteStats from '../../favorites/components/FavoriteStats.jsx';
import StatusBadge from '../../common/components/ui/StatusBadge.jsx';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import ListingCardActions from '../components/ListingCardActions.jsx';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import { listingTypeRegistry } from '../components/typeRegistry.js';

const ListingDetailPage = ({
                             service = listingService,
                             serviceMethod = 'getListingById',
                             type = null,
                             entityName = 'listing',
                             entityNameCapitalized = 'Listing'
                           }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListing = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await service[serviceMethod](id);
      setListing(data);
    } catch (err) {
      setError(err.response?.data?.message || `An error occurred while fetching the ${entityName}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  }, [id, service, serviceMethod, entityName]);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id, fetchListing]);

  const formatPrice = (price, currency) => formatCurrency(price, currency);
  const formatDate = (dateString) => formatDateTime(dateString);

  const isOwner = isAuthenticated && user?.id === listing?.sellerId;

  const renderStatusBadge = (status) => (
      <StatusBadge status={status} />
  );

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{entityNameCapitalized} not found</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
                onClick={() => navigate(-1)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>

          <div className="flex items-center space-x-2">
            {!isOwner && (
                <FavoriteButton
                    listingId={listing.id}
                    listing={listing}
                    size="lg"
                    showCount={true}
                />
            )}
            {isOwner && (
                <ListingCardActions listing={listing} onChanged={() => fetchListing()} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  {listing.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {listing.district}, {listing.city}
                  </span>

                  <span className="flex items-center gap-2 text-lg font-semibold text-emerald-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                    {formatPrice(listing.price, listing.currency)}
                  </span>

                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(listing.createdAt)}
                  </span>
                  {listing.listingNo && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      #{listing.listingNo}
                    </span>
                  )}
                </div>
              </div>

              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 text-base md:text-lg leading-relaxed font-normal">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Type-specific Details */}
            {(() => {
              const listingType = type || listing.type;
              const cfg = listingTypeRegistry[listingType];
              if (!cfg?.detailsComponent) return null;
              const Details = cfg.detailsComponent;
              return <Details listing={listing} />;
            })()}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Seller Information</h3>

              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {listing.sellerName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-medium text-gray-900">
                    {listing.sellerName} {listing.sellerSurname}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since : {user.accountCreationDate}
                  </p>
                </div>
              </div>

              {!isOwner && (
                  <div className="space-y-3">
                    <ContactSellerButton
                        listing={listing}
                        className="w-full py-3 px-4 text-base font-medium"
                    />
                  </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Listing Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Listing No:</span>
                    <span className="font-medium">{listing.listingNo || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Views:</span>
                    <span className="font-medium">-</span>
                  </div>
                  <FavoriteStats
                      listingId={listing.id}
                      size="sm"
                      showIcon={true}
                      showText={true}
                      className="text-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

// Detail Item Component
const DetailItem = ({ label, value }) => (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
    </div>
);

export default ListingDetailPage;