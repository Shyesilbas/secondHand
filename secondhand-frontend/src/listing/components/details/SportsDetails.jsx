import React from 'react';
import { useEnums } from '../../../common/hooks/useEnums.js';

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-text-muted">{label}</dt>
    <dd className="mt-1 text-sm text-text-primary">{value || '-'}</dd>
  </div>
);

const SportsDetails = ({ listing }) => {
  const toLabel = (v) => v?.label || v?.name || '';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-xl font-semibold text-text-primary mb-4">Sports Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailItem label="Discipline" value={toLabel(listing.discipline)} />
        <DetailItem label="Equipment Type" value={toLabel(listing.equipmentType)} />
        <DetailItem label="Condition" value={toLabel(listing.condition)} />
      </div>
    </div>
  );
};

export default SportsDetails;


