import { useState, useEffect, useMemo, useCallback } from 'react';
import { paymentService } from '../services/paymentService.js';
import { orderService } from '../../order/services/orderService.js';
import { PAYMENT_TRANSACTION_TYPES } from '../payments.js';

export const usePayments = () => {
    const [payments, setPayments] = useState([]);
    const [allPayments, setAllPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ordersMap, setOrdersMap] = useState(new Map());
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

    const fetchPayments = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const [paymentsData, ordersData] = await Promise.all([
                paymentService.getMyPayments(0, 1000),
                orderService.myOrders(0, 100)
            ]);
            
            const payments = paymentsData.content || [];
            const orders = ordersData.data?.content || ordersData.content || [];
            
            const map = new Map();
            orders.forEach(order => {
                if (order.paymentReference) {
                    map.set(order.paymentReference, order);
                }
            });
            setOrdersMap(map);
            
            const enrichedPayments = payments.map(payment => {
                if (payment.transactionType === PAYMENT_TRANSACTION_TYPES.ITEM_PURCHASE && payment.paymentId) {
                    const order = map.get(String(payment.paymentId));
                    if (order && order.orderItems) {
                        return {
                            ...payment,
                            orderItems: order.orderItems.map(item => item.listing?.title).filter(Boolean)
                        };
                    }
                }
                return payment;
            });
            
            setAllPayments(enrichedPayments);
            
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while loading payment history');
            setAllPayments([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const filteredPayments = useMemo(() => {
        if (!allPayments.length) return [];
        
        return allPayments.filter(payment => {
            if (filters.seller && payment.receiverName) {
                const sellerName = `${payment.receiverName} ${payment.receiverSurname || ''}`.toLowerCase();
                if (!sellerName.includes(filters.seller.toLowerCase())) return false;
            }
            
            if (filters.transactionType && payment.transactionType !== filters.transactionType) {
                return false;
            }
            
            if (filters.paymentType && payment.paymentType !== filters.paymentType) {
                return false;
            }
            
            if (filters.paymentDirection && payment.paymentDirection !== filters.paymentDirection) {
                return false;
            }
            
            if (filters.dateFrom || filters.dateTo) {
                const paymentDate = new Date(payment.createdAt);
                if (filters.dateFrom && paymentDate < new Date(filters.dateFrom)) return false;
                if (filters.dateTo && paymentDate > new Date(filters.dateTo + 'T23:59:59')) return false;
            }
            
            if (filters.amountMin && payment.amount < parseFloat(filters.amountMin)) return false;
            if (filters.amountMax && payment.amount > parseFloat(filters.amountMax)) return false;
            
            return true;
        });
    }, [allPayments, filters]);

    const paginatedPayments = useMemo(() => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredPayments.slice(startIndex, endIndex);
    }, [filteredPayments, currentPage, pageSize]);

    const totalFilteredPages = Math.ceil(filteredPayments.length / pageSize);
    const hasActiveFilters = Object.values(filters).some(value => value !== '');
    const shouldShowPagination = filteredPayments.length > pageSize;

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

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    return {
        payments: paginatedPayments,
        allPayments,
        filteredPayments,
        isLoading,
        error,
        currentPage,
        pageSize,
        totalPages: totalFilteredPages,
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
