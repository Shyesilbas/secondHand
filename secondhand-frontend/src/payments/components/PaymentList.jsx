import React from 'react';
import PaymentItem from './PaymentItem.jsx';
import PaymentListSkeleton from './PaymentListSkeleton.jsx';

const PaymentList = React.memo(({ payments, onShowReceipt, hasActiveFilters, onClearFilters, isLoading }) => {
    if (isLoading) {
        return <PaymentListSkeleton />;
    }

    if (payments.length === 0) {
        return (
            <div className="bg-card-bg rounded-card shadow-card border p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                    {hasActiveFilters ? 'No Payments Match Your Filters' : 'No Payment Found'}
                </h3>
                <p className="text-text-secondary mb-6">
                    {hasActiveFilters 
                        ? 'Try adjusting your filters to see more results.' 
                        : "You haven't made any payments yet."
                    }
                </p>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Clear All Filters
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-card-bg rounded-card shadow-card border overflow-hidden">
            <div className="px-6 py-4 border-b border-sidebar-border">
                <h3 className="text-lg font-semibold text-text-primary">
                    Recent Transactions ({payments.length})
                </h3>
            </div>

            <div className="divide-y divide-gray-200">
                {payments.map((payment, index) => (
                    <PaymentItem
                        key={payment.paymentId || index}
                        payment={payment}
                        onShowReceipt={onShowReceipt}
                    />
                ))}
            </div>
        </div>
    );
});

export default PaymentList;
