import React from 'react';
import PaymentItemSkeleton from './PaymentItemSkeleton.jsx';

const PaymentListSkeleton = () => {
    return (
        <div className="bg-card-bg rounded-card shadow-card border overflow-hidden">
            <div className="px-6 py-4 border-b border-sidebar-border">
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>

            <div className="divide-y divide-gray-200">
                {[...Array(5)].map((_, index) => (
                    <PaymentItemSkeleton key={index} />
                ))}
            </div>
        </div>
    );
};

export default PaymentListSkeleton;
