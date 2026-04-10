import { REVIEW_MESSAGES } from '../reviewConstants.js';
import { RatingStarsDisplay } from './RatingStarsDisplay.jsx';

const ReviewStats = ({ stats, loading }) => {
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md border p-6">
        <p className="text-gray-500">{REVIEW_MESSAGES.NO_REVIEW_INFO}</p>
      </div>
    );
  }

  const starDistribution = [
    { stars: 5, count: stats.fiveStarReviews || 0 },
    { stars: 4, count: stats.fourStarReviews || 0 },
    { stars: 3, count: stats.threeStarReviews || 0 },
    { stars: 2, count: stats.twoStarReviews || 0 },
    { stars: 1, count: stats.oneStarReviews || 0 },
    { stars: 0, count: stats.zeroStarReviews || 0 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Review Stats
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <RatingStarsDisplay value={stats.averageRating || 0} iconClassName="w-4 h-4" />
          </div>
          <div className={`text-3xl font-bold ${getRatingColor(stats.averageRating || 0)}`}>
            {(stats.averageRating || 0).toFixed(1)}
          </div>
          <p className="text-sm text-gray-600">
            {stats.totalReviews || 0} Reviews
          </p>
        </div>

        <div className="space-y-2">
          {starDistribution.map(({ stars, count }) => {
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

            return (
              <div key={stars} className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 w-6">
                  {stars === 0 ? '0★' : `${stars}★`}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;
