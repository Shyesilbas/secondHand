import { useCallback, useMemo, useState } from 'react';
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

 const hasActiveFilters = useMemo(
 () => Object.values(filters).some((value) => value !== ''),
 [filters]
 );

 const handleFilterChange = useCallback((key, value) => {
 setFilters((prev) => ({ ...prev, [key]: value }));
 }, []);

 const clearFilters = useCallback(() => {
 setFilters(DEFAULT_PAYMENT_FILTERS);
 }, []);

 const closeReceipt = useCallback(() => setSelectedPayment(null), []);

 const handlePageChange = useCallback((page) => {
 setCurrentPage(page);
 }, []);

 const handlePageSizeChange = useCallback((newPageSize) => {
 setCurrentPage(0);
 setPageSize(newPageSize);
 }, []);

 const { data, isLoading, error: queryError, refetch } = usePaymentsQuery({
 userId: user?.id,
 currentPage,
 pageSize,
 filters,
 });

 const payments = useMemo(() => data?.payments || [], [data]);
 const error = queryError?.response?.data?.message || queryError?.message || null;
 const totalFilteredPages = data?.pagination?.totalPages || 0;
 const shouldShowPagination = totalFilteredPages > 1;

 return {
 payments,
 isLoading,
 error,
 refetch,
 currentPage,
 pageSize,
 totalPages: totalFilteredPages,
 totalElements: data?.pagination?.totalElements || 0,
 selectedPayment,
 isReceiptModalOpen: !!selectedPayment,
 filters,
 showFilters,
 hasActiveFilters,
 shouldShowPagination,
 handleFilterChange: (key, value) => {
 handleFilterChange(key, value);
 setCurrentPage(0);
 },
 clearFilters: () => {
 clearFilters();
 setCurrentPage(0);
 },
 showReceipt: setSelectedPayment,
 closeReceipt,
 handlePageChange,
 handlePageSizeChange,
 setShowFilters
 };
};
