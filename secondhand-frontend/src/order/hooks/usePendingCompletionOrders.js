import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { orderService } from '../services/orderService.js';

export const usePendingCompletionOrders = (options = {}) => {
  const [hasPendingOrders, setHasPendingOrders] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const intervalRef = useRef(null);
  const enabled = options.enabled !== false;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const checkPendingOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getPendingCompletionStatus();
        setHasPendingOrders(response.hasPendingOrders || false);
        setPendingCount(response.pendingCount || 0);
      } catch (error) {
        console.error('Error checking pending completion orders:', error);
        setHasPendingOrders(false);
        setPendingCount(0);
      } finally {
        setLoading(false);
      }
    };

    const isRelevantPage = location.pathname.includes('/orders') || 
                           location.pathname.includes('/dashboard') ||
                           location.pathname === '/';

    checkPendingOrders();
    
    const interval = isRelevantPage ? 120000 : 300000;
    intervalRef.current = setInterval(checkPendingOrders, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [location.pathname, enabled]);

  return { hasPendingOrders, pendingCount, loading };
};

