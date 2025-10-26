import React from 'react';

const ProfileAccountStatus = ({ user }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Account Status
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Current status and verification information
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoBadge
            label="Account Status"
            value={user?.accountStatus || 'Unknown'}
            type={user?.accountStatus}
          />
          <InfoBadge
            label="Email Verification"
            value={user?.accountVerified ? 'Verified' : 'Unverified'}
            isVerified={user?.accountVerified}
          />
        </div>
      </div>
    </div>
  );
};

const InfoBadge = ({ label, value, type, isVerified }) => {
  let colorClasses;

  if (isVerified !== undefined) {
    colorClasses = isVerified
      ? 'bg-green-50 text-green-700 border border-green-200'
      : 'bg-red-50 text-red-700 border border-red-200';
  } else {
    const colors = {
      ACTIVE: 'bg-green-50 text-green-700 border border-green-200',
      SUSPENDED: 'bg-red-50 text-red-700 border border-red-200',
      PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
    };
    colorClasses =
      colors[type] || 'bg-gray-50 text-gray-700 border border-gray-200';
  }

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

export default ProfileAccountStatus;
