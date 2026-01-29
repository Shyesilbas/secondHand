import React from 'react';
import { useEnums } from '../../../common/hooks/useEnums.js';

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-text-muted">{label}</dt>
    <dd className="mt-1 text-sm text-text-primary">{value || '-'}</dd>
  </div>
);

const RealEstateDetails = ({ listing }) => {
  const { enums } = useEnums();

  const getEnumLabel = (key, value) => {
    if (!value) return value;
    const list = enums?.[key] || [];
    const found = list.find((o) => (o.id || o.value) === value);
    return found?.label || value;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-xl font-semibold text-text-primary mb-4">Real Estate Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailItem label="Ad Type" value={listing.adType?.label || listing.adType?.name || getEnumLabel('realEstateAdTypes', listing.adType)} />
        <DetailItem label="Property Type" value={listing.realEstateType?.label || listing.realEstateType?.name || getEnumLabel('realEstateTypes', listing.realEstateType)} />
        <DetailItem label="Heating Type" value={listing.heatingType?.label || listing.heatingType?.name || getEnumLabel('heatingTypes', listing.heatingType)} />
        <DetailItem label="Owner Type" value={listing.ownerType?.label || listing.ownerType?.name || getEnumLabel('ownerTypes', listing.ownerType)} />
        <DetailItem label="Square Meters" value={listing.squareMeters ? `${listing.squareMeters} m²` : '-'} />
        <DetailItem label="Room Count" value={listing.roomCount} />
        <DetailItem label="Bathroom Count" value={listing.bathroomCount} />
        <DetailItem label="Floor" value={listing.floor} />
        <DetailItem label="Building Age" value={listing.buildingAge ? `${listing.buildingAge} years` : '-'} />
        <DetailItem label="Furnished" value={listing.furnished ? 'Yes' : 'No'} />
      </div>
    </div>
  );
};

export default RealEstateDetails;


