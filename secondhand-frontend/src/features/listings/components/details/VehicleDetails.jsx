import React from 'react';

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
  </div>
);

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

export default VehicleDetails;


