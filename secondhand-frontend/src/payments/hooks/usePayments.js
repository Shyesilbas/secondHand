import { useCallback, useMemo, useEffect, useState } from 'react';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { DEFAULT_PAYMENT_FILTERS } from '../paymentSchema.js';
import { usePaymentsQuery } from './queries.js';

export const usePayments = () => {
    const { user } = useAuthState();
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [filters, setFilters] = useState(DEFAULT_PAYMENT_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

    const hasActiveFilters = useMemo(
        () => Object.values(filters).some((value) => value !== ''),
        [filters]
    );

    const resetPagination = useCallback(() => {
        setCurrentPage(0);
        setPageSize(5);
    }, []);

    const handleFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(DEFAULT_PAYMENT_FILTERS);
    }, []);

    const showReceipt = useCallback((payment) => {
        setSelectedPayment(payment);
        setIsReceiptModalOpen(true);
    }, []);

    const closeReceipt = useCallback(() => {
        setIsReceiptModalOpen(false);
        setSelectedPayment(null);
    }, []);

    const resetReceiptState = useCallback(() => {
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
        resetPagination();
        resetReceiptState();
        setFilters(DEFAULT_PAYMENT_FILTERS);
    }, [user?.id]);

    const { data, isLoading, error: queryError, refetch } = usePaymentsQuery({
        userId: user?.id,
        currentPage,
        pageSize,
        filters,
    });

    const allPayments = useMemo(() => data?.payments || [], [data]);
    const error = queryError?.response?.data?.message || queryError?.message || null;

    const filteredPayments = allPayments;
    const paginatedPayments = allPayments;
    const totalFilteredPages = data?.pagination?.totalPages || 0;
    const shouldShowPagination = totalFilteredPages > 1;

    const fetchPayments = refetch;

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
        handleFilterChange: (key, value) => {
            handleFilterChange(key, value);
            setCurrentPage(0);
        },
        clearFilters: () => {
            clearFilters();
            setCurrentPage(0);
        },
        showReceipt,
        closeReceipt,
        handlePageChange,
        handlePageSizeChange,
        setShowFilters
    };
};
