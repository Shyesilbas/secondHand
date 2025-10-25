import React from 'react';
import {useNavigate} from 'react-router-dom';
import PaymentReceiptModal from '../common/components/modals/PaymentReceiptModal.jsx';
import PaymentFilters from './components/PaymentFilters.jsx';
import PaymentList from './components/PaymentList.jsx';
import PaymentPagination from './components/PaymentPagination.jsx';
import PaymentInfo from './components/PaymentInfo.jsx';
import {usePayments} from './hooks/usePayments.js';

const PaymentsPage = () => {
    const navigate = useNavigate();
    const {
        payments,
        allPayments,
        filteredPayments,
        isLoading,
        error,
        currentPage,
        pageSize,
        totalPages,
        selectedPayment,
        isReceiptModalOpen,
        filters,
        showFilters,
        hasActiveFilters,
        shouldShowPagination,
        handleFilterChange,
        clearFilters,
        showReceipt,
        closeReceipt,
        handlePageChange,
        handlePageSizeChange,
        setShowFilters
    } = usePayments();

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-card-bg rounded-card shadow-card border p-6">
                                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-text-primary transition-colors mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <h1 className="text-3xl font-bold text-text-primary">
                    Payment History
                </h1>
                <p className="text-text-secondary mt-2">
                    View all your payment transactions
                </p>
            </div>

            <PaymentInfo />

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            <PaymentFilters
                filters={filters}
                showFilters={showFilters}
                hasActiveFilters={hasActiveFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                filteredPayments={filteredPayments}
                allPayments={allPayments}
            />

            <PaymentList
                payments={payments}
                onShowReceipt={showReceipt}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                isLoading={isLoading}
            />

            {shouldShowPagination && (
                <PaymentPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={filteredPayments.length}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            <PaymentReceiptModal
                isOpen={isReceiptModalOpen}
                onClose={closeReceipt}
                payment={selectedPayment}
            />
        </div>
    );
};

export default PaymentsPage;
