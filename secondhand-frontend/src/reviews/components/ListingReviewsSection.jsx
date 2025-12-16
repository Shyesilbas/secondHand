import React from 'react';
import { useListingReviews } from '../hooks/useListingReviews.js';
import ReviewCard from './ReviewCard.jsx';
import { StarIcon } from '@heroicons/react/24/solid';

const ListingReviewsSection = ({ listingId, listing }) => {
  const stats = listing?.reviewStats || null;
  const shouldFetchReviews = !stats || stats.totalReviews > 0;
  
  const { reviews, isLoading, error, hasReviews } = useListingReviews(listingId, { 
    enabled: shouldFetchReviews 
  });

  if (isLoading) {
    return (
      <div className="bg-card-bg rounded-card shadow-card-lg border border-card-border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !hasReviews) {
    return (
      <div className="bg-card-bg rounded-card shadow-card-lg border border-card-border p-6">
        <h3 className="text-xl font-semibold text-card-text-primary mb-4">Product Reviews</h3>
        <p className="text-card-text-muted text-sm">Unable to load reviews at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-card-bg rounded-card shadow-card-lg border border-card-border p-6">
      <h3 className="text-xl font-semibold text-card-text-primary mb-4">Product Reviews</h3>
      
      {stats && stats.totalReviews > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-card-text-primary">
                {stats.averageRating.toFixed(1)}
              </span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-card-text-muted text-sm">
              Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Rating breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats[`${['', 'one', 'two', 'three', 'four', 'five'][rating]}StarReviews`] || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8 text-card-text-muted">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-card-text-muted text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasReviews ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} compact />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <StarIcon className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-card-text-muted">No reviews yet for this product</p>
        </div>
      )}
    </div>
  );
};

export default ListingReviewsSection;
