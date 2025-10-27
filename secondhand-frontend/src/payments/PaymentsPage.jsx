import React from 'react';
import {useNavigate} from 'react-router-dom';
import { ArrowLeftIcon, DocumentTextIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-8">
                        {/* Header skeleton */}
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        
                        {/* Stats skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Table skeleton */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                            </div>
                                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                                <span className="text-sm font-medium">Back</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Payment History
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Track and manage your payment transactions
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors ${
                                    showFilters || hasActiveFilters
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <FunnelIcon className="w-4 h-4 mr-2" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-white text-gray-900 rounded-full">
                                        !
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payment Statistics */}
                <div className="mb-8">
                    <PaymentInfo />
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <XMarkIcon className="w-5 h-5 text-red-400 mr-3" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">Error loading payments</h3>
                                <p className="text-sm text-red-600 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Section */}
                {showFilters && (
                    <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
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
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                                <h2 className="text-lg font-medium text-gray-900">
                                    Transactions
                                </h2>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {filteredPayments.length} {filteredPayments.length === 1 ? 'payment' : 'payments'}
                                </span>
                            </div>
                            
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <XMarkIcon className="w-4 h-4 mr-1" />
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Payment List */}
                    <div className="divide-y divide-gray-200">
                        <PaymentList
                            payments={payments}
                            onShowReceipt={showReceipt}
                            hasActiveFilters={hasActiveFilters}
                            onClearFilters={clearFilters}
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                {/* Pagination */}
                {shouldShowPagination && (
                    <div className="mt-6">
                        <PaymentPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalItems={filteredPayments.length}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    </div>
                )}

                {/* Receipt Modal */}
                <PaymentReceiptModal
                    isOpen={isReceiptModalOpen}
                    onClose={closeReceipt}
                    payment={selectedPayment}
                />
            </div>
        </div>
    );
};

export default PaymentsPage;
