import React, {useState} from 'react';
import {reviewService} from '../services/reviewService.js';
import ReviewModal from './ReviewModal.jsx';

const ReviewButton = ({ orderItem, onReviewCreated }) => {
    const [showModal, setShowModal] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const checkExistingReview = async () => {
            try {
                const review = await reviewService.getReviewByOrderItem(orderItem.id);
                setExistingReview(review);
            } catch (error) {
                                setExistingReview(null);
            }
        };

        if (orderItem && orderItem.id) {
            checkExistingReview();
        }
    }, [orderItem]);

    const canReview = orderItem?.shippingStatus === 'DELIVERED';
    
        console.log('ReviewButton Debug:', {
        orderItemId: orderItem?.id,
        shippingStatus: orderItem?.shippingStatus,
        canReview
    });

    if (!canReview) {
        return null;
    }

    if (existingReview) {
        return (
            <div className="text-sm">
                <div className="flex items-center space-x-1 text-green-600">
                    <span className="text-lg">⭐</span>
                    <span>Reviewed! ({existingReview.rating}/5)</span>
                </div>
            </div>
        );
    }

    const handleReviewCreated = () => {
        onReviewCreated?.();
                setLoading(true);
        reviewService.getReviewByOrderItem(orderItem.id)
            .then(setExistingReview)
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