import React from 'react';

const InfoField = ({ label, value, isVerified }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {isVerified !== undefined ? (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isVerified
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}>
        {value}
      </span>
    ) : (
      <p className="text-gray-900">{value}</p>
    )}
  </div>
);

const CompactReviewStats = ({ stats, loading }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-gray-500">No review information found.</p>;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {renderStars(Math.round(stats.averageRating || 0))}
          <span className="text-lg font-semibold text-gray-900">
            {(stats.averageRating || 0).toFixed(1)}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          {stats.totalReviews || 0} reviews
        </span>
      </div>
    </div>
  );
};

const UserStats = ({ user, reviewStats, reviewStatsLoading }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
          <p className="text-sm text-gray-600 mt-1">Basic account details and contact information</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Email Address" value={user.email || 'Not provided'} />
            <InfoField label="Phone Number" value={user.phoneNumber || 'Not provided'} />
            <InfoField label="Gender" value={user.gender || 'Not specified'} />
            <InfoField 
              label="Account Status" 
              value={user.accountVerified ? 'Verified' : 'Not Verified'}
              isVerified={user.accountVerified}
            />
            <InfoField label="Member Since" value={user.accountCreationDate} />
          </div>
        </div>
      </div>

      {reviewStats && reviewStats.totalReviews > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Review Summary</h2>
          </div>
          <div className="p-6">
            <CompactReviewStats stats={reviewStats} loading={reviewStatsLoading} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStats;
