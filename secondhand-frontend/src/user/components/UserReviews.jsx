import React from 'react';
import { ReviewsList } from '../../reviews/index.js';

const UserReviews = ({ 
  receivedReviews, 
  receivedReviewsLoading, 
  receivedReviewsError, 
  hasMore, 
  loadMore,
  reviewStats 
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Reviews Received</h2>
          <p className="text-sm text-gray-600 mt-1">Reviews this user has received from others</p>
        </div>
        <div className="p-6">
          {reviewStats && reviewStats.totalReviews > 0 ? (
            <ReviewsList
              reviews={receivedReviews}
              loading={receivedReviewsLoading}
              error={receivedReviewsError}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">No reviews received yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReviews;
