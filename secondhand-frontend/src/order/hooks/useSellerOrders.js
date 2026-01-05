import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService.js';

export const useSellerOrders = (initialPage = 0, initialSize = 10, sortField = null, sortDirection = 'desc') => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [pagination, setPagination] = useState({
    number: initialPage,
    size: initialSize,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: false
  });

  const fetchOrders = useCallback(async (page = pagination.number, size = pagination.size, sort = sortField, direction = sortDirection) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.sellerOrders(page, size, sort, direction);
      
      const data = response.data || response;
      
      setOrders(data.content || []);
      setPagination({
        number: data.pageable?.pageNumber || data.number || page,
        size: data.pageable?.pageSize || data.size || size,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        first: data.first || false,
        last: data.last || false
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch seller orders');
      console.error('Error fetching seller orders:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.number, pagination.size, sortField, sortDirection]);

  const loadPage = useCallback((page) => {
    fetchOrders(page, pagination.size, sortField, sortDirection);
  }, [fetchOrders, pagination.size, sortField, sortDirection]);

  const refresh = useCallback(() => {
    setSearchResult(null);
    fetchOrders(pagination.number, pagination.size, sortField, sortDirection);
  }, [fetchOrders, pagination.number, pagination.size, sortField, sortDirection]);

  const setSearchOrder = useCallback((order) => {
    setSearchResult(order);
  }, []);

  useEffect(() => {
    if (!searchResult) {
      fetchOrders(initialPage, initialSize, sortField, sortDirection);
    }
  }, [sortField, sortDirection]);

  return {
    orders: searchResult ? [searchResult] : orders,
    loading,
    error,
    pagination,
    fetchOrders,
    loadPage,
    refresh,
    setSearchOrder
  };
};

