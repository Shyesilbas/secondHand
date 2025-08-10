import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

const ListingCard = ({ listing }) => {
    const formatPrice = (price, currency) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency === 'TRY' ? 'TRY' : 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getListingTypeIcon = (type) => {
        switch (type) {
            case 'VEHICLE':
                return (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                );
        }
    };

    const getVehicleDetails = (listing) => {
        if (listing.type === 'VEHICLE') {
            return (
                <div className="text-sm text-gray-600 mt-2">
                    <div className="flex flex-wrap gap-2">
                        {listing.brand && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {listing.brand}
              </span>
                        )}
                        {listing.year && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                {listing.year}
              </span>
                        )}
                        {listing.mileage && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                {listing.mileage.toLocaleString('tr-TR')} km
              </span>
                        )}
                        {listing.fuelType && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                {listing.fuelType}
              </span>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
            {/* Header */}
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 mb-2">
                        {getListingTypeIcon(listing.type)}
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {listing.type === 'VEHICLE' ? 'Araç' : 'Ürün'}
            </span>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                            {formatPrice(listing.price, listing.currency)}
                        </div>
                    </div>
                </div>

                {/* Title */}
                <Link
                    to={ROUTES.LISTING_DETAIL.replace(':id', listing.id)}
                    className="block"
                >
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                        {listing.title}
                    </h3>
                </Link>

                {/* Description */}
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                    {listing.description}
                </p>

                {/* Vehicle specific details */}
                {getVehicleDetails(listing)}

                {/* Location and Date */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
              {listing.district && listing.city
                  ? `${listing.district}, ${listing.city}`
                  : listing.city || 'Konum belirtilmemiş'
              }
            </span>
                    </div>
                    <div className="text-xs text-gray-400">
                        {formatDate(listing.createdAt)}
                    </div>
                </div>

                {/* Seller Info */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {listing.sellerName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {listing.sellerName} {listing.sellerSurname}
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                listing.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : listing.status === 'SOLD'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
            }`}>
              {listing.status === 'ACTIVE' && 'Aktif'}
                {listing.status === 'SOLD' && 'Satıldı'}
                {listing.status === 'DRAFT' && 'Taslak'}
                {listing.status === 'PENDING' && 'Beklemede'}
            </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingCard;