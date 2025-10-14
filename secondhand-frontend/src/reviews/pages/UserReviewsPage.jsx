import React from 'react';
import {useLocation, useParams} from 'react-router-dom';
import {ReviewsList, ReviewStats, useReviews, useReviewsByUser, useUserReviewStats} from '../index.js';

const UserReviewsPage = () => {
    const { userId } = useParams();
    const location = useLocation();
    
        const isReceivedReviews = location.pathname.includes('/reviews/received/');
    const isGivenReviews = location.pathname.includes('/reviews/given/');
    
        const reviewsData = isGivenReviews ? useReviewsByUser(userId) : useReviews();
    const { reviews, loading, error, hasMore, loadMore } = reviewsData;
    const { stats, loading: statsLoading } = useUserReviewStats(userId);

        const getPageTitle = () => {
        if (isReceivedReviews) return 'Reviews Received';
        if (isGivenReviews) return 'Given Reviews';
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
