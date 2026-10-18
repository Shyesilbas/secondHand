import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../../reviews/services/reviewService.js';
import { ORDER_QUERY_KEYS } from '../orderConstants.js';

const NO_REVIEWS = Object.freeze({});

/** Normalize order-item id so review maps stay consistent across API number/string shapes. */
export const reviewItemKey = (id) => (id === undefined || id === null || id === '' ? null : String(id));

export const orderItemIds = (orders) =>
 orders.flatMap((order) => (order?.orderItems || []).map((item) => reviewItemKey(item?.id ?? item?.orderItemId)).filter(Boolean));

const toReviewMap = (res) => {
 const list = Array.isArray(res) ? res : res?.content || res?.data || [];
 return Object.fromEntries(
 list.map((review) => [reviewItemKey(review?.orderItemId ?? review?.order_item_id), review]).filter(([key]) => key)
 );
};

/** Reviews for the given order items, keyed by order-item id. */
export const useOrderItemReviews = (ids, { enabled = true } = {}) => {
 const { data = NO_REVIEWS, isLoading } = useQuery({
 queryKey: ORDER_QUERY_KEYS.itemReviews(ids),
 queryFn: () => reviewService.getReviewsForOrderItems(ids),
 select: toReviewMap,
 enabled: enabled && ids.length > 0,
 });
 return { reviews: data, isLoading: enabled && ids.length > 0 && isLoading };
};
