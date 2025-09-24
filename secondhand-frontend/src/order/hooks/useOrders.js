import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService.js';

export const useOrders = (initialPage = 0, initialSize = 10) => {
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

  const fetchOrders = useCallback(async (page = pagination.number, size = pagination.size) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.myOrders(page, size);
      
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
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.number, pagination.size]);

  const loadPage = useCallback((page) => {
    fetchOrders(page, pagination.size);
  }, [fetchOrders, pagination.size]);

  const refresh = useCallback(() => {
    setSearchResult(null);
    fetchOrders(pagination.number, pagination.size);
  }, [fetchOrders, pagination.number, pagination.size]);

  const setSearchOrder = useCallback((order) => {
    setSearchResult(order);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

    const displayOrders = searchResult ? [searchResult] : orders;

  return {
    orders: displayOrders,
    loading,
    error,
    pagination,
    fetchOrders,
    loadPage,
    refresh,
    setSearchOrder
  };
};
