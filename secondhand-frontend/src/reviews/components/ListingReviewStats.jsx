import { useId } from 'react';
import { StarIcon, STAR_SHAPE_PATH } from './StarIcon.jsx';

const ListingReviewStats = ({ listing, listingId, size = 'sm', showIcon = true, showText = true }) => {
  const halfStarGradientId = `half-star-${useId().replace(/:/g, '')}`;
  const resolvedListingId = listing?.id ?? listingId;
  const stats = listing?.reviewStats || null;
  const isLoading = false;
  const error = null;

  if (isLoading) {
    return (
      <div className="flex items-center space-x-1">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        {showText && <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>}
      </div>
    );
  }

  if (error || !stats || stats.totalReviews === 0) {
    return null;
  }

  const avg = Number(stats.averageRating);
  const safeAvg = Number.isFinite(avg) ? avg : 0;

  const sizeConfig = {
    sm: {
      icon: 'w-3 h-3',
      text: 'text-xs',
      container: 'space-x-1',
    },
    md: {
      icon: 'w-4 h-4',
      text: 'text-sm',
      container: 'space-x-1',
    },
    lg: {
      icon: 'w-5 h-5',
      text: 'text-base',
      container: 'space-x-2',
    },
  };

  const config = sizeConfig[size] || sizeConfig.sm;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className={`${config.icon} text-yellow-400`} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className={`${config.icon} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <defs>
            <linearGradient id={halfStarGradientId}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill={`url(#${halfStarGradientId})`} d={STAR_SHAPE_PATH} />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className={`${config.icon} text-gray-300`} />
      );
    }

    return stars;
  };

  return (
    <div
      className={`flex items-center ${config.container}`}
      data-listing-id={resolvedListingId ?? undefined}
    >
      {showIcon && (
        <div className="flex items-center">
          {renderStars(safeAvg)}
        </div>
      )}
      {showText && (
        <span className={`${config.text} text-gray-600 font-medium`}>
          {safeAvg.toFixed(1)} ({stats.totalReviews})
        </span>
      )}
    </div>
  );
};

export default ListingReviewStats;
