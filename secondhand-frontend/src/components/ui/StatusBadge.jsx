import React from 'react';

const defaultLabels = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SOLD: 'Sold',
  DRAFT: 'Draft',
  PENDING: 'Pending',
};

const StatusBadge = ({ status, labels = defaultLabels, className = '' }) => {
  const label = labels[status] || labels.DRAFT || status;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-600 ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;


