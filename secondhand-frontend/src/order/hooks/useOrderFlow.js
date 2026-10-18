import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { orderService } from '../services/orderService.js';
import { paymentService } from '../../payments/services/paymentService.js';
import { ORDER_QUERY_KEYS } from '../orderConstants.js';
import { orderItemIds, reviewItemKey, useOrderItemReviews } from './useOrderItemReviews.js';
import { useOrderSearch } from './useOrderSearch.js';
import {
 ORDER_DEFAULTS,
 ORDER_MESSAGES,
 ORDER_STATUSES,
 ORDER_STATUS_TAB_FILTER,
 ORDER_TIME,
 ORDER_VIEW_MODES,
} from '../constants/orderUiConstants.js';

const REVIEWABLE_STATUSES = [ORDER_STATUSES.DELIVERED, ORDER_STATUSES.COMPLETED, ORDER_STATUSES.HANDOVER_CONFIRMED];

const useOrdersListQuery = ({ mode, page, size, sort, direction, deliveryMethod }) => {
 const { user } = useAuthState();
 const queryClient = useQueryClient();

 const queryKey = useMemo(() => {
 if (mode === ORDER_VIEW_MODES.SELLER) {
 return ORDER_QUERY_KEYS.sellerOrdersList(user?.id, page, size, sort, direction, deliveryMethod);
 }
 return ORDER_QUERY_KEYS.myOrders(user?.id, page, size, sort, direction, deliveryMethod);
 }, [mode, user?.id, page, size, sort, direction, deliveryMethod]);

 const queryFn = useCallback(async () => {
 if (mode === ORDER_VIEW_MODES.SELLER) {
 return await orderService.sellerOrders(page, size, sort, direction, deliveryMethod);
 }
 return await orderService.myOrders(page, size, sort, direction, deliveryMethod);
 }, [mode, page, size, sort, direction, deliveryMethod]);

 const { data, isLoading, error } = useQuery({
 queryKey,
 queryFn,
 enabled: !!user?.id,
 staleTime: ORDER_TIME.ORDERS_LIST_STALE_MS,
 gcTime: ORDER_TIME.ORDERS_QUERY_GC_MS,
 refetchOnWindowFocus: false,
 refetchOnMount: 'always',
 });

 const refresh = useCallback(() => {
 queryClient.invalidateQueries({
 queryKey: mode === ORDER_VIEW_MODES.SELLER ? ORDER_QUERY_KEYS.sellerOrders : ORDER_QUERY_KEYS.orders,
 });
 }, [queryClient, mode]);

 return {
 data,
 loading: isLoading,
 error,
 refresh,
 };
};

export const usePendingEscrowAmount = (options = {}) => {
 const { user } = useAuthState();
 const enabled = options.enabled !== false && !!user?.id;

 const { data, isLoading, error, refetch } = useQuery({
 queryKey: ORDER_QUERY_KEYS.pendingEscrow(user?.id),
 queryFn: async () => {
 const response = await orderService.getPendingEscrowAmount();
 return response.amount || 0;
 },
 enabled,
 staleTime: ORDER_TIME.PENDING_ESCROW_STALE_MS,
 gcTime: ORDER_TIME.ESCROW_QUERY_GC_MS,
 refetchInterval: ORDER_TIME.PENDING_ESCROW_REFRESH_MS,
 refetchOnWindowFocus: false,
 refetchOnMount: true,
 });

 return {
 pendingEscrowAmount: data ?? 0,
 isLoading,
 error: error?.message || null,
 refetch,
 };
};

