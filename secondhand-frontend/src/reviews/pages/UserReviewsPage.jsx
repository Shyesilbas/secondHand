import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { ReviewsList, ReviewStats, useReviews, useReviewsByUser, useUserReviewStats } from '../index.js';
const UserReviewsPage = () => {
  const {
    t
  } = useTranslation();
  const {
    userId
  } = useParams();
  const location = useLocation();
  const isReceivedReviews = location.pathname.includes('/reviews/received/');
  const isGivenReviews = location.pathname.includes('/reviews/given/');
  const receivedQuery = useReviews(userId, {
    enabled: !isGivenReviews
  });
  const givenQuery = useReviewsByUser(userId, {
    enabled: isGivenReviews
  });
  const reviewsData = isGivenReviews ? givenQuery : receivedQuery;
  const {
    reviews,
    loading,
    error,
    hasMore,
    loadMore,
    refetch
  } = reviewsData;
  const {
    stats,
    loading: statsLoading
  } = useUserReviewStats(userId);
  const givenStats = React.useMemo(() => {
    if (!isGivenReviews) return null;
    const total = reviews?.length || 0;
    const sum = reviews?.reduce((acc, r) => acc + (r.rating || 0), 0) || 0;
    const average = total > 0 ? sum / total : 0;
    const counts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
      0: 0
    };
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
      zeroStarReviews: counts[0]
    };
  }, [isGivenReviews, reviews, userId]);
  const getPageTitle = () => {
    if (isReceivedReviews) return 'Reviews Received';
    if (isGivenReviews) return 'Given Reviews';
    return 'Reviews';
  };
  return <PageContainer className="py-8">
            {/* Premium Header */}
            <div className="bg-background-secondary rounded-2xl border border-border-light p-8 mb-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Star className="w-48 h-48" />
               </div>
               <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-md relative z-10">
                  <Star className="w-7 h-7 text-white" />
               </div>
               <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2 relative z-10">{getPageTitle()}</h1>
               <p className="text-sm text-text-secondary relative z-10 max-w-md mx-auto">
                 {isReceivedReviews ? t("see_reviews_you_have_received") : t("see_reviews_you_have_given")}
               </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Review Stats */}
                <div className="lg:col-span-1">
                    <ReviewStats stats={isGivenReviews ? givenStats : stats} loading={isGivenReviews ? false : statsLoading} />
                </div>
                
                {/* Reviews List */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold text-text-primary mb-6">{t("reviews")}</h2>
                    <ReviewsList reviews={reviews} loading={loading} error={error} hasMore={hasMore} onLoadMore={loadMore} onRetry={refetch} />
                </div>
            </div>
        </PageContainer>;
};
export default UserReviewsPage;