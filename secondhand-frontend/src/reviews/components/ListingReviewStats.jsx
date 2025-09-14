import React from 'react';
import { useListingReviews } from '../hooks/useListingReviews.js';

const ListingReviewStats = ({ listingId, size = 'sm', showIcon = true, showText = true }) => {
  const { stats, isLoading, error } = useListingReviews(listingId);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-1">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        {showText && <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>}
      </div>
    );
  }

  if (error || !stats || stats.totalReviews === 0) {
    return null; // Don't show anything if no reviews
  }

  const sizeConfig = {
    sm: { 
      icon: 'w-3 h-3', 
      text: 'text-xs',
      container: 'space-x-1'
    },
    md: { 
      icon: 'w-4 h-4', 
      text: 'text-sm',
      container: 'space-x-1'
    },
    lg: { 
      icon: 'w-5 h-5', 
      text: 'text-base',
      container: 'space-x-2'
    }
  };

  const config = sizeConfig[size] || sizeConfig.sm;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className={`${config.icon} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className={`${config.icon} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-star">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className={`${config.icon} text-gray-300`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  return (
    <div className={`flex items-center ${config.container}`}>
      {showIcon && (
        <div className="flex items-center">
          {renderStars(stats.averageRating)}
        </div>
      )}
      {showText && (
        <span className={`${config.text} text-gray-600 font-medium`}>
          {stats.averageRating.toFixed(1)} ({stats.totalReviews})
        </span>
      )}
    </div>
  );
};

export default ListingReviewStats;
