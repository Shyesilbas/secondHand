import React, { useState } from 'react';
import { ReviewForm, reviewService } from '../index.js';

const ReviewButton = ({ orderItem, onReviewCreated }) => {
    const [showForm, setShowForm] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const checkExistingReview = async () => {
            try {
                const review = await reviewService.getReviewByOrderItem(orderItem.id);
                setExistingReview(review);
            } catch (error) {
                // No existing review found
                setExistingReview(null);
            }
        };

        if (orderItem && orderItem.id) {
            checkExistingReview();
        }
    }, [orderItem]);

    const canReview = orderItem?.order?.shippingStatus === 'DELIVERED';

    if (!canReview) {
        return null;
    }

    if (existingReview) {
        return (
            <div className="text-sm">
                <div className="flex items-center space-x-1 text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>Değerlendirildi ({existingReview.rating}/5)</span>
                </div>
            </div>
        );
    }

    if (showForm) {
        return (
            <ReviewForm
                orderItemId={orderItem.id}
                listingTitle={orderItem.listing?.title || orderItem.listing?.listingNo}
                onReviewCreated={() => {
                    setShowForm(false);
                    onReviewCreated?.();
                    // Refresh the existing review check
                    setLoading(true);
                    reviewService.getReviewByOrderItem(orderItem.id)
                        .then(setExistingReview)
                        .finally(() => setLoading(false));
                }}
                onCancel={() => setShowForm(false)}
            />
        );
    }

    return (
        <button
            onClick={() => setShowForm(true)}
            disabled={loading}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
            {loading ? 'Kontrol ediliyor...' : 'Değerlendir'}
        </button>
    );
};

export default ReviewButton;
