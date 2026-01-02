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
        <div 
            className="rounded-card shadow-card border overflow-hidden"
            style={{
                backgroundColor: 'var(--page-card-background, #ffffff)',
                borderColor: 'var(--page-card-border, #e2e8f0)'
            }}
        >
            <div 
                className="px-6 py-4 border-b"
                style={{ borderColor: 'var(--page-table-border, #e2e8f0)' }}
            >
                <h3 
                    className="text-lg font-semibold"
                    style={{ color: 'var(--page-table-header-text, #1e293b)' }}
                >
                    Recent Transactions ({payments.length})
                </h3>
            </div>

            <div 
                className="divide-y"
                style={{ borderColor: 'var(--page-table-border, #e2e8f0)' }}
            >
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
