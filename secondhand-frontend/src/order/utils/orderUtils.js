export const getEstimatedDeliveryTime = (order) => {
    if (order.shippingStatus === 'DELIVERED' || order.shippingStatus === 'CANCELLED') {
        return null;
    }

    if (order.estimatedTransitDate && order.estimatedDeliveryDate) {
        const now = new Date();
        const transitDate = new Date(order.estimatedTransitDate);
        const deliveryDate = new Date(order.estimatedDeliveryDate);

        if (now < transitDate) {
            const hoursUntilTransit = Math.ceil((transitDate - now) / (1000 * 60 * 60));
            return `Est. in transit in ${hoursUntilTransit}h`;
        } else if (now < deliveryDate) {
            const hoursUntilDelivery = Math.ceil((deliveryDate - now) / (1000 * 60 * 60));
            return `Est. delivery in ${hoursUntilDelivery}h`;
        } else {
            return 'Est. delivery: Soon';
        }
    }

    return null;
};

export const getStatusColor = (status) => {
    const colors = {
        'PENDING': 'text-amber-700 bg-amber-50',
        'CONFIRMED': 'text-blue-700 bg-blue-50',
        'PROCESSING': 'text-indigo-700 bg-indigo-50',
        'SHIPPED': 'text-purple-700 bg-purple-50',
        'DELIVERED': 'text-green-700 bg-green-50',
        'CANCELLED': 'text-red-700 bg-red-50',
        'PAID': 'text-green-700 bg-green-50',
        'UNPAID': 'text-orange-700 bg-orange-50',
        'REFUNDED': 'text-gray-700 bg-gray-50'
    };
    return colors[status] || 'text-gray-700 bg-gray-50';
};
