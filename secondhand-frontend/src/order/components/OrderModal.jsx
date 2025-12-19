import React from 'react';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { ReviewButton } from '../../reviews/index.js';
import { getEstimatedDeliveryTime, getStatusColor } from '../utils/orderUtils.js';

const OrderModal = React.memo(({
    isOpen,
    selectedOrder,
    orderReviews,
    onClose,
    onOpenReceipt,
    onReviewSuccess
}) => {
    if (!isOpen || !selectedOrder) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Order #{selectedOrder.orderNumber}</h3>
                                <p className="text-sm text-gray-600 mt-1">{formatDateTime(selectedOrder.createdAt)}</p>
                            </div>
                        </div>
                        <button
                            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Order Status</p>
                            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                                {selectedOrder.status}
                            </span>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Payment</p>
                            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.paymentStatus)}`}>
                                {selectedOrder.paymentStatus}
                            </span>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Shipping</p>
                            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.shippingStatus)}`}>
                                {selectedOrder.shippingStatus}
                            </span>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Total</p>
                            <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}</p>
                            {(selectedOrder.campaignDiscount > 0 || selectedOrder.couponDiscount > 0) && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Saved {formatCurrency(selectedOrder.discountTotal || (selectedOrder.campaignDiscount + selectedOrder.couponDiscount), selectedOrder.currency)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-900">Discount Summary</h4>
                            {selectedOrder.couponCode && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    Coupon: {selectedOrder.couponCode}
                                </span>
                            )}
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(selectedOrder.subtotal != null ? selectedOrder.subtotal : selectedOrder.totalAmount, selectedOrder.currency)}
                                    </span>
                                </div>
                                {selectedOrder.campaignDiscount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Campaign discount</span>
                                        <span className="font-semibold text-emerald-700">
                                            -{formatCurrency(selectedOrder.campaignDiscount, selectedOrder.currency)}
                                        </span>
                                    </div>
                                )}
                                {selectedOrder.couponDiscount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Coupon discount</span>
                                        <span className="font-semibold text-emerald-700">
                                            -{formatCurrency(selectedOrder.couponDiscount, selectedOrder.currency)}
                                        </span>
                                    </div>
                                )}
                                {(selectedOrder.campaignDiscount > 0 || selectedOrder.couponDiscount > 0) && (
                                    <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-3">
                                        <span className="text-gray-600">Discount total</span>
                                        <span className="font-semibold text-emerald-700">
                                            -{formatCurrency(selectedOrder.discountTotal || (selectedOrder.campaignDiscount + selectedOrder.couponDiscount), selectedOrder.currency)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-base font-semibold border-t border-gray-200 pt-3">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-gray-900">{formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {getEstimatedDeliveryTime(selectedOrder) && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-amber-800">Delivery Update</p>
                                    <p className="text-xs text-amber-700 mt-1">{getEstimatedDeliveryTime(selectedOrder)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedOrder.estimatedTransitDate && selectedOrder.estimatedDeliveryDate && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-800 mb-3">Shipping Timeline</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-700">Estimated In Transit:</span>
                                    <span className="font-medium text-blue-900">{formatDateTime(selectedOrder.estimatedTransitDate)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-700">Estimated Delivery:</span>
                                    <span className="font-medium text-blue-900">{formatDateTime(selectedOrder.estimatedDeliveryDate)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h4>
                            {selectedOrder.shippingAddress ? (
                                <div className="text-sm text-gray-600 space-y-2">
                                    <div className="font-medium text-gray-900">{selectedOrder.shippingAddress.addressLine}</div>
                                    <div>{selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</div>
                                    <div className="text-gray-500">{selectedOrder.shippingAddress.country}</div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Not provided</p>
                            )}
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h4>
                            {selectedOrder.billingAddress ? (
                                <div className="text-sm text-gray-600 space-y-2">
                                    <div className="font-medium text-gray-900">{selectedOrder.billingAddress.addressLine}</div>
                                    <div>{selectedOrder.billingAddress.city} {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.postalCode}</div>
                                    <div className="text-gray-500">{selectedOrder.billingAddress.country}</div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Same as shipping</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900">Order Items</h4>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {(selectedOrder.orderItems || []).map((item, idx) => (
                                <div key={idx} className="p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-lg font-semibold text-gray-900 mb-2">{item.listing?.title || item.listing?.listingNo}</h5>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500">Listing ID: <span className="font-medium text-gray-700">{item.listing?.listingNo || item.listing?.id}</span></p>
                                                {item.campaignName && (
                                                    <p className="text-sm text-emerald-700 font-medium">
                                                        Campaign: <span className="font-semibold">{item.campaignName}</span>
                                                        {item.campaignDiscountAmount > 0 && (
                                                            <span className="text-emerald-800"> (−{formatCurrency(item.campaignDiscountAmount, selectedOrder.currency)} / unit)</span>
                                                        )}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-600">
                                                    Unit Price: <span className="font-medium text-gray-900">{formatCurrency(item.unitPrice, selectedOrder.currency)}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Quantity: <span className="font-medium text-gray-900">{item.quantity}</span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-3">
                                            <p className="text-xl font-bold text-gray-900">{formatCurrency(item.totalPrice, selectedOrder.currency)}</p>
                                            
                                            <ReviewButton
                                                orderItem={{ ...item, shippingStatus: selectedOrder.shippingStatus }}
                                                existingReview={orderReviews[item.id]}
                                                onReviewCreated={onReviewSuccess}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{selectedOrder.notes || 'No notes provided'}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Reference</h4>
                            <div className="space-y-3">
                                <p className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">{selectedOrder.paymentReference || '—'}</p>
                                {selectedOrder.paymentReference && (
                                    <button
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        onClick={() => onOpenReceipt(selectedOrder.paymentReference)}
                                    >
                                        View Receipt
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default OrderModal;
