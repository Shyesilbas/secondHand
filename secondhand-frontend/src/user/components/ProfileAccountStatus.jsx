import React from 'react';

const ProfileAccountStatus = ({ user }) => {
  return (
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
  );
};

const InfoBadge = ({ label, value, type, isVerified }) => {
  let colorClasses;

  if (isVerified !== undefined) {
    colorClasses = isVerified
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'bg-red-50 text-red-700 border border-red-200';
  } else {
    const colors = {
      ACTIVE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      SUSPENDED: 'bg-red-50 text-red-700 border border-red-200',
      PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
    };
    colorClasses =
      colors[type] || 'bg-slate-50 text-slate-700 border border-slate-200';
  }

  return (
    <div className="space-y-2 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-[0.05em]">{label}</label>
      <div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-tight ${colorClasses}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

export default ProfileAccountStatus;
