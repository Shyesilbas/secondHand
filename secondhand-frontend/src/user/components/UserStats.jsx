import { useTranslation } from "react-i18next";
const InfoField = ({
  label,
  value,
  isVerified
}) => <div className="space-y-1">
    <label className="text-sm font-medium text-text-secondary">{label}</label>
    {isVerified !== undefined ? <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isVerified ? 'bg-status-success-bg text-status-success-text border border-status-success-border' : 'bg-status-error-bg text-status-error-text border border-status-error-border'}`}>
        {value}
      </span> : <p className="text-text-primary">{value}</p>}
  </div>;
const CompactReviewStats = ({
  stats,
  loading
}) => {
  const {
    t
  } = useTranslation();
  const renderStars = rating => {
    return Array.from({
      length: 5
    }, (_, index) => <svg key={'star-' + index} className={`w-4 h-4 ${index < rating ? 'text-status-warning-text' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>);
  };
  if (loading) {
    return <div className="animate-pulse">
        <div className="h-4 bg-tertiary rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-tertiary rounded w-1/2"></div>
          <div className="h-3 bg-tertiary rounded w-1/3"></div>
        </div>
      </div>;
  }
  if (!stats) {
    return <p className="text-text-muted">{t("no_review_information_found")}</p>;
  }
  return <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {renderStars(Math.round(stats.averageRating || 0))}
          <span className="text-lg font-semibold text-text-primary">
            {(stats.averageRating || 0).toFixed(1)}
          </span>
        </div>
        <span className="text-sm text-text-secondary">
          {stats.totalReviews || 0}{t("reviews")}</span>
      </div>
    </div>;
};
const UserStats = ({
  user,
  reviewStats,
  reviewStatsLoading
}) => {
  const {
    t
  } = useTranslation();
  return <div className="space-y-6">
      <div className="bg-background-primary border border-border-light rounded-lg">
        <div className="p-6 border-b border-border-light">
          <h2 className="text-lg font-semibold text-text-primary">{t("personal_information")}</h2>
          <p className="text-sm text-text-secondary mt-1">{t("basic_account_details_and_contact_inform")}</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label={t("email_address")} value={user.email || 'Not provided'} />
            <InfoField label={t("phone_number")} value={user.phoneNumber || 'Not provided'} />
            <InfoField label={t("gender")} value={user.gender || 'Not specified'} />
            <InfoField label={t("account_status")} value={user.accountVerified ? 'Verified' : 'Not Verified'} isVerified={user.accountVerified} />
            <InfoField label={t("member_since")} value={user.accountCreationDate} />
          </div>
        </div>
      </div>

      {reviewStats && reviewStats.totalReviews > 0 && <div className="bg-background-primary border border-border-light rounded-lg">
          <div className="p-6 border-b border-border-light">
            <h2 className="text-lg font-semibold text-text-primary">{t("review_summary")}</h2>
          </div>
          <div className="p-6">
            <CompactReviewStats stats={reviewStats} loading={reviewStatsLoading} />
          </div>
        </div>}
    </div>;
};
export default UserStats;