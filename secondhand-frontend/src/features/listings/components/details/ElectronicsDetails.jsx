import React from 'react';

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
  </div>
);

const ElectronicsDetails = ({ listing }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">Electronics Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DetailItem label="Type" value={listing.electronicType} />
      <DetailItem label="Brand" value={listing.electronicBrand} />
      <DetailItem label="Model" value={listing.model} />
      <DetailItem label="Origin" value={listing.origin} />
      <DetailItem label="Year" value={listing.year} />
      <DetailItem label="Color" value={listing.color} />
      <DetailItem label="Warranty Proof" value={listing.warrantyProof ? 'Yes' : 'No'} />
    </div>
  </div>
);

export default ElectronicsDetails;


