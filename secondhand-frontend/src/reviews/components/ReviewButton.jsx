import React, {useState} from 'react';
import {reviewService} from '../services/reviewService.js';
import ReviewModal from './ReviewModal.jsx';

const ReviewButton = ({ orderItem, onReviewCreated, existingReview = null }) => {
    const [showModal, setShowModal] = useState(false);
    const [review, setReview] = useState(existingReview);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        setReview(existingReview);
    }, [existingReview]);

    // Eğer existingReview prop olarak gelmediyse, API'den çek
    React.useEffect(() => {
        if (!existingReview && orderItem && orderItem.id) {
            const checkExistingReview = async () => {
                try {
                    const reviewData = await reviewService.getReviewByOrderItem(orderItem.id);
                    setReview(reviewData);
                } catch (error) {
                    // 404 is expected if no review exists yet - suppress the error
                    if (error?.response?.status !== 404) {
                        console.error('Error checking review:', error);
                    }
                    setReview(null);
                }
            };
            checkExistingReview();
        }
    }, [orderItem, existingReview]);

    const canReview = orderItem?.shippingStatus === 'DELIVERED';
    
        console.log('ReviewButton Debug:', {
        orderItemId: orderItem?.id,
        shippingStatus: orderItem?.shippingStatus,
        canReview
    });

    if (!canReview) {
        return null;
    }

    if (review) {
        return (
            <div className="text-sm">
                <div className="flex items-center space-x-1 text-green-600">
                    <span className="text-lg">⭐</span>
                    <span>Reviewed! ({review.rating}/5)</span>
                </div>
                {review.comment && (
                    <div className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg max-w-xs">
                        <p 
                            className="overflow-hidden"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: '1.4em',
                                maxHeight: '2.8em'
                            }}
                        >
                            {review.comment}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    const handleReviewCreated = () => {
        onReviewCreated?.();
        setLoading(true);
        reviewService.getReviewByOrderItem(orderItem.id)
            .then(setReview)
            .catch(error => {
                // 404 is expected if review creation failed
                if (error?.response?.status !== 404) {
                    console.error('Error fetching review after creation:', error);
                }
            })
            .finally(() => setLoading(false));
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                disabled={loading}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {loading ? 'Checking...' : 'Review'}
            </button>
            
            <ReviewModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                orderItem={orderItem}
                onReviewCreated={handleReviewCreated}
            />
        </>
    );
};

export default ReviewButton;