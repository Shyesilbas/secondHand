import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehicle } from '../../features/vehicles/hooks/useVehicle';
import { useAuth } from '../../context/AuthContext';
import { useEnums } from '../../hooks/useEnums';
import FavoriteButton from '../../features/favorites/components/FavoriteButton';
import FavoriteStats from '../../features/favorites/components/FavoriteStats';
import { VehicleListingDTO } from '../../types/vehicles';
import { ROUTES } from '../../constants/routes';
import { listingService } from '../../features/listings/services/listingService';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { vehicle, isLoading, error, fetchVehicle } = useVehicle(id);
  const { enums } = useEnums();

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

  const getEnumLabel = (enumArray, value) => {
    const item = enumArray?.find(item => item.value === value);
    return item?.label || value;
  };

  const isOwner = isAuthenticated && user?.id === vehicle?.sellerId;

  const handleEdit = () => {
    if (vehicle?.type === 'VEHICLE') {
      navigate(ROUTES.VEHICLE_EDIT.replace(':id', vehicle.id));
    }
  };

  const handleDelete = async () => {
    if (!isOwner || !vehicle) return;
    if (!confirm('İlanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    try {
      await listingService.deleteListing(vehicle.id);
      navigate(-1);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Silme sırasında bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Araç İlanı Bulunamadı</h2>
          <p className="mt-2 text-gray-600">Aradığınız araç ilanı mevcut değil.</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Geri Dön
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Price */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{vehicle.title}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-lg text-gray-600">
                    {getEnumLabel(enums.carBrands, vehicle.brand)} {vehicle.model} • {vehicle.year}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                <FavoriteStats 
                  listingId={vehicle.id}
                  size="sm"
                  showIcon={true}
                  showText={true}
                  className="text-gray-600"
                />
                {isOwner && vehicle.status !== 'SOLD' && (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                    title="Düzenle"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m2 0h2m-6 4h6m-6 4h6m-6 4h6M7 7h.01M7 11h.01M7 15h.01" />
                    </svg>
                    <span>Düzenle</span>
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                    title="Sil"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    <span>Sil</span>
                  </button>
                )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {formatPrice(vehicle.price, vehicle.currency)}
                </div>
                <div className="flex items-center justify-end mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    vehicle.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : vehicle.status === 'SOLD'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vehicle.status === 'ACTIVE' && 'Aktif'}
                    {vehicle.status === 'SOLD' && 'Satıldı'}
                    {vehicle.status === 'DRAFT' && 'Taslak'}
                    {vehicle.status === 'PENDING' && 'Beklemede'}
                  </span>
                </div>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed">{vehicle.description}</p>
            </div>
          </div>

          {/* Vehicle Technical Details */}
          <VehicleTechnicalDetails vehicle={vehicle} enums={enums} />

          {/* Vehicle Performance Details */}
          <VehiclePerformanceDetails vehicle={vehicle} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Seller Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Satıcı Bilgileri</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Ad Soyad:</span>
                <p className="font-medium">{vehicle.sellerName} {vehicle.sellerSurname}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Konum:</span>
                <p className="font-medium">{vehicle.district}, {vehicle.city}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">İlan Tarihi:</span>
                <p className="font-medium">{formatDate(vehicle.createdAt)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            {isAuthenticated && !isOwner && (
              <div className="mt-6 space-y-3">
                <FavoriteButton listingId={vehicle.id} />
                <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Satıcıyla İletişime Geç
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">İlan İstatistikleri</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">İlan No:</span>
                  <span className="font-medium">{vehicle.listingNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Güncellenme:</span>
                  <span className="font-medium">{formatDate(vehicle.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vehicle Technical Details Component
const VehicleTechnicalDetails = ({ vehicle, enums }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
      <span className="text-2xl mr-3">🔧</span>
      Teknik Özellikler
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DetailGroup
        title="Genel Bilgiler"
        items={[
          { label: 'Marka', value: enums.carBrands?.find(b => b.value === vehicle.brand)?.label || vehicle.brand },
          { label: 'Model', value: vehicle.model },
          { label: 'Yıl', value: vehicle.year },
          { label: 'Kilometre', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString('tr-TR')} km` : '-' },
        ]}
      />
      
      <DetailGroup
        title="Motor ve Vites"
        items={[
          { label: 'Motor Hacmi', value: vehicle.engineCapacity ? `${vehicle.engineCapacity} cc` : '-' },
          { label: 'Beygir Gücü', value: vehicle.horsePower ? `${vehicle.horsePower} HP` : '-' },
          { label: 'Vites', value: enums.gearTypes?.find(g => g.value === vehicle.gearbox)?.label || vehicle.gearbox || '-' },
          { label: 'Yakıt Türü', value: enums.fuelTypes?.find(f => f.value === vehicle.fuelType)?.label || vehicle.fuelType || '-' },
        ]}
      />
      
      <DetailGroup
        title="Dış Görünüm"
        items={[
          { label: 'Renk', value: enums.colors?.find(c => c.value === vehicle.color)?.label || vehicle.color || '-' },
          { label: 'Kapı Sayısı', value: enums.doors?.find(d => d.value === vehicle.doors)?.label || vehicle.doors || '-' },
          { label: 'Koltuk Sayısı', value: enums.seatCounts?.find(s => s.value === vehicle.seatCount)?.label || vehicle.seatCount || '-' },
          { label: 'Jant Boyutu', value: vehicle.wheels ? `${vehicle.wheels}"` : '-' },
        ]}
      />
    </div>
  </div>
);

// Vehicle Performance Details Component
const VehiclePerformanceDetails = ({ vehicle }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
      <span className="text-2xl mr-3">⛽</span>
      Yakıt ve Performans
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DetailItem 
        label="Yakıt Kapasitesi" 
        value={vehicle.fuelCapacity ? `${vehicle.fuelCapacity} L` : '-'}
        icon="🛢️"
      />
      <DetailItem 
        label="Yakıt Tüketimi" 
        value={vehicle.fuelConsumption ? `${vehicle.fuelConsumption} L/100km` : '-'}
        icon="📊"
      />
      <DetailItem 
        label="Kilometre/Litre" 
        value={vehicle.kilometersPerLiter ? `${vehicle.kilometersPerLiter} km/L` : '-'}
        icon="📏"
      />
      <DetailItem 
        label="Motor Gücü" 
        value={vehicle.horsePower ? `${vehicle.horsePower} HP` : '-'}
        icon="💪"
      />
    </div>
  </div>
);

// Detail Group Component
const DetailGroup = ({ title, items }) => (
  <div>
    <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">{title}</h4>
    <div className="space-y-3">
      {items.map((item, index) => (
        <DetailItem key={index} label={item.label} value={item.value} />
      ))}
    </div>
  </div>
);

// Detail Item Component
const DetailItem = ({ label, value, icon }) => (
  <div className="flex items-center justify-between py-2">
    <dt className="text-sm font-medium text-gray-600 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </dt>
    <dd className="text-sm text-gray-900 font-medium">{value || '-'}</dd>
  </div>
);

export default VehicleDetailPage;