import { useState, useCallback } from 'react';
import { orderService } from '../services/orderService.js';

export const useOrdersModal = (fetchReviewsData) => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderModalOpen, setOrderModalOpen] = useState(false);

    const openOrderModal = useCallback(async (order) => {
        try {
            const freshOrder = await orderService.getById(order.id);
            setSelectedOrder(freshOrder);
            setOrderModalOpen(true);
            
            await fetchReviewsData(freshOrder);
        } catch (error) {
            console.error('Error fetching order:', error);
            setSelectedOrder(order);
            setOrderModalOpen(true);
        }
    }, [fetchReviewsData]);

    const closeOrderModal = useCallback(() => {
        setOrderModalOpen(false);
        setSelectedOrder(null);
    }, []);

    return {
        selectedOrder,
        setSelectedOrder,
        orderModalOpen,
        openOrderModal,
        closeOrderModal
    };
};
