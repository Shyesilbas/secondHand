import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingService } from '../../features/listings/services/listingService';
import { useAuth } from '../../context/AuthContext';
import FavoriteButton from '../../features/favorites/components/FavoriteButton';
import FavoriteStats from '../../features/favorites/components/FavoriteStats';

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        const data = await listingService.getListingById(id);
        setListing(data);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching the listing. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOwner = isAuthenticated && user?.id === listing?.sellerId;

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
          <h3 className="text-lg font-medium text-gray-900 mb-2">İlan bulunamadı</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Geri Dön
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
          Geri Dön
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
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Düzenle
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                Sil
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Price */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <FavoriteStats 
                  listingId={listing.id}
                  size="sm"
                  showIcon={true}
                  showText={true}
                  className="text-gray-600"
                />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {formatPrice(listing.price, listing.currency)}
                </div>
                <div className="flex items-center justify-end mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    listing.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : listing.status === 'SOLD'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {listing.status === 'ACTIVE' && 'Active'}
                    {listing.status === 'SOLD' && 'Sold'}
                    {listing.status === 'DRAFT' && 'Draft'}
                    {listing.status === 'PENDING' && 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed">{listing.description}</p>
            </div>
          </div>

          {/* Vehicle Details (if vehicle) */}
          {listing.type === 'VEHICLE' && (
            <VehicleDetails listing={listing} />
          )}

          {/* General Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Listing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Created At" value={formatDate(listing.createdAt)} />
              <DetailItem label="Last Update" value={formatDate(listing.updatedAt)} />
              <DetailItem label="Province" value={`${listing.district}, ${listing.city}`} />
              <DetailItem label="Listing Fee" value={listing.listingFeePaid ? 'Paid' : 'Unpaid'} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Seller Information</h3>
            
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {listing.sellerName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-900">
                  {listing.sellerName} {listing.sellerSurname}
                </p>
                <p className="text-sm text-gray-500">
                  Seller
                </p>
              </div>
            </div>

            {!isOwner && (
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Contact Seller
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Listing Statics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Listing No:</span>
                  <span className="font-medium">{listing.listingNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vehicle Details Component
const VehicleDetails = ({ listing }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DetailItem label="Marka" value={listing.brand} />
      <DetailItem label="Model" value={listing.model} />
      <DetailItem label="Yıl" value={listing.year} />
      <DetailItem label="Kilometre" value={listing.mileage ? `${listing.mileage.toLocaleString('tr-TR')} km` : '-'} />
      <DetailItem label="Motor Hacmi" value={listing.engineCapacity ? `${listing.engineCapacity} cc` : '-'} />
      <DetailItem label="Vites" value={listing.gearbox} />
      <DetailItem label="Yakıt Türü" value={listing.fuelType} />
      <DetailItem label="Renk" value={listing.color} />
      <DetailItem label="Kapı Sayısı" value={listing.doors} />
      <DetailItem label="Koltuk Sayısı" value={listing.seatCount} />
      <DetailItem label="Beygir Gücü" value={listing.horsePower ? `${listing.horsePower} HP` : '-'} />
      <DetailItem label="Yakıt Tüketimi" value={listing.fuelConsumption ? `${listing.fuelConsumption} L/100km` : '-'} />
    </div>
  </div>
);

// Detail Item Component
const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
  </div>
);

export default ListingDetailPage;