import React from 'react';

const OrdersHeader = React.memo(() => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-600 mt-1">Track and manage your purchases</p>
            </div>
        </div>
    );
});

export default OrdersHeader;
