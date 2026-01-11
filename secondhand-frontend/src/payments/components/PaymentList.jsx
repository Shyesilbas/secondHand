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
            <div className="bg-white border border-gray-200/60 rounded-lg p-12 text-center">
                <BanknotesIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-xs font-medium text-gray-500 mb-1">
                    {hasActiveFilters ? 'No Payments Match Your Filters' : 'No Payment Found'}
                </p>
                <p className="text-[11px] text-gray-400">
                    {hasActiveFilters 
                        ? 'Try adjusting your filters to see more results.' 
                        : "You haven't made any payments yet."
                    }
                </p>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="mt-4 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        Clear All Filters
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {payments.map((payment, index) => (
                <PaymentItem
                    key={payment.paymentId || index}
                    payment={payment}
                    onShowReceipt={onShowReceipt}
                />
            ))}
        </div>
    );
});

export default PaymentList;
