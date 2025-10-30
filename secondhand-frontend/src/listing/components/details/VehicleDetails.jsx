import React, { useState } from 'react';
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

  const [active, setActive] = useState('basic');

  const Section = ({ id, title, children }) => (
    <section className={active === id ? '' : 'hidden'}>
      <h4 className="text-sm font-semibold text-text-muted mb-3">{title}</h4>
      {children}
    </section>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-primary">Vehicle Information</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'basic', label: 'Basic' },
            { id: 'mechanical', label: 'Mechanical' },
            { id: 'usage', label: 'Usage' },
            { id: 'history', label: 'History' },
            { id: 'extras', label: 'Extras' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`px-3 py-1.5 text-sm rounded border ${active === tab.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Section id="basic" title="Basic">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Brand" value={getCarBrandLabel(listing.brand)} />
          <DetailItem label="Model" value={listing.model} />
          <DetailItem label="Year" value={listing.year} />
          <DetailItem label="Color" value={getColorLabel(listing.color)} />
        </div>
      </Section>

      <Section id="mechanical" title="Mechanical">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Gear Type" value={getEnumLabel('gearTypes', listing.gearbox)} />
          <DetailItem label="Fuel Type" value={getFuelTypeLabel(listing.fuelType)} />
          <DetailItem label="Horse Power" value={listing.horsePower ? `${listing.horsePower} HP` : '-'} />
          <DetailItem label="Engine Capacity" value={listing.engineCapacity ? `${listing.engineCapacity} cc` : '-'} />
          <DetailItem label="Drivetrain" value={getEnumLabel('drivetrains', listing.drivetrain)} />
          <DetailItem label="Body Type" value={getEnumLabel('bodyTypes', listing.bodyType)} />
          <DetailItem label="Door" value={getEnumLabel('doors', listing.doors)} />
          <DetailItem label="Seat Count" value={getEnumLabel('seatCounts', listing.seatCount)} />
        </div>
      </Section>

      <Section id="usage" title="Usage">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Kilometer" value={listing.mileage ? `${listing.mileage.toLocaleString('tr-TR')} km` : '-'} />
          <DetailItem label="Fuel Consumption" value={listing.fuelConsumption ? `${listing.fuelConsumption} L/100km` : '-'} />
          <DetailItem label="Kilometers/Liter" value={listing.kilometersPerLiter ? `${listing.kilometersPerLiter} km/L` : '-'} />
          <DetailItem label="Wheels" value={listing.wheels ? `${listing.wheels}\"` : '-'} />
        </div>
      </Section>

      <Section id="history" title="History">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Accident History" value={listing.accidentHistory === true ? 'Yes' : listing.accidentHistory === false ? 'No' : '-'} />
          <DetailItem label="Accident Details" value={listing.accidentDetails} />
          <DetailItem label="Inspection Valid Until" value={listing.inspectionValidUntil} />
        </div>
      </Section>

      <Section id="extras" title="Extras">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Open To Swap" value={listing.swap ? 'Yes' : 'No'} />
        </div>
      </Section>
    </div>
  );
};

export default VehicleDetails;


