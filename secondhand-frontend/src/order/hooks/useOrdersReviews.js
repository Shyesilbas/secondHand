import { useState, useCallback } from 'react';

export const useOrdersReviews = () => {
    const [orderReviews, setOrderReviews] = useState({});
    const [reviewsLoading, setReviewsLoading] = useState(false);

    const fetchReviewsData = useCallback(async (order) => {
        if (!order.orderItems || order.orderItems.length === 0) return;
        
        setReviewsLoading(true);
        try {
            if (order.status !== 'DELIVERED' && order.status !== 'COMPLETED') {
                setOrderReviews({});
                return;
            }

            const orderItemIds = order.orderItems.map(item => item.id);
            
            const { reviewService } = await import('../../reviews/services/reviewService.js');
            const reviewsResponse = await reviewService.getReviewsForOrderItems(orderItemIds);
            
            const reviewsMap = {};
            if (reviewsResponse && Array.isArray(reviewsResponse)) {
                reviewsResponse.forEach(review => {
                    if (review.orderItemId) {
                        reviewsMap[review.orderItemId] = review;
                    }
                });
            }
            
            setOrderReviews(reviewsMap);
        } catch (error) {
            console.error('Error fetching reviews data:', error);
            setOrderReviews({});
        } finally {
            setReviewsLoading(false);
        }
    }, []);

    const clearReviews = useCallback(() => {
        setOrderReviews({});
    }, []);

    return {
        orderReviews,
        reviewsLoading,
        fetchReviewsData,
        clearReviews
    };
};
