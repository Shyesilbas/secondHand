import React from 'react';

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
  </div>
);

const RealEstateDetails = ({ listing }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">Real Estate Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DetailItem label="Ad Type" value={listing.adType} />
      <DetailItem label="Property Type" value={listing.realEstateType} />
      <DetailItem label="Heating Type" value={listing.heatingType} />
      <DetailItem label="Owner Type" value={listing.ownerType} />
      <DetailItem label="Square Meters" value={listing.squareMeters ? `${listing.squareMeters} m²` : '-'} />
      <DetailItem label="Room Count" value={listing.roomCount} />
      <DetailItem label="Bathroom Count" value={listing.bathroomCount} />
      <DetailItem label="Floor" value={listing.floor} />
      <DetailItem label="Building Age" value={listing.buildingAge ? `${listing.buildingAge} years` : '-'} />
      <DetailItem label="Furnished" value={listing.furnished ? 'Yes' : 'No'} />
    </div>
  </div>
);

export default RealEstateDetails;


