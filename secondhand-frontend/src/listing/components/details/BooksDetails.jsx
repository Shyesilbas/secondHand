import React from 'react';
import { useEnums } from '../../../common/hooks/useEnums.js';

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-text-muted">{label}</dt>
    <dd className="mt-1 text-sm text-text-primary">{value || '-'}</dd>
  </div>
);

const BooksDetails = ({ listing }) => {
  const { enums } = useEnums();

  const getEnumLabel = (key, value) => {
    if (!value) return value;
    const list = enums?.[key] || [];
    const found = list.find((o) => o.value === value);
    return found?.label || value;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-xl font-semibold text-text-primary mb-4">Books Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailItem label="Author" value={listing.author} />
        <DetailItem label="Genre" value={getEnumLabel('bookGenres', listing.genre)} />
        <DetailItem label="Language" value={getEnumLabel('bookLanguages', listing.language)} />
        <DetailItem label="Publication Year" value={listing.publicationYear} />
        <DetailItem label="Page Count" value={listing.pageCount} />
        <DetailItem label="Format" value={getEnumLabel('bookFormats', listing.format)} />
        <DetailItem label="Condition" value={getEnumLabel('bookConditions', listing.condition)} />
        <DetailItem label="ISBN" value={listing.isbn} />
      </div>
    </div>
  );
};

export default BooksDetails;


