import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import PageHeader from '../../common/components/ui/PageHeader.jsx';
import { ReviewsList, ReviewStats, useReviews, useReviewsByUser, useUserReviewStats } from '../index.js';
const UserReviewsPage = () => {
 const {
 t
 } = useTranslation();
 const {
 userId
 } = useParams();
 const location = useLocation();
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
 const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
 reviews?.forEach(r => {
 if (counts[r.rating] !== undefined) counts[r.rating] += 1;
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
 oneStarReviews: counts[1]
 };
 }, [isGivenReviews, reviews, userId]);
 const title = isGivenReviews ? t('reviews_given', 'Verdiğim Değerlendirmeler') : t('reviews_received', 'Aldığım Değerlendirmeler');
 return <PageContainer className="py-8">
 <PageHeader
 title={title}
 subtitle={isGivenReviews ? t("see_reviews_you_have_given") : t("see_reviews_you_have_received")}
 className="mb-8"
 />

 <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
 <div className="lg:sticky lg:top-24">
 <ReviewStats stats={isGivenReviews ? givenStats : stats} loading={isGivenReviews ? loading && reviews.length === 0 : statsLoading} />
 </div>
 <div className="lg:col-span-2">
 <ReviewsList
 reviews={reviews}
 loading={loading}
 error={error}
 hasMore={hasMore}
 onLoadMore={loadMore}
 onRetry={refetch}
 perspective={isGivenReviews ? 'given' : 'received'}
 />
 </div>
 </div>
 </PageContainer>;
};
export default UserReviewsPage;
