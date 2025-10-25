import React from 'react';

const PaymentItemSkeleton = () => {
    return (
        <div className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className="h-5 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-right space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    
                    <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                </div>
            </div>
        </div>
    );
};

export default PaymentItemSkeleton;
