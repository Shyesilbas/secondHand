import { useTranslation } from "react-i18next";
import { REVIEW_MESSAGES } from '../reviewConstants.js';
import { RatingStarsDisplay } from './RatingStarsDisplay.jsx';
const ReviewStats = ({
  stats,
  loading
}) => {
  const {
    t
  } = useTranslation();
  const getRatingColor = rating => {
    if (rating >= 4.5) return 'text-status-success';
    if (rating >= 3.5) return 'text-status-warning';
    if (rating >= 2.5) return 'text-status-warning-text';
    return 'text-status-error';
  };
  if (loading) {
    return <div className="bg-background-primary rounded-lg shadow-md border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-tertiary rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-tertiary rounded w-1/2"></div>
            <div className="h-3 bg-tertiary rounded w-1/3"></div>
          </div>
        </div>
      </div>;
  }
  if (!stats) {
    return <div className="bg-background-primary rounded-lg shadow-md border p-6">
        <p className="text-text-muted">{REVIEW_MESSAGES.NO_REVIEW_INFO}</p>
      </div>;
  }
  const starDistribution = [{
    stars: 5,
    count: stats.fiveStarReviews || 0
  }, {
    stars: 4,
    count: stats.fourStarReviews || 0
  }, {
    stars: 3,
    count: stats.threeStarReviews || 0
  }, {
    stars: 2,
    count: stats.twoStarReviews || 0
  }, {
    stars: 1,
    count: stats.oneStarReviews || 0
  }, {
    stars: 0,
    count: stats.zeroStarReviews || 0
  }];
  return <div className="bg-background-primary rounded-lg shadow-md border p-6">
      <h3 className="text-sm font-medium text-text-primary mb-4">{t("review_stats")}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <RatingStarsDisplay value={stats.averageRating || 0} iconClassName="w-4 h-4" />
          </div>
          <div className={`text-3xl font-bold ${getRatingColor(stats.averageRating || 0)}`}>
            {(stats.averageRating || 0).toFixed(1)}
          </div>
          <p className="text-sm text-text-secondary">
            {stats.totalReviews || 0}{t("reviews")}</p>
        </div>

        <div className="space-y-2">
          {starDistribution.map(({
          stars,
          count
        }) => {
          const percentage = stats.totalReviews > 0 ? count / stats.totalReviews * 100 : 0;
          return <div key={stars} className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary w-6">
                  {stars === 0 ? '0★' : `${stars}★`}
                </span>
                <div className="flex-1 bg-tertiary rounded-full h-2">
                  <div className="bg-status-warning-bg h-2 rounded-full transition-all duration-300" style={{
                width: `${percentage}%`
              }} />
                </div>
                <span className="text-sm text-text-secondary w-8">
                  {count}
                </span>
              </div>;
        })}
        </div>
      </div>
    </div>;
};
export default ReviewStats;