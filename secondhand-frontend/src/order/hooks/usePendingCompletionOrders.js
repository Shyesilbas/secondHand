import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { orderService } from '../services/orderService.js';

export const usePendingCompletionOrders = (options = {}) => {
  const [hasPendingOrders, setHasPendingOrders] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const intervalRef = useRef(null);
  const enabled = options.enabled !== false;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const checkPendingOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.myOrders(0, 100);
        const data = response.data || response;
        const orders = data.content || [];
        
        const hasDeliveredNotCompleted = orders.some(
          order => order.status === 'DELIVERED'
        );
        
        setHasPendingOrders(hasDeliveredNotCompleted);
      } catch (error) {
        console.error('Error checking pending completion orders:', error);
        setHasPendingOrders(false);
      } finally {
        setLoading(false);
      }
    };

    const isRelevantPage = location.pathname.includes('/orders') || 
                           location.pathname.includes('/dashboard') ||
                           location.pathname === '/';

    checkPendingOrders();
    
    if (isRelevantPage) {
      intervalRef.current = setInterval(checkPendingOrders, 120000);
    } else {
      intervalRef.current = setInterval(checkPendingOrders, 300000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [location.pathname, enabled]);

  return { hasPendingOrders, loading };
};

