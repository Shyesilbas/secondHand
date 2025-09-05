import React from 'react';

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-text-muted">{label}</dt>
    <dd className="mt-1 text-sm text-text-primary">{value || '-'}</dd>
  </div>
);

const BooksDetails = ({ listing }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-xl font-semibold text-text-primary mb-4">Books Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DetailItem label="Author" value={listing.author} />
      <DetailItem label="Genre" value={listing.genre} />
      <DetailItem label="Language" value={listing.language} />
      <DetailItem label="Publication Year" value={listing.publicationYear} />
      <DetailItem label="Page Count" value={listing.pageCount} />
      <DetailItem label="Format" value={listing.format} />
      <DetailItem label="Condition" value={listing.condition} />
      <DetailItem label="ISBN" value={listing.isbn} />
    </div>
  </div>
);

export default BooksDetails;


