import React from 'react';
import { formatCurrency, formatDateTime, resolveEnumLabel } from '../../common/formatters.js';

const OrderItem = React.memo(({
    order,
    enums,
    onOpenOrderModal,
    onOpenReceipt,
    getStatusColor,
    getEstimatedDeliveryTime
}) => {
    return (
        <div 
            className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer" 
            onClick={() => onOpenOrderModal(order)}
        >
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                {resolveEnumLabel(enums, 'listingStatuses', order.status)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-lg text-gray-900">{formatCurrency(order.totalAmount, order.currency)}</p>
                        {order.paymentReference && (
                            <button
                                className="text-sm text-gray-600 hover:text-gray-900 mt-1"
                                onClick={(e) => { e.stopPropagation(); onOpenReceipt(order.paymentReference); }}
                            >
                                View receipt →
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6 text-sm mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Payment:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.paymentStatus)}`}>
                            {resolveEnumLabel(enums, 'paymentStatuses', order.paymentStatus) || order.paymentStatus}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Shipping:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.shippingStatus)}`}>
                            {resolveEnumLabel(enums, 'shippingStatuses', order.shippingStatus)}
                        </span>
                    </div>
                    {getEstimatedDeliveryTime(order) && (
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {getEstimatedDeliveryTime(order)}
                        </div>
                    )}
                </div>

                {order.orderItems && order.orderItems.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                        <div className="space-y-3">
                            {order.orderItems.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.listing?.imageUrl ? (
                                            <img
                                                src={item.listing.imageUrl}
                                                alt={item.listing.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center ${item.listing?.imageUrl ? 'hidden' : 'flex'}`}>
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.listing?.title || item.listing?.listingNo}</p>
                                        <p className="text-xs text-gray-500 mt-1">×{item.quantity} • {formatCurrency(item.totalPrice, order.currency)}</p>
                                    </div>
                                </div>
                            ))}
                            {order.orderItems.length > 2 && (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-medium text-gray-600">+{order.orderItems.length - 2}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">+{order.orderItems.length - 2} more items</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default OrderItem;
