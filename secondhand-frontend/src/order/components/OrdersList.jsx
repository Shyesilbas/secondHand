import React from 'react';
import OrderItem from './OrderItem.jsx';

const OrdersList = React.memo(({
    orders,
    enums,
    onOpenOrderModal,
    onOpenReceipt,
    getStatusColor,
    getEstimatedDeliveryTime
}) => {
    return (
        <div className="space-y-3">
            {orders.map(order => (
                <OrderItem
                    key={order.id}
                    order={order}
                    enums={enums}
                    onOpenOrderModal={onOpenOrderModal}
                    onOpenReceipt={onOpenReceipt}
                    getStatusColor={getStatusColor}
                    getEstimatedDeliveryTime={getEstimatedDeliveryTime}
                />
            ))}
        </div>
    );
});

export default OrdersList;
