import React from 'react';
import { useEnums } from '../../../common/hooks/useEnums.js';

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-text-muted">{label}</dt>
    <dd className="mt-1 text-sm text-text-primary">{value || '-'}</dd>
  </div>
);

const VehicleDetails = ({ listing }) => {
  const { enums, getCarBrandLabel, getFuelTypeLabel, getColorLabel } = useEnums();

  const getEnumLabel = (key, value) => {
    if (!value) return value;
    const list = enums?.[key] || [];
    const found = list.find((o) => o.value === value);
    return found?.label || value;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-xl font-semibold text-text-primary mb-4">Vehicle Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailItem label="Brand" value={getCarBrandLabel(listing.brand)} />
        <DetailItem label="Model" value={listing.model} />
        <DetailItem label="Year" value={listing.year} />
        <DetailItem label="Kilometer" value={listing.mileage ? `${listing.mileage.toLocaleString('tr-TR')} km` : '-'} />
        <DetailItem label="Engine Capacity" value={listing.engineCapacity ? `${listing.engineCapacity} cc` : '-'} />
        <DetailItem label="Gear Type" value={getEnumLabel('gearTypes', listing.gearbox)} />
        <DetailItem label="Fuel Type" value={getFuelTypeLabel(listing.fuelType)} />
        <DetailItem label="Color" value={getColorLabel(listing.color)} />
        <DetailItem label="Door" value={getEnumLabel('doors', listing.doors)} />
        <DetailItem label="Seat Count" value={getEnumLabel('seatCounts', listing.seatCount)} />
        <DetailItem label="Horse Power" value={listing.horsePower ? `${listing.horsePower} HP` : '-'} />
        <DetailItem label="Fuel Consumption" value={listing.fuelConsumption ? `${listing.fuelConsumption} L/100km` : '-'} />
        <DetailItem label="Open To Swap" value={listing.swap ? 'Yes' : 'No'} />
      </div>
    </div>
  );
};

export default VehicleDetails;


