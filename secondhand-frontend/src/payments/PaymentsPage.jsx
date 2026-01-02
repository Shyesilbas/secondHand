import React from 'react';
import {useNavigate} from 'react-router-dom';
import { ArrowLeftIcon, DocumentTextIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePageTheme } from '../common/theme/usePageTheme.js';
import { PaymentsPageTheme } from './themes/PaymentsPage.theme.js';
import PaymentReceiptModal from '../common/components/modals/PaymentReceiptModal.jsx';
import PaymentFilters from './components/PaymentFilters.jsx';
import PaymentList from './components/PaymentList.jsx';
import PaymentPagination from './components/PaymentPagination.jsx';
import PaymentInfo from './components/PaymentInfo.jsx';
import {usePayments} from './hooks/usePayments.js';

const PaymentsPage = () => {
    usePageTheme(PaymentsPageTheme);
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
            <div 
                className="min-h-screen"
                style={{ backgroundColor: 'var(--page-page-background, #f1f5f9)' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-8">
                        {/* Header skeleton */}
                        <div className="space-y-4">
                            <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
                            <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                        </div>
                        
                        {/* Stats skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="rounded-lg border p-6"
                                    style={{
                                        backgroundColor: 'var(--page-stats-card-background, #ffffff)',
                                        borderColor: 'var(--page-stats-card-border, #e2e8f0)'
                                    }}
                                >
                                    <div className="h-4 bg-secondary-200 rounded w-1/3 mb-2"></div>
                                    <div className="h-8 bg-secondary-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Table skeleton */}
                        <div 
                            className="rounded-lg border overflow-hidden"
                            style={{
                                backgroundColor: 'var(--page-card-background, #ffffff)',
                                borderColor: 'var(--page-card-border, #e2e8f0)'
                            }}
                        >
                            <div 
                                className="p-6 border-b"
                                style={{ borderColor: 'var(--page-table-border, #e2e8f0)' }}
                            >
                                <div className="h-6 bg-secondary-200 rounded w-1/4"></div>
                            </div>
                            <div 
                                className="divide-y"
                                style={{ borderColor: 'var(--page-table-border, #e2e8f0)' }}
                            >
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
        <div 
            className="min-h-screen"
            style={{ backgroundColor: 'var(--page-page-background, #f1f5f9)' }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center transition-colors"
                                style={{
                                    color: 'var(--page-back-button-text, #475569)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.color = 'var(--page-back-button-hover, #0f172a)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.color = 'var(--page-back-button-text, #475569)';
                                }}
                            >
                                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                                <span className="text-sm font-medium">Back</span>
                            </button>
                            <div 
                                className="h-6 w-px"
                                style={{ backgroundColor: 'var(--page-header-border, #cbd5e1)' }}
                            ></div>
                            <div>
                                <h1 
                                    className="text-2xl font-semibold"
                                    style={{ color: 'var(--page-header-text-primary, #0f172a)' }}
                                >
                                    Payment History
                                </h1>
                                <p 
                                    className="text-sm mt-1"
                                    style={{ color: 'var(--page-header-text-secondary, #475569)' }}
                                >
                                    Track and manage your payment transactions
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: showFilters || hasActiveFilters
                                        ? 'var(--page-filter-button, #4f46e5)'
                                        : 'var(--page-card-background, #ffffff)',
                                    color: showFilters || hasActiveFilters
                                        ? 'var(--page-filter-button-text, #ffffff)'
                                        : 'var(--page-header-text-secondary, #475569)',
                                    borderColor: showFilters || hasActiveFilters
                                        ? 'var(--page-filter-button, #4f46e5)'
                                        : 'var(--page-card-border, #e2e8f0)',
                                }}
                                onMouseEnter={(e) => {
                                    if (!showFilters && !hasActiveFilters) {
                                        e.target.style.backgroundColor = 'var(--page-table-row-hover, #f8fafc)';
                                    } else {
                                        e.target.style.backgroundColor = 'var(--page-filter-button-hover, #4338ca)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!showFilters && !hasActiveFilters) {
                                        e.target.style.backgroundColor = 'var(--page-card-background, #ffffff)';
                                    } else {
                                        e.target.style.backgroundColor = 'var(--page-filter-button, #4f46e5)';
                                    }
                                }}
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
                    <div 
                        className="mb-6 rounded-lg shadow-sm"
                        style={{
                            backgroundColor: 'var(--page-card-background, #ffffff)',
                            borderColor: 'var(--page-card-border, #e2e8f0)',
                            borderWidth: '1px',
                            borderStyle: 'solid'
                        }}
                    >
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
                <div 
                    className="rounded-lg shadow-sm overflow-hidden"
                    style={{
                        backgroundColor: 'var(--page-card-background, #ffffff)',
                        borderColor: 'var(--page-card-border, #e2e8f0)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                    }}
                >
                    {/* Table Header */}
                    <div 
                        className="px-6 py-4 border-b"
                        style={{
                            backgroundColor: 'var(--page-table-header-background, #f8fafc)',
                            borderColor: 'var(--page-table-border, #e2e8f0)'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <DocumentTextIcon 
                                    className="w-5 h-5"
                                    style={{ color: 'var(--page-header-text-secondary, #475569)' }}
                                />
                                <h2 
                                    className="text-lg font-medium"
                                    style={{ color: 'var(--page-table-header-text, #1e293b)' }}
                                >
                                    Transactions
                                </h2>
                                <span 
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    style={{
                                        backgroundColor: 'var(--page-table-header-background, #f8fafc)',
                                        color: 'var(--page-table-header-text, #1e293b)'
                                    }}
                                >
                                    {filteredPayments.length} {filteredPayments.length === 1 ? 'payment' : 'payments'}
                                </span>
                            </div>
                            
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors"
                                    style={{
                                        color: 'var(--page-header-text-secondary, #475569)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.color = 'var(--page-header-text-primary, #0f172a)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.color = 'var(--page-header-text-secondary, #475569)';
                                    }}
                                >
                                    <XMarkIcon className="w-4 h-4 mr-1" />
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Payment List */}
                    <div 
                        className="divide-y"
                        style={{ borderColor: 'var(--page-table-border, #e2e8f0)' }}
                    >
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
