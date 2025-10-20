import { useState, useEffect } from 'react';
import {
  createRefundRequest,
  getRefundRequest,
  getUserRefundRequests,
  getOrderRefundRequests,
  cancelRefundRequest,
  canCancelOrder,
  canCancelOrderItem
} from '../services/refundService';

/**
 * Custom hook for refund requests
 */
export const useRefunds = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRefund = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const refund = await createRefundRequest(data);
      return refund;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred while creating the refund request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelRefund = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await cancelRefundRequest(id);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred while cancelling the refund request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createRefund,
    cancelRefund
  };
};

/**
 * Hook for fetching a single refund request
 */
export const useRefundRequest = (id) => {
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchRefund = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRefundRequest(id);
        setRefund(data);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while loading the refund request');
      } finally {
        setLoading(false);
      }
    };

    fetchRefund();
  }, [id]);

  return { refund, loading, error };
};

/**
 * Hook for fetching all user's refund requests
 */
export const useUserRefundRequests = (params = {}) => {
  const [refunds, setRefunds] = useState({ content: [], totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRefunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserRefundRequests(params);
      setRefunds(data);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while loading refund requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [JSON.stringify(params)]);

  return { refunds, loading, error, refetch: fetchRefunds };
};

/**
 * Hook for fetching order refund requests
 */
export const useOrderRefundRequests = (orderId, params = {}) => {
  const [refunds, setRefunds] = useState({ content: [], totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchRefunds = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrderRefundRequests(orderId, params);
        setRefunds(data);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while loading refund requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, [orderId, JSON.stringify(params)]);

  return { refunds, loading, error };
};

/**
 * Hook for cancellation eligibility check
 */
export const useCancellationCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkOrderCancellation = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const canCancel = await canCancelOrder(orderId);
      return canCancel;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during the check');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkOrderItemCancellation = async (orderItemId) => {
    setLoading(true);
    setError(null);
    try {
      const canCancel = await canCancelOrderItem(orderItemId);
      return canCancel;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during the check');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    checkOrderCancellation,
    checkOrderItemCancellation
  };
};


