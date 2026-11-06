import { useCallback, useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
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
 ORDER_LIST_TABS,
 ORDER_STATUSES,
 ORDER_TIME,
 ORDER_VIEW_MODES,
 getOrderTabStatuses,
} from '../constants/orderUiConstants.js';

const REVIEWABLE_STATUSES = [ORDER_STATUSES.DELIVERED, ORDER_STATUSES.COMPLETED, ORDER_STATUSES.HANDOVER_CONFIRMED];

const useOrdersListQuery = ({ mode, page, size, sort, direction, deliveryMethod, statuses, orderNumber }) => {
 const { user } = useAuthState();
 const queryClient = useQueryClient();
 const isSeller = mode === ORDER_VIEW_MODES.SELLER;

 const queryKey = useMemo(() => (
 isSeller
 ? ORDER_QUERY_KEYS.sellerOrdersList(user?.id, page, size, sort, direction, deliveryMethod, statuses, orderNumber)
 : ORDER_QUERY_KEYS.myOrders(user?.id, page, size, sort, direction, deliveryMethod, statuses, orderNumber)
 ), [isSeller, user?.id, page, size, sort, direction, deliveryMethod, statuses, orderNumber]);

 const queryFn = useCallback(() => {
 const filters = { statuses, orderNumber };
 return isSeller
 ? orderService.sellerOrders(page, size, sort, direction, deliveryMethod, filters)
 : orderService.myOrders(page, size, sort, direction, deliveryMethod, filters);
 }, [isSeller, page, size, sort, direction, deliveryMethod, statuses, orderNumber]);

 const { data, isLoading, error } = useQuery({
 queryKey,
 queryFn,
 enabled: !!user?.id,
 staleTime: ORDER_TIME.ORDERS_LIST_STALE_MS,
 gcTime: ORDER_TIME.ORDERS_QUERY_GC_MS,
 refetchOnWindowFocus: false,
 refetchOnMount: 'always',
 placeholderData: keepPreviousData,
 });

 const countsQuery = useQuery({
 queryKey: isSeller
 ? ORDER_QUERY_KEYS.sellerStatusCounts(user?.id, deliveryMethod)
 : ORDER_QUERY_KEYS.myStatusCounts(user?.id, deliveryMethod),
 queryFn: () => (isSeller
 ? orderService.sellerOrderStatusCounts(deliveryMethod)
 : orderService.myOrderStatusCounts(deliveryMethod)),
 enabled: !!user?.id,
 staleTime: ORDER_TIME.ORDERS_LIST_STALE_MS,
 refetchOnWindowFocus: false,
 });

 const statusCounts = useMemo(() => {
 const counts = {};
 (countsQuery.data || []).forEach(({ status, count }) => {
 counts[status] = Number(count) || 0;
 });
 return counts;
 }, [countsQuery.data]);

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
 statusCounts,
 countsLoaded: countsQuery.isSuccess,
 countsError: countsQuery.isError,
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
 const [activeTab, setActiveTabState] = useState(ORDER_LIST_TABS.ALL);

 const [selectedOrder, setSelectedOrder] = useState(null);
 const [receiptPayment, setReceiptPayment] = useState(null);
 const [quickReviewTarget, setQuickReviewTarget] = useState(null);

 const search = useOrderSearch();
 // A number search looks across every status, so the tab filter is ignored while it is active.
 const tabStatuses = useMemo(
 () => (search.isSearchMode ? [] : getOrderTabStatuses(activeTab, mode)),
 [activeTab, mode, search.isSearchMode]
 );
 const { data, loading, error, refresh, statusCounts, countsLoaded, countsError } = useOrdersListQuery({
 mode,
 page,
 size,
 sort: sortField,
 direction: sortDirection,
 deliveryMethod: deliveryMethodFilter,
 statuses: tabStatuses,
 orderNumber: search.orderNumber,
 });
 const escrow = usePendingEscrowAmount({ enabled: !isBuyer });

 const setDeliveryMethodFilter = useCallback((method) => {
 setDeliveryMethod(method);
 setPage(0);
 }, []);

 const setActiveTab = useCallback((tab) => {
 setActiveTabState(tab);
 setPage(0);
 }, []);

 const orders = useMemo(() => data?.content || [], [data]);

 /** Order count for a tab, summed from the per-status counts; null until counts load. */
 const getTabCount = useCallback((tab) => {
 if (!countsLoaded) return null;
 const statuses = getOrderTabStatuses(tab, mode);
 const keys = statuses.length ? statuses : Object.keys(statusCounts);
 return keys.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
 }, [countsLoaded, statusCounts, mode]);

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

 const loadPage = useCallback((newPage) => setPage(newPage), []);

 // A new order-number search starts from the first page.
 useEffect(() => {
 setPage(0);
 }, [search.orderNumber]);

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
 search,
 tabs: { activeTab, setActiveTab, getTabCount, statusCounts, countsError },
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
 actions: {
 handleReviewSuccess,
 completeOrder,
 },
 escrow,
 };
};
