import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService.js';
import { orderService } from '../../order/services/orderService.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { PAYMENT_TRANSACTION_TYPES } from '../payments.js';

const PAYMENTS_KEYS = {
    all: ['payments'],
    myPayments: () => [...PAYMENTS_KEYS.all, 'my'],
    withOrders: () => [...PAYMENTS_KEYS.myPayments(), 'withOrders'],
};

export const usePayments = () => {
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    
    const [filters, setFilters] = useState({
        seller: '',
        transactionType: '',
        paymentType: '',
        dateFrom: '',
        dateTo: '',
        amountMin: '',
        amountMax: '',
        paymentDirection: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    const {
        data,
        isLoading,
        error: queryError,
        refetch
    } = useQuery({
        queryKey: [...PAYMENTS_KEYS.withOrders(), currentPage, pageSize, filters],
        queryFn: async () => {
            const [paymentsData, ordersData] = await Promise.all([
                paymentService.getMyPayments(currentPage, pageSize, filters),
                orderService.myOrders(0, 5)
            ]);
            
            const payments = paymentsData.content || [];
            const orders = ordersData.data?.content || ordersData.content || [];
            
            const ordersMap = new Map();
            orders.forEach(order => {
                if (order.paymentReference) {
                    ordersMap.set(order.paymentReference, order);
                }
            });
            
            const enrichedPayments = payments.map(payment => {
                if (payment.transactionType === PAYMENT_TRANSACTION_TYPES.ITEM_PURCHASE && payment.paymentId) {
                    const order = ordersMap.get(String(payment.paymentId));
                    if (order && order.orderItems) {
                        return {
                            ...payment,
                            orderItems: order.orderItems.map(item => item.listing?.title).filter(Boolean)
                        };
                    }
                }
                return payment;
            });
            
            return {
                payments: enrichedPayments,
                pagination: {
                    totalElements: paymentsData.totalElements || 0,
                    totalPages: paymentsData.totalPages || 0,
                    number: paymentsData.number || currentPage,
                    size: paymentsData.size || pageSize
                }
            };
        },
        enabled: !!user,
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    });

    const allPayments = useMemo(() => data?.payments || [], [data]);
    const error = queryError?.response?.data?.message || queryError?.message || null;

    const filteredPayments = allPayments;
    const paginatedPayments = allPayments;
    const totalFilteredPages = data?.pagination?.totalPages || 0;
    const shouldShowPagination = totalFilteredPages > 1;

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(0);
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            seller: '',
            transactionType: '',
            paymentType: '',
            dateFrom: '',
            dateTo: '',
            amountMin: '',
            amountMax: '',
            paymentDirection: ''
        });
        setCurrentPage(0);
    }, []);

    const showReceipt = useCallback((payment) => {
        setSelectedPayment(payment);
        setIsReceiptModalOpen(true);
    }, []);

    const closeReceipt = useCallback(() => {
        setIsReceiptModalOpen(false);
        setSelectedPayment(null);
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handlePageSizeChange = useCallback((newPageSize) => {
        setCurrentPage(0);
        setPageSize(newPageSize);
    }, []);

    const fetchPayments = useCallback(() => {
        refetch();
    }, [refetch]);

    return {
        payments: paginatedPayments,
        allPayments,
        filteredPayments,
        isLoading,
        error,
        currentPage,
        pageSize,
        totalPages: totalFilteredPages,
        totalElements: data?.pagination?.totalElements || 0,
        selectedPayment,
        isReceiptModalOpen,
        filters,
        showFilters,
        hasActiveFilters,
        shouldShowPagination,
        fetchPayments,
        handleFilterChange,
        clearFilters,
        showReceipt,
        closeReceipt,
        handlePageChange,
        handlePageSizeChange,
        setShowFilters
    };
};
