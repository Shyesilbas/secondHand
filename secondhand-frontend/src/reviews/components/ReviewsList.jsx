import React, { memo } from 'react';
import ReviewCard from './ReviewCard.jsx';

const ReviewsList = memo(({ reviews, loading, error, hasMore, onLoadMore, showLoadMore = true }) => {
    if (loading && reviews.length === 0) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm animate-pulse">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="flex space-x-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md border p-6 text-center">
                <div className="text-red-500 mb-2">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Occurred</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={onLoadMore}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md border p-6 text-center">
                <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600">No reviews have been made to this user.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
            ))}
            
            {hasMore && showLoadMore && (
                <div className="text-center py-4">
                    <button
                        onClick={onLoadMore}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
});

ReviewsList.displayName = 'ReviewsList';

export default ReviewsList;
