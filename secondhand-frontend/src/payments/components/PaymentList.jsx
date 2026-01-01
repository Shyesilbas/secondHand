import React from 'react';
import PaymentItem from './PaymentItem.jsx';
import PaymentListSkeleton from './PaymentListSkeleton.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { BanknotesIcon } from '@heroicons/react/24/outline';

const PaymentList = React.memo(({ payments, onShowReceipt, hasActiveFilters, onClearFilters, isLoading }) => {
    if (isLoading) {
        return <PaymentListSkeleton />;
    }

    if (payments.length === 0) {
        return (
            <EmptyState
                icon={BanknotesIcon}
                title={hasActiveFilters ? 'No Payments Match Your Filters' : 'No Payment Found'}
                description={hasActiveFilters 
                    ? 'Try adjusting your filters to see more results.' 
                    : "You haven't made any payments yet."
                }
                primaryAction={hasActiveFilters ? {
                    label: 'Clear All Filters',
                    onClick: onClearFilters
                } : undefined}
                className="bg-card-bg border-0 shadow-card"
            />
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
