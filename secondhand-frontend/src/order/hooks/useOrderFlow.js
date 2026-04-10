import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { orderService } from '../services/orderService.js';
import { paymentService } from '../../payments/services/paymentService.js';
import { ORDER_QUERY_KEYS } from '../orderConstants.js';
import {
  ORDER_DEFAULTS,
  ORDER_MESSAGES,
  ORDER_STATUSES,
  ORDER_STATUS_TAB_FILTER,
  ORDER_TIME,
  ORDER_VIEW_MODES,
} from '../constants/orderUiConstants.js';

const useOrdersListQuery = ({ mode, page, size, sort, direction }) => {
  const { user } = useAuthState();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => {
    if (mode === ORDER_VIEW_MODES.SELLER) {
      return ORDER_QUERY_KEYS.sellerOrdersList(user?.id, page, size, sort, direction);
    }
    return ORDER_QUERY_KEYS.myOrders(user?.id, page, size, sort, direction);
  }, [mode, user?.id, page, size, sort, direction]);

  const queryFn = useCallback(async () => {
    if (mode === ORDER_VIEW_MODES.SELLER) {
      return await orderService.sellerOrders(page, size, sort, direction);
    }
    return await orderService.myOrders(page, size, sort, direction);
  }, [mode, page, size, sort, direction]);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn,
    enabled: !!user?.id,
    staleTime: 0,
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

