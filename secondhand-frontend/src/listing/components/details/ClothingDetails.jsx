import React from 'react';

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-text-muted">{label}</dt>
    <dd className="mt-1 text-sm text-text-primary">{value || '-'}</dd>
  </div>
);

const ClothingDetails = ({ listing }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-xl font-semibold text-text-primary mb-4">Clothing Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DetailItem label="Brand" value={listing.brand} />
      <DetailItem label="Type" value={listing.clothingType} />
      <DetailItem label="Color" value={listing.color} />
      <DetailItem label="Condition" value={listing.condition} />
      <DetailItem label="Purchase Date" value={listing.purchaseDate ? new Date(listing.purchaseDate).toLocaleDateString() : '-'} />
    </div>
  </div>
);

export default ClothingDetails;


