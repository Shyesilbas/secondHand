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

    const givenStats = React.useMemo(() => {
        if (!isGivenReviews) return null;
        const total = reviews?.length || 0;
        const sum = reviews?.reduce((acc, r) => acc + (r.rating || 0), 0) || 0;
        const average = total > 0 ? sum / total : 0;
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
        reviews?.forEach(r => {
            const key = Number.isInteger(r.rating) ? r.rating : 0;
            if (counts[key] !== undefined) counts[key] += 1;
        });
        return {
            userId,
            userName: '',
            userSurname: '',
            totalReviews: total,
            averageRating: average,
            fiveStarReviews: counts[5],
            fourStarReviews: counts[4],
            threeStarReviews: counts[3],
            twoStarReviews: counts[2],
            oneStarReviews: counts[1],
            zeroStarReviews: counts[0],
        };
    }, [isGivenReviews, reviews, userId]);

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
                    <ReviewStats stats={isGivenReviews ? givenStats : stats} loading={isGivenReviews ? false : statsLoading} />
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
