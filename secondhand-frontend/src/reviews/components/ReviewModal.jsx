import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Button, Modal } from '../../common/components/ui/index.js';
import { REVIEW_DEFAULTS, REVIEW_LIMITS, REVIEW_MESSAGES } from '../reviewConstants.js';
import { useReviewSubmission } from '../hooks/useReviewSubmission.js';
import { InteractiveStarRating } from './InteractiveStarRating.jsx';
const ReviewModal = ({
 isOpen,
 onClose,
 orderItem,
 onReviewCreated,
 fallbackOrderId
}) => {
 const {
 t
 } = useTranslation();
 const [rating, setRating] = useState(REVIEW_DEFAULTS.INITIAL_RATING);
 const [comment, setComment] = useState('');
 const {
 submitReview,
 loading,
 error,
 clearError
 } = useReviewSubmission();
 useEffect(() => {
 if (isOpen) {
 setRating(REVIEW_DEFAULTS.INITIAL_RATING);
 setComment('');
 clearError();
 }
 }, [isOpen, clearError]);
 const handleSubmit = async e => {
 e.preventDefault();
 await submitReview({
 orderItemId: orderItem.id,
 rating,
 comment,
 orderId: orderItem.orderId ?? orderItem.order?.id ?? fallbackOrderId,
 onSuccess: payload => {
 onReviewCreated?.(payload);
 onClose();
 }
 });
 };
 return <Modal isOpen={isOpen} onClose={onClose} title={t("product_review")} size="sm" footer={<>
 <Button variant="secondary" onClick={onClose}>{t("cancel")}</Button>
 <Button type="submit" form="review-form" disabled={loading || rating < REVIEW_LIMITS.MIN_RATING}>
 {loading ? REVIEW_MESSAGES.SENDING : REVIEW_MESSAGES.SEND_REVIEW}
 </Button>
 </>}>
 <div className="mb-5 border-b border-border-light pb-4">
 <p className="text-sm font-medium text-text-primary">
 {orderItem?.listing?.title || orderItem?.listing?.listingNo || 'Product'}
 </p>
 <p className="text-sm tabular-nums text-text-secondary">{t("order_no")}{orderItem?.orderId}</p>
 </div>

 <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
 <fieldset>
 <legend className="mb-2 text-sm font-medium text-text-primary">{t("your_rate")}</legend>
 <InteractiveStarRating value={rating} onChange={setRating} variant="modal" allowDeselect className="gap-2" />
 <p className="mt-1 text-sm tabular-nums text-text-secondary">
 {rating === REVIEW_DEFAULTS.INITIAL_RATING ? 'Click the stars for rating' : `${rating}/${REVIEW_LIMITS.MAX_RATING} stars`}
 </p>
 </fieldset>

 <div>
 <label htmlFor="review-comment" className="mb-1 block text-sm font-medium text-text-primary">{t("comment")}</label>
 <textarea id="review-comment" value={comment} onChange={e => setComment(e.target.value)} rows={4} maxLength={REVIEW_LIMITS.MAX_COMMENT_LENGTH} className="resize-none py-2 w-full rounded border border-border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder={t("share_your_thoughts_about_this_product")} />
 <p className="mt-1 text-right text-xs tabular-nums text-text-tertiary">
 {comment.length}/{REVIEW_LIMITS.MAX_COMMENT_LENGTH}{t("characters")}</p>
 </div>

 {error && <p role="alert" className="text-sm text-status-error-text">{error}</p>}
 </form>
 </Modal>;
};
export default ReviewModal;
