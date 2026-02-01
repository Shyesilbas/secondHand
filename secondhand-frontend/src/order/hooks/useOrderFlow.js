import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { orderService } from '../services/orderService.js';
import { paymentService } from '../../payments/services/paymentService.js';
import { ORDER_QUERY_KEYS } from '../orderConstants.js';

const useOrdersListQuery = ({ mode, page, size, sort, direction }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => {
    if (mode === 'seller') {
      return ORDER_QUERY_KEYS.sellerOrdersList(user?.id, page, size, sort, direction);
    }
    return ORDER_QUERY_KEYS.myOrders(user?.id, page, size, sort, direction);
  }, [mode, user?.id, page, size, sort, direction]);

  const queryFn = useCallback(async () => {
    if (mode === 'seller') {
      return await orderService.sellerOrders(page, size, sort, direction);
    }
    return await orderService.myOrders(page, size, sort, direction);
  }, [mode, page, size, sort, direction]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn,
    enabled: !!user?.id,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: mode === 'seller' ? ORDER_QUERY_KEYS.sellerOrders : ORDER_QUERY_KEYS.orders,
    });
    refetch();
  }, [queryClient, refetch, mode]);

  return {
    data,
    loading: isLoading,
    error,
    refresh,
  };
};

export const usePendingCompletionOrders = (options = {}) => {
  const { user } = useAuth();
  const location = useLocation();
  const enabled = options.enabled !== false && !!user?.id;

  const isRelevantPage =
    location.pathname.includes('/orders') ||
    location.pathname.includes('/dashboard') ||
    location.pathname === '/';

  const refetchInterval = isRelevantPage ? 2 * 60 * 1000 : 5 * 60 * 1000;

  const { data, isLoading } = useQuery({
    queryKey: ORDER_QUERY_KEYS.pendingCompletion(user?.id),
    queryFn: () => orderService.getPendingCompletionStatus(),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
  const { user } = useAuth();
  const enabled = options.enabled !== false && !!user?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ORDER_QUERY_KEYS.pendingEscrow(user?.id),
    queryFn: async () => {
      const response = await orderService.getPendingEscrowAmount();
      return response.amount || 0;
    },
    enabled,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
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
  viewMode = 'buyer',
  initialPage = 0,
  initialSize = 5,
  initialSortField = null,
  initialSortDirection = 'desc',
}) => {
  const mode = viewMode === 'seller' ? 'seller' : 'buyer';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingOrderName, setEditingOrderName] = useState('');
  const [showNameBanner, setShowNameBanner] = useState(true);

  const { data, loading, error, refresh } = useOrdersListQuery({
    mode,
    page,
    size,
    sort: sortField,
    direction: sortDirection,
  });

  const escrow = usePendingEscrowAmount({ enabled: viewMode === 'seller' });

  useEffect(() => {
    setPage(initialPage);
    setSize(initialSize);
    setSearchResult(null);
    setSearchTerm('');
    setSearchError(null);
    setIsSearchMode(false);
  }, [initialPage, initialSize, viewMode]);

  const ordersRaw = useMemo(() => data?.content || [], [data]);
  const orders = useMemo(() => (searchResult ? [searchResult] : ordersRaw), [ordersRaw, searchResult]);

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

      setSearchLoading(true);
      setSearchError(null);

      try {
        const order = await orderService.getByOrderNumber(searchTerm.trim());
        if (order) {
          setSearchOrder(order);
          setIsSearchMode(true);
          setSearchTerm('');
        }
      } catch (err) {
        setSearchError('Order not found. Please check the order number.');
      } finally {
        setSearchLoading(false);
      }
    },
    [searchTerm, setSearchOrder]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchError(null);
    setIsSearchMode(false);
    setSearchResult(null);
    refresh();
  }, [refresh]);

  const openReceipt = useCallback(async (paymentReference) => {
    try {
      const payments = await paymentService.getMyPayments(0, 20);
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

  const fetchReviewsData = useCallback(async (order) => {
    if (!order?.orderItems || order.orderItems.length === 0) return;

    setReviewsLoading(true);
    try {
      if (order.status !== 'DELIVERED' && order.status !== 'COMPLETED') {
        setOrderReviews({});
        return;
      }

      const orderItemIds = order.orderItems.map((item) => item.id);
      const { reviewService } = await import('../../reviews/services/reviewService.js');
      const reviewsResponse = await reviewService.getReviewsForOrderItems(orderItemIds);

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
      setReviewsLoading(false);
    }
  }, []);

  const clearReviews = useCallback(() => {
    setOrderReviews({});
  }, []);

  const openOrderModal = useCallback(
    async (order) => {
      try {
        const freshOrder = mode === 'seller' ? await orderService.getSellerOrderById(order.id) : await orderService.getById(order.id);
        setSelectedOrder(freshOrder);
        setOrderModalOpen(true);
        if (mode !== 'seller') {
          await fetchReviewsData(freshOrder);
        }
      } catch (e) {
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
    const updatedOrder = mode === 'seller' ? await orderService.getSellerOrderById(selectedOrder.id) : await orderService.getById(selectedOrder.id);
    setSelectedOrder(updatedOrder);
    if (mode !== 'seller') {
      await fetchReviewsData(updatedOrder);
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
      const ok = window.confirm('Are you sure you want to complete this order? This action cannot be undone.');
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
    if (viewMode === 'seller') {
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

