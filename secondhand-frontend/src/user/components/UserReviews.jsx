import React from 'react';
import { ReviewsList } from '../../reviews/index.js';
import Pagination from '../../common/components/ui/Pagination.jsx';

const UserReviews = ({ 
  receivedReviews, 
  receivedReviewsLoading, 
  receivedReviewsError, 
  pagination,
  loadPage,
  handlePageSizeChange,
  reviewStats 
}) => {
  const handlePageChange = (page) => {
    loadPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Reviews Received {pagination?.totalElements > 0 && `(${pagination.totalElements})`}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Reviews this user has received from others</p>
            </div>
            {!receivedReviewsLoading && pagination?.totalElements > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select 
                  value={pagination.size} 
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          {receivedReviewsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : receivedReviewsError ? (
            <div className="text-center text-red-500 py-8">
              <p className="text-lg font-medium mb-2">Failed to load reviews</p>
              <p className="text-sm text-gray-500">Please try again later</p>
            </div>
          ) : receivedReviews.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No reviews received yet.</div>
          ) : (
            <>
              <ReviewsList
                reviews={receivedReviews}
                loading={false}
                error={null}
                hasMore={false}
                onLoadMore={null}
              />
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <Pagination
                    page={pagination.number}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReviews;
