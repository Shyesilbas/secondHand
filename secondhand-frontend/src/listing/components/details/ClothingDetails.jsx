import React from 'react';
import { useEnums } from '../../../common/hooks/useEnums.js';

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-text-muted">{label}</dt>
    <dd className="mt-1 text-sm text-text-primary">{value || '-'}</dd>
  </div>
);

const ClothingDetails = ({ listing }) => {
  const { enums } = useEnums();

  const getEnumLabel = (key, value) => {
    if (!value) return value;
    const list = enums?.[key] || [];
    const found = list.find((o) => o.value === value);
    return found?.label || value;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-xl font-semibold text-text-primary mb-4">Clothing Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailItem label="Brand" value={getEnumLabel('clothingBrands', listing.brand)} />
        <DetailItem label="Type" value={getEnumLabel('clothingTypes', listing.clothingType)} />
        <DetailItem label="Color" value={getEnumLabel('colors', listing.color)} />
        <DetailItem label="Condition" value={getEnumLabel('clothingConditions', listing.condition)} />
        <DetailItem label="Clothing Gender" value={getEnumLabel('clothingGenders', listing.clothingGender)} />
        <DetailItem label="Clothing Category" value={getEnumLabel('clothingCategories', listing.clothingCategory)} />
        <DetailItem label="Purchase Date" value={listing.purchaseDate ? new Date(listing.purchaseDate).toLocaleDateString() : '-'} />
      </div>
    </div>
  );
};

export default ClothingDetails;


