import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ReviewStats, ReviewsList, useReviews, useReviewsByUser, useUserReviewStats } from '../index.js';

const UserReviewsPage = () => {
    const { userId } = useParams();
    const location = useLocation();
    
    // Determine which API to use based on the URL path
    const isReceivedReviews = location.pathname.includes('/reviews/received/');
    const isGivenReviews = location.pathname.includes('/reviews/given/');
    
    // Use different hooks based on the URL
    const reviewsData = isGivenReviews ? useReviewsByUser(userId) : useReviews(userId);
    const { reviews, loading, error, hasMore, loadMore } = reviewsData;
    const { stats, loading: statsLoading } = useUserReviewStats(userId);

    // Determine the page title based on the URL
    const getPageTitle = () => {
        if (isReceivedReviews) return 'I received';
        if (isGivenReviews) return 'My receives';
        return 'Reviews';
    };

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{getPageTitle()}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Review Stats */}
                <div className="lg:col-span-1">
                    <ReviewStats stats={stats} loading={statsLoading} />
                </div>
                
                {/* Reviews List */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Reviews
                    </h2>
                    <ReviewsList
                        reviews={reviews}
                        loading={loading}
                        error={error}
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserReviewsPage;
