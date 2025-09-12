import React from 'react';
import { useParams } from 'react-router-dom';
import { ReviewStats, ReviewsList, useReviews, useUserReviewStats } from '../index.js';

const UserReviewsPage = () => {
    const { userId } = useParams();
    const { reviews, loading, error, hasMore, loadMore } = useReviews(userId);
    const { stats, loading: statsLoading } = useUserReviewStats(userId);

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Kullanıcı Değerlendirmeleri</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Review Stats */}
                <div className="lg:col-span-1">
                    <ReviewStats stats={stats} loading={statsLoading} />
                </div>
                
                {/* Reviews List */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Değerlendirmeler
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