export const usePendingCompletionOrders = (options = {}) => {
  const { user } = useAuthState();
  const location = useLocation();
  const enabled = options.enabled !== false && !!user?.id;

  const isRelevantPage =
    location.pathname.includes('/orders') ||
    location.pathname.includes('/dashboard') ||
    location.pathname === '/';

  const refetchInterval = isRelevantPage
    ? ORDER_TIME.PENDING_COMPLETION_REFRESH_ACTIVE_MS
    : ORDER_TIME.PENDING_COMPLETION_REFRESH_IDLE_MS;

  const { data, isLoading } = useQuery({
    queryKey: ORDER_QUERY_KEYS.pendingCompletion(user?.id),
    queryFn: () => orderService.getPendingCompletionStatus(),
    enabled,
    staleTime: ORDER_TIME.PENDING_COMPLETION_STALE_MS,
    gcTime: ORDER_TIME.ORDERS_QUERY_GC_MS,
    refetchInterval,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  return {
    hasPendingOrders: data?.hasPendingOrders ?? false,
    pendingCount: data?.pendingCount ?? 0,
    loading: isLoading,
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

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);

  const [searchResult, setSearchResult] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState(null);

  const [orderReviews, setOrderReviews] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewedOrderIds, setReviewedOrderIds] = useState({});
  const [reviewedOrderSummaries, setReviewedOrderSummaries] = useState({});

  const [searchParams, setSearchParams] = useSearchParams();
  const urlQ = searchParams.get('q') || '';

  const orderDetailRequestRef = useRef(0);

  const [searchTerm, setSearchTerm] = useState(urlQ);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    if (urlQ) setSearchTerm(urlQ);
  }, []);

  const lastUrlQ = useRef('');
  useEffect(() => {
    if (!urlQ) return;
    if (urlQ === lastUrlQ.current) return;
    lastUrlQ.current = urlQ;
    setSearchLoading(true);
    orderService.getByOrderNumber(urlQ.trim())
      .then((order) => {
        if (order) {
          setSearchOrder(order);
          setIsSearchMode(true);
          setSearchTerm('');
          setSearchError(null);
        } else {
          setSearchResult(null);
          setIsSearchMode(false);
          setSearchError(ORDER_MESSAGES.ORDER_NOT_FOUND);
        }
      })
      .catch(() => {
        setSearchError(ORDER_MESSAGES.ORDER_NOT_FOUND);
        setSearchResult(null);
        setIsSearchMode(false);
      })
      .finally(() => setSearchLoading(false));
  }, [urlQ]);

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingOrderName, setEditingOrderName] = useState('');
  const [showNameBanner, setShowNameBanner] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, loading, error, refresh } = useOrdersListQuery({
    mode,
    page,
    size,
    sort: sortField,
    direction: sortDirection,
  });

  const escrow = usePendingEscrowAmount({ enabled: viewMode === ORDER_VIEW_MODES.SELLER });

  useEffect(() => {
    setPage(initialPage);
    setSize(initialSize);
    setSearchResult(null);
    setSearchTerm('');
    setSearchError(null);
    setIsSearchMode(false);
  }, [initialPage, initialSize, viewMode]);

  const ordersRaw = useMemo(() => data?.content || [], [data]);
  const ordersUnfiltered = useMemo(() => (searchResult ? [searchResult] : ordersRaw), [ordersRaw, searchResult]);
  const orders = useMemo(() => {
    if (!statusFilter) return ordersUnfiltered;
    if (statusFilter === ORDER_STATUS_TAB_FILTER.PREPARING) {
      return ordersUnfiltered.filter((o) =>
        [ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.PROCESSING].includes(o.status)
      );
    }
    if (statusFilter === ORDER_STATUS_TAB_FILTER.DELIVERED_GROUP) {
      return ordersUnfiltered.filter((o) =>
        [ORDER_STATUSES.DELIVERED, ORDER_STATUSES.COMPLETED].includes(o.status)
      );
    }
    return ordersUnfiltered.filter((o) => o.status === statusFilter);
  }, [ordersUnfiltered, statusFilter]);

  useEffect(() => {
    let cancelled = false;

    const fetchListReviewState = async () => {
      if (mode === ORDER_VIEW_MODES.SELLER || !orders?.length) {
        setReviewedOrderIds({});
        setReviewedOrderSummaries({});
        return;
      }

      const reviewEligibleOrders = orders.filter((order) =>
        [ORDER_STATUSES.DELIVERED, ORDER_STATUSES.COMPLETED].includes(order?.status)
      );
      const orderItemIds = reviewEligibleOrders.flatMap((order) =>
        (order?.orderItems || []).map((item) => item?.id).filter(Boolean)
      );

      if (!orderItemIds.length) {
        setReviewedOrderIds({});
        setReviewedOrderSummaries({});
        return;
      }

      try {
        const { reviewService } = await import('../../reviews/services/reviewService.js');
        const reviewsResponse = await reviewService.getReviewsForOrderItems(orderItemIds);
        if (cancelled) return;

        const reviewedItems = new Set(
          Array.isArray(reviewsResponse)
            ? reviewsResponse.map((review) => review?.orderItemId).filter(Boolean)
            : []
        );

        const orderReviewMap = {};
        const orderReviewSummaryMap = {};
        reviewEligibleOrders.forEach((order) => {
          const firstReviewedItem = (order?.orderItems || []).find((item) => reviewedItems.has(item?.id));
          const hasReviewedItem = Boolean(firstReviewedItem);
          if (hasReviewedItem) {
            orderReviewMap[order.id] = true;
            const reviewDetails = Array.isArray(reviewsResponse)
              ? reviewsResponse.find((review) => review?.orderItemId === firstReviewedItem?.id)
              : null;
            if (reviewDetails) {
              orderReviewSummaryMap[order.id] = {
                rating: reviewDetails.rating,
                comment: reviewDetails.comment,
              };
            }
          }
        });

        setReviewedOrderIds(orderReviewMap);
        setReviewedOrderSummaries(orderReviewSummaryMap);
      } catch {
        if (!cancelled) {
          setReviewedOrderIds({});
          setReviewedOrderSummaries({});
        }
      }
    };

    fetchListReviewState();
    return () => {
      cancelled = true;
    };
  }, [mode, orders]);

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

  const loadPage = useCallback(
    (newPage) => {
      if (isSearchMode) return;
      setPage(newPage);
    },
    [isSearchMode]
  );

  const fetchOrders = useCallback((newPage, newSize, newSort, newDirection) => {
    setPage(newPage);
    if (newSize !== undefined && newSize !== null) setSize(newSize);
    if (newSort !== undefined) setSortField(newSort);
    if (newDirection !== undefined) setSortDirection(newDirection);
  }, []);

  const setSearchOrder = useCallback((order) => {
    setSearchResult(order);
  }, []);

  const handleSearch = useCallback(
    async (e) => {
      e.preventDefault();
      if (!searchTerm.trim()) return;

      const term = searchTerm.trim();
      setSearchLoading(true);
      setSearchError(null);

      try {
        const order = await orderService.getByOrderNumber(term);
        if (order) {
          setSearchOrder(order);
          setIsSearchMode(true);
          setSearchTerm('');
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('q', term);
            return next;
          });
        } else {
          setSearchResult(null);
          setIsSearchMode(false);
          setSearchError(ORDER_MESSAGES.ORDER_NOT_FOUND);
        }
      } catch (err) {
        setSearchError(ORDER_MESSAGES.ORDER_NOT_FOUND);
        setSearchResult(null);
        setIsSearchMode(false);
      } finally {
        setSearchLoading(false);
      }
    },
    [searchTerm, setSearchOrder, setSearchParams]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchError(null);
    setIsSearchMode(false);
    setSearchResult(null);
    lastUrlQ.current = '';
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('q');
      return next;
    });
    refresh();
  }, [refresh, setSearchParams]);

  const openReceipt = useCallback(async (paymentReference) => {
    try {
      const payments = await paymentService.getMyPayments(
        ORDER_DEFAULTS.INITIAL_PAGE,
        ORDER_DEFAULTS.SEARCH_PAYMENT_FETCH_SIZE
      );
      const list = payments.content || [];
      const payment = list.find((p) => String(p.paymentId) === String(paymentReference));
      if (payment) {
        setReceiptPayment(payment);
        setReceiptOpen(true);
      }
    } catch (e) {}
  }, []);

  const closeReceipt = useCallback(() => {
    setReceiptOpen(false);
    setReceiptPayment(null);
  }, []);

  const fetchReviewsData = useCallback(async (order, detailRequestId) => {
    const stillCurrent = () => detailRequestId === undefined || orderDetailRequestRef.current === detailRequestId;

    if (!order?.orderItems || order.orderItems.length === 0) {
      if (stillCurrent()) setOrderReviews({});
      return;
    }

    setReviewsLoading(true);
    try {
      if (order.status !== ORDER_STATUSES.DELIVERED && order.status !== ORDER_STATUSES.COMPLETED) {
        if (stillCurrent()) setOrderReviews({});
        return;
      }

      const orderItemIds = order.orderItems.map((item) => item.id);
      const { reviewService } = await import('../../reviews/services/reviewService.js');
      const reviewsResponse = await reviewService.getReviewsForOrderItems(orderItemIds);

      if (!stillCurrent()) return;

      const reviewsMap = {};
      if (reviewsResponse && Array.isArray(reviewsResponse)) {
        reviewsResponse.forEach((review) => {
          if (review.orderItemId) {
            reviewsMap[review.orderItemId] = review;
          }
        });
      }

      setOrderReviews(reviewsMap);
    } finally {
      if (stillCurrent()) setReviewsLoading(false);
    }
  }, []);

  const clearReviews = useCallback(() => {
    setOrderReviews({});
  }, []);

  const openOrderModal = useCallback(
    async (order) => {
      const requestId = ++orderDetailRequestRef.current;
      try {
        const freshOrder = mode === ORDER_VIEW_MODES.SELLER
          ? await orderService.getSellerOrderById(order.id)
          : await orderService.getById(order.id);
        if (orderDetailRequestRef.current !== requestId) return;
        setSelectedOrder(freshOrder);
        setOrderModalOpen(true);
        if (mode !== ORDER_VIEW_MODES.SELLER) {
          await fetchReviewsData(freshOrder, requestId);
        }
      } catch (e) {
        if (orderDetailRequestRef.current !== requestId) return;
        setSelectedOrder(order);
        setOrderModalOpen(true);
      }
    },
    [mode, fetchReviewsData]
  );

  const closeOrderModal = useCallback(() => {
    setOrderModalOpen(false);
    setSelectedOrder(null);
  }, []);

  const refreshSelectedOrder = useCallback(async () => {
    if (!selectedOrder?.id) return;
    const requestId = ++orderDetailRequestRef.current;
    const updatedOrder = mode === ORDER_VIEW_MODES.SELLER
      ? await orderService.getSellerOrderById(selectedOrder.id)
      : await orderService.getById(selectedOrder.id);
    if (orderDetailRequestRef.current !== requestId) return;
    setSelectedOrder(updatedOrder);
    if (mode !== ORDER_VIEW_MODES.SELLER) {
      await fetchReviewsData(updatedOrder, requestId);
    }
  }, [selectedOrder?.id, mode, fetchReviewsData]);

  const handleReviewSuccess = useCallback(async () => {
    refresh();
    await refreshSelectedOrder();
  }, [refresh, refreshSelectedOrder]);

  const startEditOrderName = useCallback((order, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    setEditingOrderId(order.id);
    setEditingOrderName(order.name || '');
  }, []);

  const cancelEditOrderName = useCallback(() => {
    setEditingOrderId(null);
    setEditingOrderName('');
  }, []);

  const saveOrderName = useCallback(
    async (orderId, e) => {
      if (e?.stopPropagation) e.stopPropagation();
      await orderService.updateOrderName(orderId, editingOrderName);
      cancelEditOrderName();
      refresh();
    },
    [editingOrderName, cancelEditOrderName, refresh]
  );

  const completeOrder = useCallback(
    async (orderId, e) => {
      if (e?.stopPropagation) e.stopPropagation();
      const ok = window.confirm(ORDER_MESSAGES.CONFIRM_COMPLETE_ORDER);
      if (!ok) return;
      await orderService.completeOrder(orderId);
      refresh();
    },
    [refresh]
  );

  const dismissNameBanner = useCallback(() => {
    setShowNameBanner(false);
  }, []);

  const refreshAll = useCallback(() => {
    refresh();
    if (viewMode === ORDER_VIEW_MODES.SELLER) {
      escrow.refetch();
    }
  }, [refresh, escrow, viewMode]);

  return {
    viewMode,
    mode,
    orders,
    ordersRaw,
    loading,
    error: error?.message || null,
    pagination,
    page,
    size,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    loadPage,
    fetchOrders,
    refresh,
    refreshAll,
    setSearchOrder,
    search: {
      searchTerm,
      setSearchTerm,
      searchLoading,
      searchError,
      isSearchMode,
      handleSearch,
      clearSearch,
      statusFilter,
      setStatusFilter,
    },
    modal: {
      selectedOrder,
      setSelectedOrder,
      orderModalOpen,
      openOrderModal,
      closeOrderModal,
    },
    receipt: {
      receiptOpen,
      receiptPayment,
      openReceipt,
      closeReceipt,
    },
    reviews: {
      orderReviews,
      reviewsLoading,
      fetchReviewsData,
      clearReviews,
      reviewedOrderIds,
      reviewedOrderSummaries,
    },
    ui: {
      editingOrderId,
      editingOrderName,
      setEditingOrderName,
      showNameBanner,
      dismissNameBanner,
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