export const useOrderFlow = ({
 viewMode = ORDER_VIEW_MODES.BUYER,
 initialPage = ORDER_DEFAULTS.INITIAL_PAGE,
 initialSize = ORDER_DEFAULTS.INITIAL_PAGE_SIZE,
 initialSortField = null,
 initialSortDirection = ORDER_DEFAULTS.SORT_DIRECTION,
}) => {
 const mode = viewMode === ORDER_VIEW_MODES.SELLER ? ORDER_VIEW_MODES.SELLER : ORDER_VIEW_MODES.BUYER;
 const isBuyer = mode === ORDER_VIEW_MODES.BUYER;
 const notification = useNotification();
 const queryClient = useQueryClient();

 const [page, setPage] = useState(initialPage);
 const [size, setSize] = useState(initialSize);
 const [sortField, setSortField] = useState(initialSortField);
 const [sortDirection, setSortDirection] = useState(initialSortDirection);
 const [deliveryMethodFilter, setDeliveryMethod] = useState('ALL');
 const [statusFilter, setStatusFilter] = useState('');

 const [selectedOrder, setSelectedOrder] = useState(null);
 const [receiptPayment, setReceiptPayment] = useState(null);
 const [quickReviewTarget, setQuickReviewTarget] = useState(null);

 const [editingOrderId, setEditingOrderId] = useState(null);
 const [editingOrderName, setEditingOrderName] = useState('');
 const [showNameBanner, setShowNameBanner] = useState(true);

 const search = useOrderSearch();
 const { data, loading, error, refresh } = useOrdersListQuery({
 mode,
 page,
 size,
 sort: sortField,
 direction: sortDirection,
 deliveryMethod: deliveryMethodFilter,
 });
 const escrow = usePendingEscrowAmount({ enabled: !isBuyer });

 const setDeliveryMethodFilter = useCallback((method) => {
 setDeliveryMethod(method);
 setPage(0);
 }, []);

 const ordersRaw = useMemo(() => data?.content || [], [data]);
 const orders = useMemo(() => {
 const list = search.searchResult ? [search.searchResult] : ordersRaw;
 if (!statusFilter) return list;
 if (statusFilter === ORDER_STATUS_TAB_FILTER.PREPARING) {
 return list.filter((o) => [ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.PROCESSING].includes(o.status));
 }
 if (statusFilter === ORDER_STATUS_TAB_FILTER.DELIVERED_GROUP) {
 return list.filter((o) => REVIEWABLE_STATUSES.includes(o.status));
 }
 return list.filter((o) => o.status === statusFilter);
 }, [ordersRaw, search.searchResult, statusFilter]);

 // Buyer list: which delivered orders already carry a review (first reviewed item is the summary).
 const reviewableOrders = useMemo(
 () => (isBuyer ? orders.filter((o) => REVIEWABLE_STATUSES.includes(o?.status)) : []),
 [isBuyer, orders]
 );
 const reviewableItemIds = useMemo(() => orderItemIds(reviewableOrders), [reviewableOrders]);
 const { reviews: listReviews } = useOrderItemReviews(reviewableItemIds);
 const reviewedOrderSummaries = useMemo(() => {
 const summaries = {};
 reviewableOrders.forEach((order) => {
 const review = (order.orderItems || [])
 .map((item) => listReviews[reviewItemKey(item?.id ?? item?.orderItemId)])
 .find(Boolean);
 if (review) summaries[order.id] = { rating: review.rating, comment: review.comment };
 });
 return summaries;
 }, [reviewableOrders, listReviews]);

 const pagination = useMemo(
 () => ({
 number: data?.pageable?.pageNumber ?? data?.number ?? page,
 size: data?.pageable?.pageSize ?? data?.size ?? size,
 totalPages: data?.totalPages ?? 0,
 totalElements: data?.totalElements ?? 0,
 first: data?.first ?? true,
 last: data?.last ?? false,
 }),
 [data, page, size]
 );

 const loadPage = useCallback((newPage) => {
 if (!search.isSearchMode) setPage(newPage);
 }, [search.isSearchMode]);

 const fetchOrders = useCallback((newPage, newSize, newSort, newDirection) => {
 setPage(newPage);
 if (newSize !== undefined && newSize !== null) setSize(newSize);
 if (newSort !== undefined) setSortField(newSort);
 if (newDirection !== undefined) setSortDirection(newDirection);
 }, []);

 const openReceipt = useCallback(async (paymentReference) => {
 try {
 const payments = await paymentService.getMyPayments(ORDER_DEFAULTS.INITIAL_PAGE, ORDER_DEFAULTS.SEARCH_PAYMENT_FETCH_SIZE);
 const payment = (payments.content || []).find((p) => String(p.paymentId) === String(paymentReference));
 if (payment) setReceiptPayment(payment);
 else notification.showError('Receipt', ORDER_MESSAGES.RECEIPT_NOT_FOUND);
 } catch (err) {
 notification.showError('Receipt', err?.response?.data?.message || ORDER_MESSAGES.RECEIPT_LOAD_FAILED);
 }
 }, [notification]);

 const closeReceipt = useCallback(() => setReceiptPayment(null), []);
 const closeOrderModal = useCallback(() => setSelectedOrder(null), []);
 const closeQuickReview = useCallback(() => setQuickReviewTarget(null), []);

 const openQuickReviewForOrder = useCallback((order) => {
 const unrated = isBuyer && (order?.orderItems || []).find((item) => {
 const key = reviewItemKey(item?.id);
 return key && !listReviews[key];
 });
 if (unrated) setQuickReviewTarget({ orderItem: unrated, orderId: order.id });
 else setSelectedOrder(order);
 }, [isBuyer, listReviews]);

 // Order list, detail and item reviews all live under the `orders` key, so one invalidation refreshes them.
 const handleReviewSuccess = useCallback(() => {
 queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.orders });
 refresh();
 }, [queryClient, refresh]);

 const handleQuickReviewCreated = useCallback((payload) => {
 notification.showSuccess(
 ORDER_MESSAGES.REVIEW_SUBMITTED_TITLE,
 payload?.comment?.trim() ? ORDER_MESSAGES.REVIEW_SUBMITTED_WITH_COMMENT : ORDER_MESSAGES.REVIEW_SUBMITTED_RATING_ONLY
 );
 handleReviewSuccess();
 }, [handleReviewSuccess, notification]);

 const startEditOrderName = useCallback((order, e) => {
 e?.stopPropagation?.();
 setEditingOrderId(order.id);
 setEditingOrderName(order.name || '');
 }, []);

 const cancelEditOrderName = useCallback(() => {
 setEditingOrderId(null);
 setEditingOrderName('');
 }, []);

 const saveOrderName = useCallback(async (orderId, e) => {
 e?.stopPropagation?.();
 try {
 await orderService.updateOrderName(orderId, editingOrderName);
 cancelEditOrderName();
 refresh();
 } catch (err) {
 notification.showError('Error', err?.response?.data?.message || ORDER_MESSAGES.UPDATE_NAME_FAILED);
 }
 }, [editingOrderName, cancelEditOrderName, refresh, notification]);

 const completeOrder = useCallback((orderId, e) => {
 e?.stopPropagation?.();
 notification.showConfirmation(
 ORDER_MESSAGES.CONFIRM_ORDER_MODAL_TITLE,
 ORDER_MESSAGES.CONFIRM_ORDER_MODAL_BODY,
 async () => {
 try {
 await orderService.completeOrder(orderId);
 refresh();
 } catch (err) {
 notification.showError('Error', err?.response?.data?.message || ORDER_MESSAGES.COMPLETE_ORDER_FAILED);
 }
 },
 { confirmLabel: ORDER_MESSAGES.CONFIRM_ORDER_BUTTON, cancelLabel: ORDER_MESSAGES.CANCEL_ORDER_BUTTON }
 );
 }, [notification, refresh]);

 const refreshAll = useCallback(() => {
 refresh();
 if (!isBuyer) escrow.refetch();
 }, [refresh, escrow, isBuyer]);

 return {
 viewMode,
 orders,
 loading,
 error: error?.message || null,
 pagination,
 deliveryMethodFilter,
 setDeliveryMethodFilter,
 sortField,
 sortDirection,
 loadPage,
 fetchOrders,
 refreshAll,
 search: { ...search, statusFilter, setStatusFilter },
 modal: {
 selectedOrder,
 orderModalOpen: !!selectedOrder,
 openOrderModal: setSelectedOrder,
 closeOrderModal,
 },
 receipt: {
 receiptOpen: !!receiptPayment,
 receiptPayment,
 openReceipt,
 closeReceipt,
 },
 reviews: { reviewedOrderSummaries },
 reviewQuick: {
 isOpen: !!quickReviewTarget,
 target: quickReviewTarget,
 openForOrder: openQuickReviewForOrder,
 close: closeQuickReview,
 onReviewCreated: handleQuickReviewCreated,
 },
 ui: {
 editingOrderId,
 editingOrderName,
 setEditingOrderName,
 showNameBanner,
 dismissNameBanner: () => setShowNameBanner(false),
 },
 actions: {
 handleReviewSuccess,
 startEditOrderName,
 cancelEditOrderName,
 saveOrderName,
 completeOrder,
 },
 escrow,
 };
};
