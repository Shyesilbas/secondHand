import React from 'react';
import { useEnums } from '../../../common/hooks/useEnums.js';

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-text-muted">{label}</dt>
    <dd className="mt-1 text-sm text-text-primary">{value || '-'}</dd>
  </div>
);

const ElectronicsDetails = ({ listing }) => {
  const { enums } = useEnums();

  const getEnumLabel = (key, value) => {
    if (!value) return value;
    const list = enums?.[key] || [];
    const found = list.find((o) => o.value === value);
    return found?.label || value;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-xl font-semibold text-text-primary mb-4">Electronics Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailItem label="Type" value={getEnumLabel('electronicTypes', listing.electronicType)} />
        <DetailItem label="Brand" value={getEnumLabel('electronicBrands', listing.electronicBrand)} />
        <DetailItem label="Model" value={listing.model} />
        <DetailItem label="Origin" value={listing.origin} />
        <DetailItem label="Year" value={listing.year} />
        <DetailItem label="Color" value={getEnumLabel('colors', listing.color)} />
        <DetailItem label="Warranty Proof" value={listing.warrantyProof ? 'Yes' : 'No'} />
        {listing.ram ? <DetailItem label="RAM" value={`${listing.ram} GB`} /> : null}
        {listing.storage ? <DetailItem label="Storage" value={`${listing.storage} GB`} /> : null}
        {listing.screenSize ? <DetailItem label="Screen Size" value={`${listing.screenSize}"`} /> : null}
        {listing.processor ? <DetailItem label="Processor" value={getEnumLabel('processors', listing.processor)} /> : null}
      </div>
    </div>
  );
};

export default ElectronicsDetails;


