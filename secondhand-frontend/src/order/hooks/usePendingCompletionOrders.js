import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService.js';

export const usePendingCompletionOrders = () => {
  const [hasPendingOrders, setHasPendingOrders] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    checkPendingOrders();
    
    const interval = setInterval(checkPendingOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { hasPendingOrders, loading };
};

